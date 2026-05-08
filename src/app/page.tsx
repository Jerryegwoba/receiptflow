import Link from "next/link";
import { Receipt, ArrowRight, Upload, FileText, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Receipt className="h-6 w-6 text-primary" />
            <span className="font-bold">ReceiptFlow</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/auth/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <section className="container mx-auto flex flex-col items-center px-4 py-24 text-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Receipt className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Turn receipts into
            <br />
            <span className="text-primary">tax-ready data</span>
          </h1>
          <p className="mt-4 max-w-[600px] text-lg text-muted-foreground">
            Snap a photo, let AI extract the details, and export clean expense reports
            for tax season. Built for freelancers and solopreneurs.
          </p>
          <div className="mt-8 flex gap-4">
            <Link href="/pricing">
              <Button size="lg">
                View Pricing <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button variant="outline" size="lg">
                Start Free
              </Button>
            </Link>
          </div>
        </section>

        {/* Features */}
        <section className="container mx-auto px-4 py-16">
          <div className="grid gap-6 sm:grid-cols-3">
            <Card className="flex flex-col items-center p-6 text-center">
              <Upload className="mb-4 h-10 w-10 text-primary" />
              <h3 className="mb-2 font-semibold">Snap & Upload</h3>
              <p className="text-sm text-muted-foreground">
                Upload receipt photos from any device. Mobile-first design for on-the-go
                expense tracking.
              </p>
            </Card>
            <Card className="flex flex-col items-center p-6 text-center">
              <FileText className="mb-4 h-10 w-10 text-primary" />
              <h3 className="mb-2 font-semibold">AI Extraction</h3>
              <p className="text-sm text-muted-foreground">
                Claude AI automatically extracts merchant, date, amount, and tax
                category from every receipt.
              </p>
            </Card>
            <Card className="flex flex-col items-center p-6 text-center">
              <BarChart3 className="mb-4 h-10 w-10 text-primary" />
              <h3 className="mb-2 font-semibold">Export Reports</h3>
              <p className="text-sm text-muted-foreground">
                Generate monthly expense reports in CSV or PDF. Tax categories
                already sorted for you.
              </p>
            </Card>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-6">
        <div className="container flex justify-center px-4 text-sm text-muted-foreground">
          © 2026 ReceiptFlow. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
