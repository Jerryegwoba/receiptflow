import Link from "next/link";
import { Receipt, ArrowRight, Upload, FileText, BarChart3, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import PricingSection6 from "@/components/ui/pricing-section-4";
import { Sparkles as SparklesComp } from "@/components/ui/sparkles";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-black">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-black/95 backdrop-blur">
        <div className="container flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Receipt className="h-6 w-6 text-primary" />
            <span className="font-bold">ReceiptFlow</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/auth/login">
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero with Sparkles Background */}
      <main className="flex-1 relative">
        <div className="absolute inset-0 overflow-hidden">
          <SparklesComp
            density={1200}
            speed={1}
            color="#8350e8"
            className="absolute inset-0"
          />
        </div>

        <section className="container mx-auto flex flex-col items-center px-4 py-24 text-center relative z-10">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Receipt className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Turn receipts into
            <br />
            <span className="text-primary">tax-ready data</span>
          </h1>
          <p className="mt-4 max-w-[600px] text-lg text-gray-300">
            Snap a photo, let AI extract the details, and export clean expense reports
            for tax season. Built for freelancers and solopreneurs.
          </p>
          <div className="mt-8 flex gap-4">
            <Link href="/auth/signup">
              <Button size="lg" className="bg-gradient-to-r from-blue-500 to-blue-600">
                Start Free <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>

        {/* Features */}
        <section className="container mx-auto px-4 py-16 relative z-10">
          <div className="grid gap-6 sm:grid-cols-3">
            <Card className="flex flex-col items-center p-6 text-center bg-neutral-900/50 border-neutral-800 backdrop-blur-sm">
              <Upload className="mb-4 h-10 w-10 text-primary" />
              <h3 className="mb-2 font-semibold text-white">Snap & Upload</h3>
              <p className="text-sm text-gray-400">
                Upload receipt photos from any device. Mobile-first design for on-the-go
                expense tracking.
              </p>
            </Card>
            <Card className="flex flex-col items-center p-6 text-center bg-neutral-900/50 border-neutral-800 backdrop-blur-sm">
              <FileText className="mb-4 h-10 w-10 text-primary" />
              <h3 className="mb-2 font-semibold text-white">AI Extraction</h3>
              <p className="text-sm text-gray-400">
                Claude AI automatically extracts merchant, date, amount, and tax
                category from every receipt.
              </p>
            </Card>
            <Card className="flex flex-col items-center p-6 text-center bg-neutral-900/50 border-neutral-800 backdrop-blur-sm">
              <BarChart3 className="mb-4 h-10 w-10 text-primary" />
              <h3 className="mb-2 font-semibold text-white">Export Reports</h3>
              <p className="text-sm text-gray-400">
                Generate monthly expense reports in CSV or PDF. Tax categories
                already sorted for you.
              </p>
            </Card>
          </div>
        </section>

        {/* How it Works */}
        <section className="container mx-auto px-4 py-16 relative z-10">
          <h2 className="mb-8 text-center text-3xl font-bold text-white">How it Works</h2>
          <div className="grid gap-8 md:grid-cols-3 max-w-4xl mx-auto">
            {[
              { step: "1", title: "Upload", desc: "Snap a photo or upload your receipt from any device" },
              { step: "2", title: "AI Extracts", desc: "Claude AI pulls merchant, date, amount, and category automatically" },
              { step: "3", title: "Export", desc: "Download clean CSV or PDF reports ready for your accountant" },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
                  {item.step}
                </div>
                <h3 className="mb-2 font-semibold text-white">{item.title}</h3>
                <p className="text-sm text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing Section - Animated */}
        <div className="relative z-10">
          <PricingSection6 />
        </div>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-16 text-center relative z-10">
          <h2 className="mb-4 text-3xl font-bold text-white">Ready to simplify your expenses?</h2>
          <p className="mb-8 text-lg text-gray-300">Join freelancers who trust ReceiptFlow for tax-ready expense tracking.</p>
          <Link href="/auth/signup">
            <Button size="lg" className="bg-gradient-to-r from-blue-500 to-blue-600">
              Get Started for Free <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-800 py-6 relative z-10">
        <div className="container flex justify-center px-4 text-sm text-gray-500">
          © 2026 ReceiptFlow. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
