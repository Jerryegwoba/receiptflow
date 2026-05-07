import * as React from "react";
import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";

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
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#10b981",
    marginBottom: 10,
    textTransform: "uppercase",
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
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 8,
    borderTopWidth: 2,
    borderTopColor: "#10b981",
    marginTop: 10,
  },
  summaryText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    color: "#9ca3af",
    fontSize: 10,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 10,
  },
  categorySection: {
    marginBottom: 15,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 5,
  },
});

interface ReceiptData {
  extracted_data: any;
  created_at: string;
  image_url: string;
}

interface ReportPDFProps {
  receipts: ReceiptData[];
  startDate: string;
  endDate: string;
  categoryGroups: Record<string, { total: number; count: number; items: ReceiptData[] }>;
}

export function ReportPDF({ receipts, startDate, endDate, categoryGroups }: ReportPDFProps) {
  const totalAmount = receipts.reduce((sum, r) => {
    const amt = r.extracted_data?.amount || 0;
    return sum + (typeof amt === "number" ? amt : 0);
  }, 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>ReceiptFlow Expense Report</Text>
          <Text style={styles.subtitle}>
            {startDate} to {endDate} • {receipts.length} receipts • Total: ${totalAmount.toFixed(2)}
          </Text>
        </View>

        {/* Category Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Category Summary</Text>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.cell, { flex: 2 }]}>Category</Text>
              <Text style={styles.cell}>Count</Text>
              <Text style={[styles.cell, { textAlign: "right" }]}>Total</Text>
            </View>
            {Object.entries(categoryGroups).map(([cat, data]) => (
              <View key={cat} style={styles.tableRow}>
                <Text style={[styles.cell, { flex: 2 }]}>{cat}</Text>
                <Text style={styles.cell}>{data.count}</Text>
                <Text style={[styles.cell, { textAlign: "right" }]}>
                  ${data.total.toFixed(2)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Receipt List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Receipt Details</Text>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.cell, { flex: 2 }]}>Date</Text>
              <Text style={[styles.cell, { flex: 3 }]}>Merchant</Text>
              <Text style={styles.cell}>Category</Text>
              <Text style={[styles.cell, { textAlign: "right" }]}>Amount</Text>
            </View>
            {receipts.map((receipt, i) => (
              <View key={i} style={styles.tableRow}>
                <Text style={[styles.cell, { flex: 2 }]}>
                  {receipt.extracted_data?.date || receipt.created_at?.split("T")[0] || ""}
                </Text>
                <Text style={[styles.cell, { flex: 3 }]}>
                  {receipt.extracted_data?.merchant || "—"}
                </Text>
                <Text style={styles.cell}>
                  {receipt.extracted_data?.category || "Miscellaneous"}
                </Text>
                <Text style={[styles.cell, { textAlign: "right" }]}>
                  ${(receipt.extracted_data?.amount || 0).toFixed(2)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Generated by ReceiptFlow on {new Date().toLocaleDateString()}
        </Text>
      </Page>
    </Document>
  );
}
