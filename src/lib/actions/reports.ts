"use server";

import { createServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/supabase";

type ReceiptRow = Database["public"]["Tables"]["receipts"]["Row"];

interface ReportFilters {
  startDate: string;
  endDate: string;
}

export async function getReportData(filters: ReportFilters) {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  let query = (supabase)
    .from("receipts")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "processed");

  if (filters.startDate) {
    query = query.gte("created_at", filters.startDate);
  }
  if (filters.endDate) {
    query = query.lte("created_at", filters.endDate);
  }

  const { data: receipts } = await (query as any)
    .order("created_at", { ascending: true });

  return receipts as ReceiptRow[];
}
