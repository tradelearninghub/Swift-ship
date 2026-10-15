import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ArrowRight, CheckCircle2, ShieldCheck, Globe, Plane, Package, FileCheck } from "lucide-react";
import { getCompanyProfile } from "@/lib/settings";

export default async function HowItWorksPage() {
  const profile = await getCompanyProfile();
  const companyName = profile.company_name || "SS International Courier";

  const steps = [
    {
      num: "01",
      title: "Step 1: Submit International Consignment Online",
      description:
        "Enter origin and destination address, select target country (across 220+ destinations), specify package dimensions and weight, and fill out your commercial line items.",
      details: ["Instant online reference generated", "HSN code & customs valuation assistance"],
    },
    {
      num: "02",
      title: "Step 2: KYC & Export Documentation Review",
      description:
        "Our export team verifies the sender's KYC (Aadhaar/Passport/GST) and generates paperless customs commercial invoices required by international border authorities.",
      details: ["Export declaration preparation", "Zero hidden export surcharges"],
    },
    {
      num: "03",
      title: "Step 3: Doorstep Parcel Collection in India",
      description:
        "A verified courier executive arrives at your doorstep in India to safely collect your parcel and deliver it to our central international processing hub.",
      details: ["Digital pickup receipt", "Electronic dead vs volumetric weight check"],
    },
    {
      num: "04",
      title: "Step 4: Air Freight Allocation & International AWB",
      description:
        "Your shipment is booked onto scheduled international cargo flights with global carriers (DHL, FedEx, UPS, Aramex) and assigned an Air Waybill (AWB).",
      details: ["Direct international tracking number", "Official airline flight manifest integration"],
    },
    {
      num: "05",
      title: "Step 5: Cross-Border Transit & Customs Pre-Clearance",
      description:
        "Track your package live through overseas air corridors. Milestone updates notify both sender and receiver via WhatsApp and SMS.",
      details: ["Live flight & border customs updates", "Transparent destination duty assistance"],
    },
    {
      num: "06",
      title: "Step 6: Overseas Doorstep Delivery with Proof of Delivery",
      description:
        "Your overseas recipient receives the parcel at their doorstep with electronic signature confirmation and instant digital Proof of Delivery (e-POD).",
      details: ["Signed delivery confirmation", "End-to-end completed milestone receipt"],
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-16 space-y-16">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-[#2563EB] bg-blue-50 px-3.5 py-1 rounded-full border border-blue-200">
          International Workflow
        </span>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
          How {companyName} Works
        </h1>
        <p className="text-slate-500 text-base sm:text-lg">
          A seamless 6-stage process from your doorstep in India to over 220 international destinations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {steps.map((s, idx) => (
          <div
            key={idx}
            className="bg-white p-7 rounded-3xl border border-slate-200 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <span className="text-2xl font-black text-[#2563EB] block">{s.num}</span>
              <h3 className="text-lg font-bold text-slate-900">{s.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{s.description}</p>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-2">
              {s.details.map((d, dIdx) => (
                <div key={dIdx} className="flex items-center gap-2 text-xs text-slate-600">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{d}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-[#0B1536] text-white p-8 sm:p-12 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <h2 className="text-2xl sm:text-3xl font-black">Ready to Ship Globally?</h2>
          <p className="text-slate-300 text-sm">
            Book online in under 2 minutes with paperless customs clearance, transparent rates, and dedicated support.
          </p>
        </div>
        <Link href="/book">
          <Button size="lg" className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold px-8 py-3.5 rounded-xl shadow-lg shadow-blue-500/25">
            Book International Parcel <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
