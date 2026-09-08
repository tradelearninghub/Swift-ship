"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import {
  Truck,
  ShieldCheck,
  Clock,
  Search,
  ArrowRight,
  Package,
  Layers,
  CheckCircle2,
  DollarSign,
  Zap,
  Barcode,
  Receipt,
  Smartphone,
  MapPin,
  Sparkles,
} from "lucide-react";

type TrackMode = "awb" | "order" | "mobile_pincode";

export default function HomePage() {
  const router = useRouter();
  const [trackMode, setTrackMode] = useState<TrackMode>("awb");
  const [searchValue, setSearchValue] = useState("");
  const [mobileValue, setMobileValue] = useState("");
  const [pincodeValue, setPincodeValue] = useState("");

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackMode === "awb") {
      const q = searchValue.trim();
      if (!q) return;
      router.push(`/track?awb=${encodeURIComponent(q)}`);
    } else if (trackMode === "order") {
      const q = searchValue.trim();
      if (!q) return;
      router.push(`/track?order_id=${encodeURIComponent(q)}`);
    } else {
      const m = mobileValue.trim();
      const p = pincodeValue.trim();
      if (!m || !p) return;
      router.push(`/track?mobile=${encodeURIComponent(m)}&pincode=${encodeURIComponent(p)}`);
    }
  };

  return (
    <div className="space-y-16 sm:space-y-24 py-6 sm:py-10">
      {/* 1. HERO SECTION WITH LIVE TRACKING */}
      <section className="max-w-container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Hero Left Content */}
          <div className="lg:col-span-7 space-y-5 sm:space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-brand-primary text-xs font-bold uppercase tracking-wider border border-blue-200 shadow-xs">
              <Zap className="w-3.5 h-3.5 text-brand-accent" />
              <span>Multi-Carrier Logistics Platform</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-display font-extrabold text-text-primary tracking-tight leading-tight">
              Send Your Parcel —{" "}
              <span className="text-brand-primary">Fast, Safe & Reliable</span>
            </h1>

            <p className="text-text-secondary text-base sm:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Book domestic and commercial shipments with India&apos;s leading courier partners. Live GPS updates, verified Cash on Delivery (COD), and door-to-door pickup across 19,000+ pincodes.
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-1">
              <Link href="/book" className="w-full sm:w-auto">
                <Button variant="accent" size="lg" className="w-full sm:w-auto shadow-md font-bold flex items-center justify-center gap-2">
                  <span>Book a Parcel</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/calculator" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-auto font-semibold">
                  Calculate Shipping Rate
                </Button>
              </Link>
            </div>

            {/* Quick Badges */}
            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 text-xs text-text-secondary">
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Free Doorstep Pickup
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <ShieldCheck className="w-4 h-4 text-brand-primary" /> Guaranteed COD Settlements
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <Clock className="w-4 h-4 text-brand-accent" /> Live WhatsApp Alerts
              </span>
            </div>
          </div>

          {/* Hero Right: Live Dispatch Tracking Widget */}
          <div className="lg:col-span-5 w-full">
            <div className="bg-surface-base p-5 sm:p-7 rounded-2xl border border-border-default shadow-xl space-y-5">
              <div className="space-y-1">
                <div className="text-[11px] font-bold uppercase tracking-wider text-brand-primary">
                  Live Dispatch Lookup
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-text-primary">
                  Track Your Shipment
                </h3>
                <p className="text-xs text-text-muted">
                  Instant status checkpoints across all carrier networks
                </p>
              </div>

              {/* 3-Tab Search Selector */}
              <div className="grid grid-cols-3 gap-1 bg-surface-subtle p-1 rounded-xl border border-border-default">
                <button
                  type="button"
                  onClick={() => {
                    setTrackMode("awb");
                    setSearchValue("");
                  }}
                  className={`flex items-center justify-center gap-1.5 py-2 px-1 text-xs font-bold rounded-lg transition-all ${
                    trackMode === "awb"
                      ? "bg-surface-base text-brand-primary shadow-xs border border-border-default"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  <Barcode className="w-3.5 h-3.5" />
                  <span>AWB No.</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTrackMode("order");
                    setSearchValue("");
                  }}
                  className={`flex items-center justify-center gap-1.5 py-2 px-1 text-xs font-bold rounded-lg transition-all ${
                    trackMode === "order"
                      ? "bg-surface-base text-brand-primary shadow-xs border border-border-default"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  <Receipt className="w-3.5 h-3.5" />
                  <span>Order ID</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTrackMode("mobile_pincode");
                    setMobileValue("");
                    setPincodeValue("");
                  }}
                  className={`flex items-center justify-center gap-1.5 py-2 px-1 text-xs font-bold rounded-lg transition-all ${
                    trackMode === "mobile_pincode"
                      ? "bg-surface-base text-brand-primary shadow-xs border border-border-default"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span className="truncate">Mobile</span>
                </button>
              </div>

              {/* Tracking Form */}
              <form onSubmit={handleTrackSubmit} className="space-y-3">
                {trackMode === "mobile_pincode" ? (
                  <div className="space-y-2">
                    <div>
                      <label className="block text-[11px] font-bold text-text-secondary mb-1">
                        10-Digit Mobile Number
                      </label>
                      <input
                        type="tel"
                        maxLength={10}
                        value={mobileValue}
                        onChange={(e) => setMobileValue(e.target.value.replace(/\D/g, ""))}
                        placeholder="Enter 10-digit mobile number"
                        required
                        className="w-full h-11 px-3.5 text-sm bg-surface-subtle border border-border-default rounded-xl focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 focus:outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-text-secondary mb-1">
                        6-Digit Delivery Pincode
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        value={pincodeValue}
                        onChange={(e) => setPincodeValue(e.target.value.replace(/\D/g, ""))}
                        placeholder="Enter 6-digit delivery pincode"
                        required
                        className="w-full h-11 px-3.5 text-sm font-mono bg-surface-subtle border border-border-default rounded-xl focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 focus:outline-none transition-all"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-[11px] font-bold text-text-secondary mb-1">
                      {trackMode === "awb" ? "Consignment / AWB Number" : "Booking / Order ID"}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        placeholder={
                          trackMode === "awb"
                            ? "Enter AWB or consignment number"
                            : "Enter booking or order ID"
                        }
                        required
                        className="w-full h-11 pl-3.5 pr-10 text-sm font-mono bg-surface-subtle border border-border-default rounded-xl focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 focus:outline-none transition-all"
                      />
                      <Search className="w-4 h-4 text-text-muted absolute right-3 top-3.5" />
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full shadow-md font-bold text-sm h-11 flex items-center justify-center gap-2 mt-1"
                >
                  <Search className="w-4 h-4" />
                  <span>Track Parcel Now</span>
                </Button>
              </form>

              {/* Widget Footer */}
              <div className="pt-3 border-t border-border-default flex items-center justify-between text-[11px] text-text-secondary">
                <span className="flex items-center gap-1.5 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Multi-Courier Sync
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <Clock className="w-3.5 h-3.5 text-brand-primary" /> Live Checkpoints
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. TRUST & STATS COUNTER (§3 in Feature Spec) */}
      <section className="bg-surface-subtle border-y border-border-default py-10 sm:py-12">
        <div className="max-w-container mx-auto px-4 sm:px-6 grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 text-center">
          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-extrabold text-brand-primary tracking-tight">
              50,000+
            </div>
            <div className="text-xs sm:text-sm text-text-secondary font-medium">
              Parcels Delivered
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-extrabold text-brand-primary tracking-tight">
              19,000+
            </div>
            <div className="text-xs sm:text-sm text-text-secondary font-medium">
              Pincodes Covered
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-extrabold text-brand-primary tracking-tight">
              99.4%
            </div>
            <div className="text-xs sm:text-sm text-text-secondary font-medium">
              On-Time Dispatch Rate
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-extrabold text-brand-primary tracking-tight">
              24/7
            </div>
            <div className="text-xs sm:text-sm text-text-secondary font-medium">
              Dedicated Support Desk
            </div>
          </div>
        </div>
      </section>

      {/* 3. LOGISTICS SERVICES SHOWCASE */}
      <section className="max-w-container mx-auto px-4 sm:px-6 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-primary bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            Logistics Solutions
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-h2 font-extrabold text-text-primary tracking-tight">
            Tailored Shipping Services For Every Need
          </h2>
          <p className="text-text-secondary text-sm sm:text-base leading-relaxed">
            Whether sending personal parcels across India or fulfilling continuous business e-commerce orders.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Service 1 */}
          <div className="bg-surface-base p-6 sm:p-7 rounded-2xl border border-border-default shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-brand-primary flex items-center justify-center group-hover:scale-105 transition-transform">
                <Package className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-text-primary group-hover:text-brand-primary transition-colors">
                Domestic Parcel Delivery
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                Doorstep pickup and reliable surface & express air cargo covering 19,000+ Indian pincodes with live GPS tracking checkpoints.
              </p>
            </div>
            <div className="pt-2">
              <Link href="/book" className="text-xs font-bold text-brand-primary hover:underline inline-flex items-center gap-1">
                Book Domestic Pickup →
              </Link>
            </div>
          </div>

          {/* Service 2 */}
          <div className="bg-surface-base p-6 sm:p-7 rounded-2xl border border-border-default shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <DollarSign className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-text-primary group-hover:text-brand-primary transition-colors">
                Cash on Delivery (COD)
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                Secure cash collection upon doorstep delivery with automated UTR reconciliation, weekly batch payouts, and transparent reporting.
              </p>
            </div>
            <div className="pt-2">
              <Link href="/services" className="text-xs font-bold text-amber-700 hover:underline inline-flex items-center gap-1">
                Explore COD Features →
              </Link>
            </div>
          </div>

          {/* Service 3 */}
          <div className="bg-surface-base p-6 sm:p-7 rounded-2xl border border-border-default shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-text-primary group-hover:text-brand-primary transition-colors">
                Multi-Carrier Optimization
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                Seamlessly integrated with Delhivery, Blue Dart, DTDC, and XpressBees. Each consignment is routed via the most efficient carrier.
              </p>
            </div>
            <div className="pt-2">
              <Link href="/services" className="text-xs font-bold text-emerald-700 hover:underline inline-flex items-center gap-1">
                View Carrier Integrations →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. 6-STEP WORKFLOW (§6 in Feature Spec) */}
      <section className="bg-surface-subtle border-y border-border-default py-14 sm:py-16">
        <div className="max-w-container mx-auto px-4 sm:px-6 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-primary bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              Simple 6-Step Process
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-h2 font-extrabold text-text-primary tracking-tight">
              How SS Courier service Works
            </h2>
            <p className="text-text-secondary text-sm sm:text-base leading-relaxed">
              From instant online booking to safe doorstep delivery, every milestone is verified and audited.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
            {[
              { num: "01", title: "Book Parcel", desc: "Submit sender, receiver & parcel dimensions online in 2 minutes." },
              { num: "02", title: "Rate Confirm", desc: "Volumetric calculation confirms transparent, competitive rates." },
              { num: "03", title: "Carrier Sync", desc: "Integrated API generates AWB and secure QR barcode label." },
              { num: "04", title: "Doorstep Pickup", desc: "Verified delivery agent collects parcel from your address." },
              { num: "05", title: "Live Tracking", desc: "Real-time updates via SMS, WhatsApp & tracking portal." },
              { num: "06", title: "Safe Delivery", desc: "Receiver doorstep delivery with OTP confirmation or COD receipt." },
            ].map((step) => (
              <div
                key={step.num}
                className="bg-surface-base p-5 rounded-xl border border-border-default shadow-xs space-y-2 flex flex-col justify-between hover:border-brand-primary/40 transition-colors"
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

      {/* 5. MULTI-CARRIER PARTNERS STRIP */}
      <section className="max-w-container mx-auto px-4 sm:px-6 text-center space-y-6">
        <p className="text-xs font-bold uppercase tracking-widest text-text-muted">
          Powered By India&apos;s Leading Courier & Cargo Networks
        </p>
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 opacity-80 grayscale hover:grayscale-0 transition-all">
          <div className="font-black text-xl text-slate-700 tracking-wider">DELHIVERY</div>
          <div className="font-black text-xl text-blue-800 tracking-wider">BLUE DART</div>
          <div className="font-black text-xl text-red-600 tracking-wider">DTDC</div>
          <div className="font-black text-xl text-amber-600 tracking-wider">XPRESSBEES</div>
        </div>
      </section>

      {/* 6. CALL TO ACTION BANNER */}
      <section className="max-w-container mx-auto px-4 sm:px-6">
        <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white rounded-3xl p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
          <div className="space-y-3 max-w-xl text-center md:text-left">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Ready to dispatch your parcel?
            </h2>
            <p className="text-blue-100 text-sm sm:text-base leading-relaxed">
              Book online in under 2 minutes. Transparent rates, multi-carrier network, and 24/7 shipment tracking.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 sm:gap-4 shrink-0 w-full md:w-auto justify-center">
            <Link href="/book" className="w-full sm:w-auto">
              <Button variant="accent" size="lg" className="w-full sm:w-auto shadow-lg font-bold">
                Book a Parcel Now
              </Button>
            </Link>
            <Link href="/contact" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto border-white text-white hover:bg-white/10"
              >
                Contact Jaipur Hub
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
