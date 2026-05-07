export function generateCSV(receipts: Array<{ extracted_data: any; image_url: string; created_at: string }>) {
  const headers = ["Date", "Merchant", "Amount", "Currency", "Category", "Notes"];

  const rows = receipts.map((receipt) => {
    const data = receipt.extracted_data || {};
    return [
      data.date || receipt.created_at?.split("T")[0] || "",
      data.merchant || "",
      data.amount ?? "",
      data.currency || "",
      data.category || "Miscellaneous",
      data.notes || "",
    ];
  });

  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
    ),
  ].join("\n");

  return csvContent;
}
