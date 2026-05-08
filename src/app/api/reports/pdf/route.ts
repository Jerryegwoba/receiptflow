import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { getReportData } from "@/lib/actions/reports";
import { groupByCategory } from "@/lib/reports/group";
import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";
import { renderToStream } from "@react-pdf/renderer";
import { Readable } from "stream";
import React from "react";

Font.register({
  family: "Inter",
  fonts: [
    { src: "https://fonts.gstatic.com/s/inter/v12/UcC73FwrK3iLTeHuS_nVMrMxCp0U.woff2" },
  ],
});

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#fff",
    padding: 40,
    fontFamily: "Inter",
  },
  header: {
    marginBottom: 30,
    borderBottomWidth: 2,
    borderBottomColor: "#10b981",
    paddingBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111",
  },
  subtitle: {
    fontSize: 12,
    color: "#666",
    marginTop: 5,
  },
  table: {
    display: "flex",
    flexDirection: "column",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    padding: 8,
  },
  tableHeader: {
    backgroundColor: "#f9fafb",
    fontWeight: "bold",
  },
  cell: {
    flex: 1,
    fontSize: 10,
    padding: 4,
  },
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get("start") || "";
  const endDate = searchParams.get("end") || "";

  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const receipts = await getReportData({ startDate, endDate });
  const categoryGroups = groupByCategory(receipts as any);

  const totalAmount = receipts.reduce((sum, r) => {
    const amt = (r.extracted_data as any)?.amount || 0;
    return sum + (typeof amt === "number" ? amt : 0);
  }, 0);

  function formatAmount(val: unknown): string {
    const num = typeof val === "number" ? val : 0;
    return num.toFixed(2);
  }

  const categoryRows = Object.entries(categoryGroups).map(([cat, data]) =>
    React.createElement(View, { style: styles.tableRow, key: cat },
      React.createElement(Text, { style: [styles.cell, { flex: 2 }] }, cat),
      React.createElement(Text, { style: styles.cell }, String((data as any).count)),
      React.createElement(Text, { style: [styles.cell, { textAlign: "right" }] }, `$${(data as any).total.toFixed(2)}`),
    )
  );

  const receiptRows = receipts.map((receipt, i) => {
    const data = (receipt.extracted_data as any) || {};
    return React.createElement(View, { style: styles.tableRow, key: i },
      React.createElement(Text, { style: [styles.cell, { flex: 2 }] }, data?.date || receipt.created_at?.split("T")[0] || ""),
      React.createElement(Text, { style: [styles.cell, { flex: 3 }] }, data?.merchant || "—"),
      React.createElement(Text, { style: styles.cell }, data?.category || "Miscellaneous"),
      React.createElement(Text, { style: [styles.cell, { textAlign: "right" }] }, `$${formatAmount(data?.amount)}`),
    );
  });

  const element = React.createElement(Document, { title: "Expense Report" },
    React.createElement(Page, { size: "A4", style: styles.page },
      React.createElement(View, { style: styles.header },
        React.createElement(Text, { style: styles.title }, "ReceiptFlow Expense Report"),
        React.createElement(Text, { style: styles.subtitle }, `${startDate} to ${endDate} • ${receipts.length} receipts • Total: $${totalAmount.toFixed(2)}`),
      ),
      React.createElement(View, { style: { marginBottom: 20 } },
        React.createElement(Text, { style: { fontSize: 14, fontWeight: "bold", color: "#10b981", marginBottom: 10, textTransform: "uppercase" } }, "Category Summary"),
        React.createElement(View, { style: styles.table },
          React.createElement(View, { style: [styles.tableRow, styles.tableHeader] },
            React.createElement(Text, { style: [styles.cell, { flex: 2 }] }, "Category"),
            React.createElement(Text, { style: styles.cell }, "Count"),
            React.createElement(Text, { style: [styles.cell, { textAlign: "right" }] }, "Total"),
          ),
          categoryRows,
        ),
      ),
      React.createElement(View, { style: { marginBottom: 20 } },
        React.createElement(Text, { style: { fontSize: 14, fontWeight: "bold", color: "#10b981", marginBottom: 10, textTransform: "uppercase" } }, "Receipt Details"),
        React.createElement(View, { style: styles.table },
          React.createElement(View, { style: [styles.tableRow, styles.tableHeader] },
            React.createElement(Text, { style: [styles.cell, { flex: 2 }] }, "Date"),
            React.createElement(Text, { style: [styles.cell, { flex: 3 }] }, "Merchant"),
            React.createElement(Text, { style: styles.cell }, "Category"),
            React.createElement(Text, { style: [styles.cell, { textAlign: "right" }] }, "Amount"),
          ),
          receiptRows,
        ),
      ),
    ),
  );

  const stream = await renderToStream(element);

  const readable = Readable.from(stream as any);

  return new NextResponse(readable as any, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="expense-report-${Date.now()}.pdf"`,
    },
  });
}
