"use server";

import { createServerClient } from "@/lib/supabase/server";
import { extractedReceiptSchema } from "@/lib/validators/receipt";
import { getReportData } from "@/lib/actions/reports";
import { groupByCategory } from "@/lib/reports/group";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

type UploadResult = {
  error?: string;
  success?: boolean;
  receiptId?: string;
} | null;

interface ProfileCheck {
  subscription_tier: "free" | "pro";
  receipt_count_this_month: number;
  updated_at: string;
}

export async function uploadReceipt(
  _prevState: UploadResult,
  formData: FormData
): Promise<UploadResult> {
  const supabase = await createServerClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // Check subscription limits
  const { data: profileData } = await (supabase
    .from("profiles") as any)
    .select("subscription_tier, receipt_count_this_month, updated_at")
    .eq("user_id", user.id)
    .single();

  const profile = profileData as ProfileCheck | null;

  if (
    profile &&
    profile.subscription_tier === "free" &&
    (profile.receipt_count_this_month ?? 0) >= 10
  ) {
    return {
      error:
        "Free tier limit reached (10 receipts/month). Upgrade to Pro for unlimited.",
    };
  }

  // Get file from form
  const file = formData.get("receipt") as File;
  if (!file || file.size === 0) {
    return { error: "No file selected. Please choose a receipt image." };
  }

  // Validate file type
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/heic"];
  if (!allowedTypes.includes(file.type)) {
    return { error: "Invalid file type. Please upload a JPEG, PNG, WebP, or HEIC image." };
  }

  // Validate file size (10MB max)
  if (file.size > 10 * 1024 * 1024) {
    return { error: "File too large. Maximum size is 10MB." };
  }

  try {
    // Reset monthly count if we've entered a new month
    if (profile) {
      await resetMonthlyCountIfNeeded(supabase, user.id, profile.updated_at);
    }

    // Upload to Supabase Storage
    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    const { data: uploadData, error: uploadError } = await (supabase.storage
      .from("receipts") as any)
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      return { error: `Upload failed: ${uploadError.message}` };
    }

    // Get public URL
    const { data: urlData } = (supabase.storage
      .from("receipts") as any)
      .getPublicUrl(fileName);

    const imageUrl = urlData.publicUrl;

    // Create receipt record with "pending" status
    const { data: receipt, error: dbError } = await (supabase
      .from("receipts") as any)
      .insert({
        user_id: user.id,
        image_url: imageUrl,
        status: "pending",
      })
      .select()
      .single();

    if (dbError) {
      return { error: `Database error: ${dbError.message}` };
    }

    // Increment receipt count for the month
    await (supabase.rpc as any)("increment_receipt_count", {
      user_id_input: user.id,
    });

    // Trigger AI extraction via API route (fire-and-forget)
    fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/ai`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ receiptId: receipt.id, imageUrl }),
    }).catch((err) => console.error("AI extraction trigger failed:", err));

    revalidatePath("/receipts");
    return { success: true, receiptId: receipt.id };
  } catch (error) {
    return {
      error:
        `Upload failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

async function resetMonthlyCountIfNeeded(
  supabase: any,
  userId: string,
  updatedAt: string
): Promise<void> {
  const lastUpdate = new Date(updatedAt);
  const now = new Date();
  const lastMonth = lastUpdate.getMonth();
  const lastYear = lastUpdate.getFullYear();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  if (lastYear < currentYear || lastMonth < currentMonth) {
    await supabase
      .from("profiles")
      .update({
        receipt_count_this_month: 0,
        updated_at: now.toISOString(),
      })
      .eq("user_id", userId);
  }
}

export async function deleteReceipt(receiptId: string) {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // Get receipt to check ownership and get image path
  const { data: receipt } = await (supabase
    .from("receipts") as any)
    .select("image_url, user_id")
    .eq("id", receiptId)
    .single();

  if (!receipt || receipt.user_id !== user.id) {
    return { error: "Receipt not found or access denied." };
  }

  // Extract file path from URL and delete from storage
  const url = new URL(receipt.image_url);
  const pathMatch = url.pathname.match(/\/receipts\/(.+)$/);
  if (pathMatch) {
    await supabase.storage.from("receipts").remove([pathMatch[1]]);
  }

  // Delete receipt record
  const { error } = await (supabase
    .from("receipts") as any)
    .delete()
    .eq("id", receiptId)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/receipts");
  return { success: true };
}

export async function updateReceipt(
  receiptId: string,
  updateData: Partial<{
    merchant: string;
    date: string;
    amount: number;
    currency: string;
    category: string;
    notes: string;
  }>
) {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { error } = await (supabase
    .from("receipts") as any)
    .update({
      extracted_data: updateData,
    })
    .eq("id", receiptId)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/receipts");
  return { success: true };
}
