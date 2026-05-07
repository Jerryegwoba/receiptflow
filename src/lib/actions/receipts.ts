"use server";

import { createServerClient } from "@/lib/supabase/server";
import { createClient } from "@/lib/supabase/client";
import { extractedReceiptSchema } from "@/lib/validators/receipt";
import { Anthropic } from "@anthropic-ai/sdk";
import { getReportData, groupByCategory } from "@/lib/actions/reports";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// Initialize Anthropic client (server-side only)
function getAnthropicClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not configured");
  return new Anthropic({ apiKey });
}

type UploadResult = {
  error?: string;
  success?: boolean;
  receiptId?: string;
} | null;

interface ProfileCheck {
  subscription_tier: "free" | "pro";
  receipt_count_this_month: number;
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
    .select("subscription_tier, receipt_count_this_month")
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

    // Trigger AI extraction (async - we'll do it inline for now)
    extractReceiptData(receipt.id, imageUrl);

    revalidatePath("/receipts");
    return { success: true, receiptId: receipt.id };
  } catch (error) {
    return {
      error:
        `Upload failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

// This runs as a background-like operation
async function extractReceiptData(receiptId: string, imageUrl: string) {
  try {
    const supabase = await createServerClient();
    const anthropic = getAnthropicClient();

    // Fetch the image
    const imageResponse = await fetch(imageUrl);
    const imageBuffer = await imageResponse.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString("base64");
    const mediaType = imageResponse.headers.get("content-type") || "image/jpeg";

    // Call Claude for receipt extraction
    const message = await anthropic.messages.create({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType as any,
                data: base64Image,
              },
            },
            {
              type: "text",
              text: `Extract the following information from this receipt image. Return ONLY a valid JSON object with these fields:
- merchant: (string) the merchant/store name
- date: (string) the transaction date in ISO format (YYYY-MM-DD)
- amount: (number) the total amount as a number (no currency symbols)
- currency: (string) the 3-letter currency code (e.g., USD, EUR, GBP)
- category: (string) one of: Software & Tools, Marketing, Office Supplies, Travel & Transport, Meals & Entertainment, Professional Services, Equipment, Utilities, Rent, Miscellaneous
- confidence: (number) your confidence score from 0-100
- notes: (string, optional) any unusual observations

If you cannot read the receipt clearly, set confidence below 50 and note the issue in notes.`,
            },
          ],
        },
      ],
    });

    // Parse the response
    const contentBlock = message.content[0];
    if (contentBlock.type !== "text") {
      throw new Error("Unexpected response type from AI");
    }

    const extractedText = contentBlock.text;
    const jsonMatch = extractedText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No valid JSON found in AI response");
    }

    const parsed = JSON.parse(jsonMatch[0]);
    const validated = extractedReceiptSchema.parse(parsed);

    // Update receipt with extracted data
    await (supabase
      .from("receipts") as any)
      .update({
        extracted_data: validated as any,
        status: "processed",
      })
      .eq("id", receiptId);
  } catch (error) {
    // Update receipt status to failed
    const supabase = await createServerClient();
    await (supabase
      .from("receipts") as any)
      .update({ status: "failed" })
      .eq("id", receiptId);
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
