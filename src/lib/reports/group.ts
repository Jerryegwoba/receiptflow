import type { Database } from "@/types/supabase";

type ReceiptRow = Database["public"]["Tables"]["receipts"]["Row"];

export function groupByCategory(receipts: ReceiptRow[]) {
  const groups: Record<string, { total: number; count: number; items: ReceiptRow[] }> = {};

  receipts.forEach((receipt) => {
    const data = receipt.extracted_data as Record<string, unknown> | null;
    const category = (data?.category as string) || "Miscellaneous";

    if (!groups[category]) {
      groups[category] = { total: 0, count: 0, items: [] };
    }

    const amount = typeof data?.amount === "number" ? data.amount : 0;
    groups[category].total += amount;
    groups[category].count += 1;
    groups[category].items.push(receipt);
  });

  return groups;
}
