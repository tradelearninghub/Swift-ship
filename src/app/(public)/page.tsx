import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import {
  Truck,
  ShieldCheck,
  Clock,
  MapPin,
  Search,
  ArrowRight,
  Package,
  Layers,
  CheckCircle2,
  DollarSign,
  Sparkles,
  Zap,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="space-y-20 py-8 md:py-12">
      {/* Hero Section */}
      <section className="max-w-container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-brand-primary text-xs font-semibold uppercase tracking-wider border border-blue-200">
              <Zap className="w-3.5 h-3.5 text-brand-accent" /> Next-Gen Multi-Courier Platform
            </div>
            <h1 className="text-display text-text-primary">
              Send Your Parcel —{" "}
              <span className="text-brand-primary">Fast, Safe & Reliable</span>
            </h1>
            <p className="text-body text-lg max-w-xl">
              Book your shipment with India&apos;s leading courier partners. Track in real-time with verified status updates, guaranteed COD settlements, and unified multi-carrier dispatch.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Link href="/book">
                <Button variant="accent" size="lg" className="shadow-md">
                  Book a Parcel <ArrowRight className="w-5 h-5 ml-1" />
                </Button>
              </Link>
              <Link href="/track">
                <Button variant="outline" size="lg">
                  Track Shipment
                </Button>
              </Link>
            </div>
          </div>

          {/* Quick Tracking Card on Hero */}
          <div className="lg:col-span-5">
            <div className="bg-surface-base p-6 md:p-8 rounded-2xl border border-border-default shadow-xl space-y-6">
              <div className="space-y-1">
                <div className="text-xs font-bold uppercase tracking-wider text-brand-primary">
                  Live Dispatch Lookup
                </div>
                <h3 className="text-h3">Track Your Shipment</h3>
                <p className="text-small">Enter your AWB Number or Booking ID (e.g. BK-1025)</p>
              </div>

              <form action="/track" method="GET" className="space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    name="q"
                    defaultValue="BK-1025"
                    placeholder="e.g. BK-1025 or DEL98234123"
                    className="w-full h-12 pl-4 pr-12 text-sm font-mono bg-surface-subtle border border-border-default rounded-xl focus:border-brand-primary focus:ring-2 focus:ring-brand-primary focus:outline-none transition-all"
                  />
                  <Search className="w-5 h-5 text-text-muted absolute right-4 top-3.5" />
                </div>
                <Button type="submit" variant="primary" size="lg" className="w-full shadow-md">
                  Track Parcel Now
                </Button>
              </form>

              <div className="pt-4 border-t border-border-default flex items-center justify-between text-xs text-text-secondary">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> Multi-Courier Sync
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-brand-primary" /> Live Updates
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Stats Section */}
      <section className="bg-surface-subtle border-y border-border-default py-12">
        <div className="max-w-container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="space-y-1">
            <div className="text-3xl md:text-4xl font-extrabold text-brand-primary">50,000+</div>
            <div className="text-xs md:text-sm text-text-secondary font-medium">Parcels Delivered</div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl md:text-4xl font-extrabold text-brand-primary">19,000+</div>
            <div className="text-xs md:text-sm text-text-secondary font-medium">Pincodes Covered</div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl md:text-4xl font-extrabold text-brand-primary">99.4%</div>
            <div className="text-xs md:text-sm text-text-secondary font-medium">On-Time Dispatch</div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl md:text-4xl font-extrabold text-brand-primary">24/7</div>
            <div className="text-xs md:text-sm text-text-secondary font-medium">Unified Tracking Support</div>
          </div>
        </div>
      </section>

      {/* Services Showcase */}
      <section className="max-w-container mx-auto px-4 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-primary bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            Logistics Solutions
          </span>
          <h2 className="text-h2">Tailored Shipping Services For Every Need</h2>
          <p className="text-body">
            Whether sending personal parcels across India or fulfilling thousands of e-commerce orders daily.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-surface-base p-6 rounded-2xl border border-border-default shadow-sm hover:shadow-md transition-shadow space-y-3">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-brand-primary flex items-center justify-center">
              <Package className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-text-primary">Domestic Parcel Delivery</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              Door-to-door pickup and reliable road/air transit covering 19,000+ Indian pincodes with live GPS checkpoints.
            </p>
          </div>

          <div className="bg-surface-base p-6 rounded-2xl border border-border-default shadow-sm hover:shadow-md transition-shadow space-y-3">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-brand-accent flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-text-primary">Cash on Delivery (COD)</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              Secure cash collection upon receiver doorstep delivery with automated UTR reconciliation and weekly batch settlements.
            </p>
          </div>

          <div className="bg-surface-base p-6 rounded-2xl border border-border-default shadow-sm hover:shadow-md transition-shadow space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-text-primary">Multi-Courier Routing</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              Integrated with Delhivery, Blue Dart, DTDC, and XpressBees. We route each shipment via the optimal carrier for speed and cost.
            </p>
          </div>
        </div>
      </section>

      {/* 6-Step How It Works (§6 in Feature Spec) */}
      <section className="bg-surface-subtle border-y border-border-default py-16">
        <div className="max-w-container mx-auto px-4 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-primary bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              Simple 6-Step Workflow
            </span>
            <h2 className="text-h2">How Swift Ship Works</h2>
            <p className="text-body">
              From online request to doorstep delivery, every milestone is verified and audited.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
            {[
              { num: "01", title: "Book Parcel", desc: "Submit sender, receiver & parcel dimensions online." },
              { num: "02", title: "Admin Review", desc: "Staff verifies weight and confirms exact shipping rate." },
              { num: "03", title: "Courier Assigned", desc: "Integrated API generates AWB & secure QR tracking code." },
              { num: "04", title: "Doorstep Pickup", desc: "Courier partner collects parcel from sender location." },
              { num: "05", title: "Live Tracking", desc: "Real-time updates via SMS, WhatsApp & unified tracking page." },
              { num: "06", title: "Delivered", desc: "Delivered safely with OTP verification or COD collection." },
            ].map((step) => (
              <div
                key={step.num}
                className="bg-surface-base p-5 rounded-xl border border-border-default shadow-sm space-y-2 relative flex flex-col justify-between"
              >
                <div>
                  <div className="font-mono text-2xl font-black text-brand-primary/30">
                    {step.num}
                  </div>
                  <h4 className="font-bold text-sm text-text-primary mt-1">{step.title}</h4>
                  <p className="text-xs text-text-secondary leading-relaxed mt-1">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-container mx-auto px-4">
        <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
          <div className="space-y-3 max-w-xl">
            <h2 className="text-2xl md:text-3xl font-bold">Ready to dispatch your parcel?</h2>
            <p className="text-blue-100 text-sm md:text-base leading-relaxed">
              Book online in under 2 minutes. Transparent rates, multi-carrier network, and 24/7 shipment tracking.
            </p>
          </div>
          <div className="flex flex-wrap gap-4 shrink-0">
            <Link href="/book">
              <Button variant="accent" size="lg" className="shadow-lg">
                Book a Parcel Now
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                Contact Sales
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
