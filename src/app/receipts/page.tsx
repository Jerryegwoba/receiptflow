import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { Receipt, Plus, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { Database } from "@/types/supabase";
import { DeleteButton } from "@/components/receipts/delete-button";

type ReceiptRow = Database["public"]["Tables"]["receipts"]["Row"];

export default async function ReceiptsPage() {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: receipts } = await (supabase
    .from("receipts") as any)
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false }) as { data: ReceiptRow[] | null };

  const receiptList: ReceiptRow[] = receipts ?? [];

  function getConfidence(receipt: ReceiptRow): number {
    const data = receipt.extracted_data as Record<string, unknown> | null;
    if (data && typeof data.confidence === "number") return data.confidence;
    return 0;
  }

  function getConfidenceColor(confidence: number) {
    if (confidence >= 80) return "bg-green-100 text-green-700";
    if (confidence >= 50) return "bg-yellow-100 text-yellow-700";
    return "bg-red-100 text-red-700";
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Receipts</h1>
          <p className="text-sm text-muted-foreground">
            {receiptList.length} receipt{receiptList.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <Link href="/receipts/upload">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Upload Receipt
          </Button>
        </Link>
      </div>

      {receiptList.length > 0 ? (
        <div className="rounded-lg border">
          <div className="divide-y">
            {receiptList.map((receipt) => {
              const confidence = getConfidence(receipt);
              return (
                <Link
                  key={receipt.id}
                  href={`/receipts/${receipt.id}`}
                  className="flex items-center justify-between p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <Receipt className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">
                        {typeof receipt.extracted_data === 'object' && receipt.extracted_data !== null && 'merchant' in receipt.extracted_data
                          ? String((receipt.extracted_data as Record<string, unknown>).merchant)
                          : "Processing..."}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {receipt.created_at
                          ? new Date(receipt.created_at).toLocaleDateString()
                          : "—"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-semibold">
                        {typeof receipt.extracted_data === 'object' && receipt.extracted_data !== null && 'amount' in receipt.extracted_data
                          ? `$${(receipt.extracted_data as Record<string, unknown>).amount}`
                          : "—"}
                      </p>
                      {receipt.status === "processed" && confidence > 0 && (
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${getConfidenceColor(confidence)}`}>
                          <BarChart3 className="h-3 w-3" />
                          {confidence}%
                        </span>
                      )}
                    </div>
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs ${
                        receipt.status === "processed"
                          ? "bg-green-100 text-green-700"
                          : receipt.status === "failed"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {receipt.status}
                    </span>
                    <DeleteButton receiptId={receipt.id} />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Receipt className="mb-4 h-12 w-12 text-muted-foreground/50" />
          <h3 className="mb-1 text-lg font-semibold">No receipts yet</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Upload your first receipt to get started.
          </p>
          <Link href="/receipts/upload">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Upload Receipt
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
