import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Globe, Plane, FileText, ShieldCheck, Clock, Layers, ArrowRight, Package } from "lucide-react";

export default function ServicesPage() {
  const services = [
    {
      icon: Globe,
      title: "Worldwide International Courier",
      description:
        "Priority door-to-door express courier connecting India to over 220 countries including USA, UK, Canada, Australia, UAE, Europe, and Asia-Pacific.",
      tag: "Global Network",
    },
    {
      icon: Plane,
      title: "Commercial Air Freight Cargo",
      description:
        "Consolidated air cargo forwarding for exporters and B2B manufacturers. Multi-box consignments, palletized cargo, and high-volume freight with scheduled flights.",
      tag: "Air Cargo",
    },
    {
      icon: FileText,
      title: "Legal & University Documents",
      description:
        "Dedicated non-dutiable express transit for educational transcripts, passport applications, legal contracts, and corporate agreements with proof of delivery.",
      tag: "Express Docs",
    },
    {
      icon: Layers,
      title: "Customs & Paperless Invoicing",
      description:
        "Full customs paperwork assistance, commercial invoice generation with itemized HSN codes, and seamless regulatory compliance for international clearance.",
      tag: "Clearance",
    },
    {
      icon: ShieldCheck,
      title: "Fragile & Valuables Protection",
      description:
        "Specialized multi-layer export packaging, bubble wrap, reinforced cartons, and cargo transit protection for delicate items, textiles, and electronics.",
      tag: "Secure Transit",
    },
    {
      icon: Clock,
      title: "Priority Air Express (3-5 Days)",
      description:
        "Fastest cross-border connection with guaranteed flight allocations, real-time milestone GPS updates, and customs pre-clearance.",
      tag: "Fast Track",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-16 space-y-16">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-[#2563EB] bg-blue-50 px-3.5 py-1 rounded-full border border-blue-200">
          Our Global Shipping Services
        </span>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
          International Express &amp; Cargo Solutions
        </h1>
        <p className="text-slate-500 text-base sm:text-lg">
          Fast, secure, and customs-compliant cross-border logistics to over 220 countries worldwide.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div
              key={idx}
              className="bg-white p-7 rounded-3xl border border-slate-200 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between space-y-5"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#2563EB] flex items-center justify-center">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-3 py-1 rounded-full">
                    {s.tag}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900">{s.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{s.description}</p>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <Link href="/book">
                  <Button variant="outline" size="sm" className="w-full text-slate-700 hover:text-[#2563EB] border-slate-200">
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
