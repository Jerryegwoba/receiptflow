import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { ReceiptDetail } from "@/components/receipts/receipt-detail"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import type { Database } from "@/types/supabase"

type ReceiptRow = Database["public"]["Tables"]["receipts"]["Row"]

export default async function ReceiptDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: receipt } = await (supabase
    .from("receipts") as any)
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (!receipt) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="mb-4 text-muted-foreground">Receipt not found.</p>
        <Link href="/receipts">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Receipts
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <ReceiptDetail receipt={receipt as ReceiptRow} />
    </div>
  )
}
