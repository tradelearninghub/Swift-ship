import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Package, Truck, DollarSign, Layers, ShieldCheck, Zap, ArrowRight } from "lucide-react";

export default function ServicesPage() {
  const services = [
    {
      icon: Package,
      title: "Domestic Parcel Shipping",
      description:
        "Surface and air express parcel delivery to over 19,000 pincodes across India. Ideal for documents, gifts, electronics, and merchandise with complete door-to-door transit handling.",
      tag: "Popular",
    },
    {
      icon: DollarSign,
      title: "Cash on Delivery (COD)",
      description:
        "End-to-end Cash on Delivery management. We collect payment upon parcel handover to the customer and settle the funds reliably with full UTR batch audit reports.",
      tag: "E-Commerce",
    },
    {
      icon: Layers,
      title: "Multi-Courier Aggregation",
      description:
        "Leverage combined network strength of Delhivery, Blue Dart, DTDC, and XpressBees. Switch between carriers seamlessly based on serviceability and zone transit speed.",
      tag: "Multi-Carrier",
    },
    {
      icon: Zap,
      title: "Express Air Delivery",
      description:
        "Priority next-day and 48-hour air courier connections between major metro corridors (Delhi, Mumbai, Bengaluru, Chennai, Kolkata, Hyderabad).",
      tag: "Speed",
    },
    {
      icon: ShieldCheck,
      title: "Secured & Insured Transit",
      description:
        "Declared value protection and tamper-evident tracking tokens. Full verification of package weight and dimensions before handover.",
      tag: "Safety",
    },
    {
      icon: Truck,
      title: "Business & Bulk Accounts",
      description:
        "Bulk CSV uploads, automated GST invoicing, dedicated account managers, and streamlined daily pickup scheduling for high-volume shippers.",
      tag: "B2B",
    },
  ];

  return (
    <div className="max-w-container mx-auto px-4 py-12 space-y-16">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-brand-primary bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
          Our Shipping Capabilities
        </span>
        <h1 className="text-display">Complete Logistics & Courier Services</h1>
        <p className="text-body text-lg">
          Flexible domestic shipping, express delivery, cash-on-delivery, and multi-carrier routing under one roof.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div
              key={idx}
              className="bg-surface-base p-6 rounded-2xl border border-border-default shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-brand-primary flex items-center justify-center">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full">
                    {s.tag}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-text-primary">{s.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{s.description}</p>
              </div>

              <div className="pt-4 border-t border-border-default">
                <Link href="/book">
                  <Button variant="outline" size="sm" className="w-full">
                    Book This Service <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
