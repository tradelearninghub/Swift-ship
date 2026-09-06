import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Truck, ShieldCheck, MapPin, Award, Users, CheckCircle2 } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="max-w-container mx-auto px-4 py-12 space-y-16">
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-brand-primary bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
          About Swift Ship Courier
        </span>
        <h1 className="text-display">Redefining Multi-Carrier Logistics Across India</h1>
        <p className="text-body text-lg">
          Connecting businesses and individual shippers with India&apos;s leading courier networks under a single unified platform.
        </p>
      </div>

      {/* Story & Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="space-y-4">
          <h2 className="text-h2">Built For Reliability, Transparency, and Speed</h2>
          <p className="text-body">
            Founded with a mission to simplify parcel dispatch and tracking, Swift Ship bridges the gap between shippers and multiple national courier networks. We eliminate the friction of managing different courier portals by giving you unified booking, verified rates, guaranteed COD settlements, and real-time live checkpoint tracking.
          </p>
          <div className="space-y-2 pt-2">
            {[
              "Automated Multi-Carrier Selection for Cost & Speed Optimization",
              "19,000+ Pin Codes Covered Across All Indian States & UTs",
              "Transparent Manual & Automated Charge Verification",
              "Guaranteed Cash-on-Delivery (COD) Reconciliation",
            ].map((text, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-text-primary font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-surface-subtle p-8 rounded-3xl border border-border-default space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface-base p-5 rounded-2xl border border-border-default text-center">
              <div className="text-3xl font-bold text-brand-primary">19,000+</div>
              <div className="text-xs text-text-muted mt-1 font-medium">Pincodes Served</div>
            </div>
            <div className="bg-surface-base p-5 rounded-2xl border border-border-default text-center">
              <div className="text-3xl font-bold text-brand-accent">50k+</div>
              <div className="text-xs text-text-muted mt-1 font-medium">Monthly Dispatches</div>
            </div>
            <div className="bg-surface-base p-5 rounded-2xl border border-border-default text-center">
              <div className="text-3xl font-bold text-emerald-600">99.4%</div>
              <div className="text-xs text-text-muted mt-1 font-medium">On-Time Delivery</div>
            </div>
            <div className="bg-surface-base p-5 rounded-2xl border border-border-default text-center">
              <div className="text-3xl font-bold text-blue-700">4+</div>
              <div className="text-xs text-text-muted mt-1 font-medium">Carrier Partners</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
