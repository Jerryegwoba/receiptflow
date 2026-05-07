import Link from "next/link";
import { ArrowLeft, UploadCloud } from "lucide-react";
import { ReceiptUpload } from "@/components/receipts/receipt-upload";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function UploadReceiptPage() {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <Link href="/receipts">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Receipts
          </Button>
        </Link>
      </div>

      <div className="mb-6 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <UploadCloud className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-2xl font-bold">Upload Receipt</h1>
        <p className="text-sm text-muted-foreground">
          Snap a photo or upload an image. Our AI will extract the details
          automatically.
        </p>
      </div>

      <Card className="p-6">
        <ReceiptUpload />
      </Card>

      <div className="mt-6 space-y-2 text-center text-xs text-muted-foreground">
        <p>
          Supported formats: JPEG, PNG, WebP, HEIC (max 10MB)
        </p>
        <p>
          Your receipt images are encrypted and stored securely.
        </p>
      </div>
    </div>
  );
}
