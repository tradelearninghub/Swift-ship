import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";
import { getCompanyProfile } from "@/lib/settings";

export default async function HowItWorksPage() {
  const profile = await getCompanyProfile();
  const companyName = profile.company_name || "SS Courier service";

  const steps = [
    {
      num: "01",
      title: "Step 1: Submit Booking Request Online",
      description:
        "Enter pickup and delivery address details, parcel category, estimated weight, dimensions (L x W x H), and select your payment mode (Prepaid or Cash on Delivery).",
      details: ["Instant booking reference ID generated", "Option for single or business bulk dispatch"],
    },
    {
      num: "02",
      title: "Step 2: Admin Review & Rate Verification",
      description:
        "Our logistics team reviews the parcel details, applies weight slab checks, and sets the transparent customer shipping charge.",
      details: ["Separate submitted vs verified audit metrics", "Accurate pricing with zero hidden surcharges"],
    },
    {
      num: "03",
      title: "Step 3: Multi-Carrier Assignment & AWB Generation",
      description:
        "The system routes the parcel to the optimal courier partner (Delhivery, Blue Dart, DTDC, or XpressBees) and generates the official Air Waybill (AWB) and QR code.",
      details: ["Unique tamper-proof tracking token", "Thermal barcode label generated automatically"],
    },
    {
      num: "04",
      title: "Step 4: Doorstep Package Pickup",
      description:
        "A verified courier pickup executive visits your pickup location to collect the parcel and scan it into the regional logistics sorting hub.",
      details: ["Digital pickup confirmation receipt", "Package weight calibration check"],
    },
    {
      num: "05",
      title: "Step 5: Live Transit Tracking & Alerts",
      description:
        "Track the package in real-time across regional transit hubs. Both sender and receiver receive SMS and WhatsApp milestone notifications.",
      details: ["Multi-carrier normalized checkpoint statuses", "Interactive visual shipment timeline"],
    },
    {
      num: "06",
      title: "Step 6: Secure Doorstep Delivery & COD Settlement",
      description:
        "Receiver receives the package after OTP verification or cash collection. For COD orders, funds are reconciled and settled via automated UTR batches.",
      details: ["Signed electronic Proof of Delivery (e-POD)", "Weekly COD payout reports"],
    },
  ];

  return (
    <div className="max-w-container mx-auto px-4 py-12 space-y-16">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-brand-primary bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
          Operational Process
        </span>
        <h1 className="text-display">How {companyName} Works</h1>
        <p className="text-body text-lg">
          A seamless 6-step lifecycle from online parcel booking to doorstep delivery.
        </p>
      </div>

      <div className="space-y-8 max-w-4xl mx-auto">
        {steps.map((step, idx) => (
          <div
            key={idx}
            className="bg-surface-base p-6 md:p-8 rounded-2xl border border-border-default shadow-sm flex flex-col md:flex-row items-start gap-6 hover:shadow-md transition-shadow"
          >
            <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 text-brand-primary flex items-center justify-center font-mono font-black text-xl shrink-0">
              {step.num}
            </div>
            <div className="space-y-3 flex-1">
              <h3 className="text-xl font-bold text-text-primary">{step.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed">{step.description}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-border-default">
                {step.details.map((d, dIdx) => (
                  <div key={dIdx} className="flex items-center gap-2 text-xs font-medium text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{d}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center pt-8">
        <Link href="/book">
          <Button variant="accent" size="lg" className="shadow-lg">
            Start Your First Booking <ArrowRight className="w-5 h-5 ml-1.5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
