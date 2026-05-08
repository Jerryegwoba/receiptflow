import PricingSection6 from "@/components/ui/pricing-section-4";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto max-w-5xl px-4 py-8">
        <Link href="/" className="mb-6 inline-flex">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </div>
      <PricingSection6 />
    </div>
  );
}
