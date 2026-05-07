"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Receipt, Pencil, Check, X, Trash2, ArrowLeft, Calendar, DollarSign, Tag, FileText, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { deleteReceipt, updateReceipt } from "@/lib/actions/receipts"
import type { Database } from "@/types/supabase"

type ReceiptRow = Database["public"]["Tables"]["receipts"]["Row"]

interface ReceiptDetailProps {
  receipt: ReceiptRow
}

const taxCategories = [
  "Software & Tools",
  "Marketing",
  "Office Supplies",
  "Travel & Transport",
  "Meals & Entertainment",
  "Professional Services",
  "Equipment",
  "Utilities",
  "Rent",
  "Miscellaneous",
]

export function ReceiptDetail({ receipt }: ReceiptDetailProps) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const [deleteError, setDeleteError] = useState("")

  const extracted = (receipt.extracted_data || {}) as Record<string, unknown>
  const confidence = typeof extracted.confidence === "number" ? extracted.confidence : 0

  const [formData, setFormData] = useState({
    merchant: (extracted.merchant as string) || "",
    date: (extracted.date as string) || "",
    amount: String(extracted.amount ?? ""),
    currency: (extracted.currency as string) || "USD",
    category: (extracted.category as string) || "Miscellaneous",
    notes: (extracted.notes as string) || "",
  })

  const confidenceColor =
    confidence >= 80 ? "text-green-600 bg-green-50" :
    confidence >= 50 ? "text-yellow-600 bg-yellow-50" :
    "text-red-600 bg-red-50"

  async function handleSave() {
    setIsPending(true)
    const amountNum = parseFloat(formData.amount)
    if (isNaN(amountNum)) {
      setIsPending(false)
      return
    }

    const result = await updateReceipt(receipt.id, {
      merchant: formData.merchant,
      date: formData.date,
      amount: amountNum,
      currency: formData.currency,
      category: formData.category,
      notes: formData.notes,
    })

    setIsPending(false)

    if (result?.error) {
      alert(result.error)
      return
    }

    setIsEditing(false)
    router.refresh()
  }

  async function handleDelete() {
    const result = await deleteReceipt(receipt.id)
    if (result?.error) {
      setDeleteError(result.error)
      return
    }
    router.push("/receipts")
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Receipts
        </Button>
        <div className="flex gap-2">
          {!isEditing ? (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave} disabled={isPending}>
                <Check className="mr-2 h-4 w-4" />
                {isPending ? "Saving..." : "Save"}
              </Button>
            </>
          )}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this receipt?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. The receipt image and all extracted data will be permanently deleted.
                </AlertDialogDescription>
              </AlertDialogHeader>
              {deleteError && (
                <p className="text-sm text-destructive">{deleteError}</p>
              )}
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Receipt Image + Status */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border overflow-hidden">
          <img
            src={receipt.image_url}
            alt="Receipt"
            className="w-full object-contain bg-muted/20"
          />
        </div>

        <div className="space-y-4">
          {/* Status & Confidence */}
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                receipt.status === "processed"
                  ? "bg-green-100 text-green-700"
                  : receipt.status === "failed"
                    ? "bg-red-100 text-red-700"
                    : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {receipt.status}
            </span>
            {receipt.status === "processed" && (
              <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium ${confidenceColor}`}>
                <BarChart3 className="h-4 w-4" />
                {confidence}% confidence
              </span>
            )}
          </div>

          {/* Fields */}
          <div className="space-y-4">
            {/* Merchant */}
            <div className="space-y-1">
              <Label htmlFor="merchant">Merchant</Label>
              {isEditing ? (
                <Input
                  id="merchant"
                  value={formData.merchant}
                  onChange={(e) => setFormData({ ...formData, merchant: e.target.value })}
                />
              ) : (
                <p className="text-lg font-semibold">{formData.merchant || "—"}</p>
              )}
            </div>

            {/* Date */}
            <div className="space-y-1">
              <Label htmlFor="date" className="flex items-center gap-1">
                <Calendar className="h-4 w-4" /> Date
              </Label>
              {isEditing ? (
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              ) : (
                <p>{formData.date || "—"}</p>
              )}
            </div>

            {/* Amount & Currency */}
            <div className="space-y-1">
              <Label className="flex items-center gap-1">
                <DollarSign className="h-4 w-4" /> Amount
              </Label>
              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="w-32"
                    />
                    <Input
                      value={formData.currency}
                      onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                      className="w-20"
                      maxLength={3}
                    />
                  </>
                ) : (
                  <p className="text-xl font-bold">
                    {formData.currency} {formData.amount || "—"}
                  </p>
                )}
              </div>
            </div>

            {/* Category */}
            <div className="space-y-1">
              <Label className="flex items-center gap-1">
                <Tag className="h-4 w-4" /> Category
              </Label>
              {isEditing ? (
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {taxCategories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              ) : (
                <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">
                  {formData.category || "—"}
                </span>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-1">
              <Label className="flex items-center gap-1">
                <FileText className="h-4 w-4" /> Notes
              </Label>
              {isEditing ? (
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  rows={3}
                />
              ) : (
                <p className="text-sm text-muted-foreground">{formData.notes || "—"}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Created Date */}
      <p className="text-xs text-muted-foreground">
        Uploaded {new Date(receipt.created_at).toLocaleString()}
      </p>
    </div>
  )
}
