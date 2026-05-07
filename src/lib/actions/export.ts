"use server";

import { getReportData } from "@/lib/actions/reports";
import { generateCSV } from "@/lib/reports/csv-export";
import { NextResponse } from "next/server";

export async function exportCSV(formData: FormData) {
  "use server";

  const startDate = formData.get("start") as string || "";
  const endDate = formData.get("end") as string || "";

  const receipts = await getReportData({ startDate, endDate });
  const csv = generateCSV(receipts as any);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="expense-report-${Date.now()}.csv"`,
    },
  });
}
