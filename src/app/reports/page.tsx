import { redirect } from "next/navigation";
import { getReportData } from "@/lib/actions/reports";
import { groupByCategory } from "@/lib/reports/group";
import { generateCSV } from "@/lib/reports/csv-export";
import { exportCSV } from "@/lib/actions/export";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Download, FileSpreadsheet, FileText } from "lucide-react";
import Link from "next/link";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ start?: string; end?: string }>;
}) {
  const params = await searchParams;

  const startDate = params?.start || "";
  const endDate = params?.end || "";

  // Fetch receipts for the report
  const receipts = await getReportData({ startDate, endDate });
  const categoryGroups = groupByCategory(receipts as any);

  // Calculate totals
  const totalAmount = receipts.reduce((sum, r) => {
    const amt = (r.extracted_data as any)?.amount || 0;
    return sum + (typeof amt === "number" ? amt : 0);
  }, 0);

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6">
        <Link href="/receipts">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Receipts
          </Button>
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold">Expense Reports</h1>
        <p className="text-sm text-muted-foreground">
          Generate CSV or PDF reports for tax season
        </p>
      </div>

      {/* Filters */}
      <Card className="mb-6 p-6">
        <form className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-1">
            <Label htmlFor="start">Start Date</Label>
            <Input
              id="start"
              name="start"
              type="date"
              defaultValue={startDate}
            />
          </div>
          <div className="flex-1 space-y-1">
            <Label htmlFor="end">End Date</Label>
            <Input
              id="end"
              name="end"
              type="date"
              defaultValue={endDate}
            />
          </div>
          <Button type="submit" variant="secondary">
            Apply Filter
          </Button>
        </form>
      </Card>

      {receipts.length === 0 ? (
        <div className="py-16 text-center">
          <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
          <h3 className="mb-1 text-lg font-semibold">No receipts found</h3>
          <p className="text-sm text-muted-foreground">
            Try adjusting your date filter or upload more receipts.
          </p>
        </div>
      ) : (
        <>
          {/* Summary Stats */}
          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            <Card className="p-4">
              <p className="text-sm text-muted-foreground">Total Expenses</p>
              <p className="text-2xl font-bold">${totalAmount.toFixed(2)}</p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-muted-foreground">Receipts</p>
              <p className="text-2xl font-bold">{receipts.length}</p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-muted-foreground">Categories</p>
              <p className="text-2xl font-bold">{Object.keys(categoryGroups).length}</p>
            </Card>
          </div>

          {/* Category Breakdown */}
          <Card className="mb-6 p-6">
            <h2 className="mb-4 text-lg font-semibold">Expenses by Category</h2>
            <div className="space-y-3">
              {Object.entries(categoryGroups).map(([cat, data]) => (
                <div key={cat} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{cat}</p>
                    <p className="text-sm text-muted-foreground">
                      {data.count} receipt{data.count !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <p className="text-lg font-semibold">
                    ${data.total.toFixed(2)}
                  </p>
                </div>
              ))}
              <div className="border-t pt-3">
                <div className="flex items-center justify-between font-bold">
                  <p>Total</p>
                  <p>${totalAmount.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Export Buttons */}
          <div className="flex gap-3">
            <form action={exportCSV as any}>
              <input type="hidden" name="start" value={startDate} />
              <input type="hidden" name="end" value={endDate} />
              <Button type="submit" variant="outline">
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Download CSV
              </Button>
            </form>

            <a
              href={`/api/reports/pdf?start=${startDate}&end=${endDate}`}
              target="_blank"
              rel="noreferrer"
            >
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
            </a>
          </div>
        </>
      )}
    </div>
  );
}
