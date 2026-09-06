"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Barcode,
  Receipt,
  Smartphone,
  Search,
  Calculator,
  Truck,
  MapPin,
  FileText,
  PackageCheck,
  Navigation,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

type TrackTabType = "awb" | "order" | "mobile";

export default function HomePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TrackTabType>("awb");
  const [searchValue, setSearchValue] = useState("BK-1025");

  const tabConfig = {
    awb: {
      label: "AWB No.",
      icon: Barcode,
      placeholder: "Enter AWB / Consignment Number (e.g. DEL102598)",
      inputType: "text",
      maxLength: undefined,
    },
    order: {
      label: "Order ID",
      icon: Receipt,
      placeholder: "Enter Order / Booking ID (e.g. BK-1025)",
      inputType: "text",
      maxLength: undefined,
    },
    mobile: {
      label: "Mobile No.",
      icon: Smartphone,
      placeholder: "Enter Registered 10-digit Mobile Number",
      inputType: "tel",
      maxLength: 10,
    },
  };

  const handleTabChange = (type: TrackTabType) => {
    setActiveTab(type);
    if (type === "order") setSearchValue("BK-1025");
    else if (type === "awb") setSearchValue("DEL98234123");
    else setSearchValue("");
  };

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchValue.trim();
    if (!query) return;
    router.push(`/track?type=${activeTab}&q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="space-y-0">
      {/* 1. HERO SECTION WITH 3-TAB TRACKING */}
      <section
        className="relative bg-gradient-to-b from-[#002B49] via-[#002B49]/95 to-[#001B2E] text-white py-24 md:py-32 px-4 text-center overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 43, 73, 0.90), rgba(0, 27, 46, 0.94)), url('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1500&q=80')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-[#FF6B00] text-xs font-bold uppercase tracking-wider backdrop-blur border border-white/15">
            <ShieldCheck className="w-4 h-4" /> Next-Gen Multi-Courier Platform
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-tight">
            Fast, Safe & Reliable <br className="hidden sm:inline" />
            <span className="text-[#FF6B00]">Courier Services</span>
          </h1>

          <p className="text-slate-200 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Track your package live anywhere across India and the globe with unified status checkpoints.
          </p>

          {/* 3-Option Live Tracking Box */}
          <div className="pt-6 max-w-2xl mx-auto">
            {/* Tab Selection */}
            <div className="flex items-center justify-start gap-1.5 sm:gap-2">
              {(["awb", "order", "mobile"] as TrackTabType[]).map((tabKey) => {
                const TabIcon = tabConfig[tabKey].icon;
                const isActive = activeTab === tabKey;
                return (
                  <button
                    key={tabKey}
                    type="button"
                    onClick={() => handleTabChange(tabKey)}
                    className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
                      isActive
                        ? "bg-white text-[#002B49] shadow-md border-t-2 border-[#FF6B00]"
                        : "bg-white/15 hover:bg-white/25 text-white backdrop-blur"
                    }`}
                  >
                    <TabIcon className={`w-4 h-4 ${isActive ? "text-[#FF6B00]" : "text-slate-300"}`} />
                    <span>{tabConfig[tabKey].label}</span>
                  </button>
                );
              })}
            </div>

            {/* Input Form Box */}
            <form
              onSubmit={handleTrackSubmit}
              className="bg-white p-2.5 rounded-b-2xl rounded-tr-2xl shadow-2xl flex flex-col sm:flex-row gap-2 border border-slate-100"
            >
              <div className="relative flex-1">
                <input
                  type={tabConfig[activeTab].inputType}
                  maxLength={tabConfig[activeTab].maxLength}
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder={tabConfig[activeTab].placeholder}
                  required
                  className="w-full h-13 pl-4 pr-4 text-slate-800 text-sm md:text-base font-medium placeholder-slate-400 focus:outline-none bg-transparent rounded-lg"
                />
              </div>
              <Button
                type="submit"
                variant="accent"
                size="lg"
                className="bg-[#FF6B00] hover:bg-[#e05e00] text-white font-bold px-8 h-13 rounded-xl shadow-md flex items-center justify-center gap-2 text-sm sm:text-base shrink-0"
              >
                <Search className="w-5 h-5" />
                <span>Track Parcel</span>
              </Button>
            </form>

            <div className="mt-3 flex items-center justify-center gap-6 text-xs text-slate-300">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Multi-Courier Sync
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#FF6B00]" /> Real-time GPS Tracking
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. QUICK FEATURES (FLOATING CARDS) */}
      <section className="relative -mt-12 z-20 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <Link
            href="/book"
            className="group bg-white p-6 sm:p-7 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100 border-b-4 border-b-[#FF6B00] hover:-translate-y-1 block"
          >
            <div className="w-13 h-13 rounded-xl bg-orange-50 text-[#FF6B00] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <Calculator className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-[#002B49] mb-1.5 group-hover:text-[#FF6B00] transition-colors">
              Rate Calculator
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Calculate shipping cost instantly by weight, dimensions & pincode distance.
            </p>
          </Link>

          {/* Card 2 */}
          <Link
            href="/book"
            className="group bg-white p-6 sm:p-7 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100 border-b-4 border-b-[#FF6B00] hover:-translate-y-1 block"
          >
            <div className="w-13 h-13 rounded-xl bg-blue-50 text-[#002B49] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <Truck className="w-7 h-7 text-[#002B49]" />
            </div>
            <h3 className="text-lg font-bold text-[#002B49] mb-1.5 group-hover:text-[#FF6B00] transition-colors">
              Schedule Pickup
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Get doorstep parcel pickup from your home, store, or warehouse location.
            </p>
          </Link>

          {/* Card 3 */}
          <Link
            href="/contact"
            className="group bg-white p-6 sm:p-7 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100 border-b-4 border-b-[#FF6B00] hover:-translate-y-1 block"
          >
            <div className="w-13 h-13 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <MapPin className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-[#002B49] mb-1.5 group-hover:text-[#FF6B00] transition-colors">
              Locate Hub
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Find the nearest delivery hub, service centers, and branch network.
            </p>
          </Link>
        </div>
      </section>

      {/* 3. OUR SHIPPING SERVICES */}
      <section className="py-20 bg-slate-50 border-t border-slate-200/60 mt-14" id="services">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2.5">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#002B49]">
              Our Shipping Services
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              Tailored logistics solutions for individuals and enterprises.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Service 1 */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-slate-200/80 group">
              <div className="h-48 overflow-hidden relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=600&q=80"
                  alt="Domestic Delivery"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent" />
              </div>
              <div className="p-6 space-y-2">
                <h3 className="text-xl font-bold text-[#002B49] group-hover:text-[#FF6B00] transition-colors">
                  Domestic Delivery
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Fast delivery across all Indian pincodes with guaranteed Cash on Delivery (COD) collection.
                </p>
              </div>
            </div>

            {/* Service 2 */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-slate-200/80 group">
              <div className="h-48 overflow-hidden relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1524522173746-f628baad3644?auto=format&fit=crop&w=600&q=80"
                  alt="International Shipping"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent" />
              </div>
              <div className="p-6 space-y-2">
                <h3 className="text-xl font-bold text-[#002B49] group-hover:text-[#FF6B00] transition-colors">
                  International Cargo
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Worldwide parcel delivery with complete customs clearance support and cross-border tracking.
                </p>
              </div>
            </div>

            {/* Service 3 */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-slate-200/80 group">
              <div className="h-48 overflow-hidden relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&w=600&q=80"
                  alt="Same Day Delivery"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent" />
              </div>
              <div className="p-6 space-y-2">
                <h3 className="text-xl font-bold text-[#002B49] group-hover:text-[#FF6B00] transition-colors">
                  Same Day / Express
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Urgent documents and high-priority packages dispatched and delivered within hours.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS (4 EASY STEPS) */}
      <section className="py-20 bg-white" id="how-it-works">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-14">
          <div className="text-center max-w-2xl mx-auto space-y-2.5">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#002B49]">
              How It Works
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              Track, ship and receive in 4 easy steps
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {/* Step 1 */}
            <div className="space-y-4">
              <div className="w-20 h-20 rounded-full bg-orange-100 text-[#FF6B00] flex items-center justify-center text-2xl mx-auto shadow-sm">
                <FileText className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-[#002B49]">1. Book</h4>
              <p className="text-sm text-slate-600">Enter parcel & address details online.</p>
            </div>

            {/* Step 2 */}
            <div className="space-y-4">
              <div className="w-20 h-20 rounded-full bg-orange-100 text-[#FF6B00] flex items-center justify-center text-2xl mx-auto shadow-sm">
                <PackageCheck className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-[#002B49]">2. Pickup</h4>
              <p className="text-sm text-slate-600">Doorstep pickup by verified agent.</p>
            </div>

            {/* Step 3 */}
            <div className="space-y-4">
              <div className="w-20 h-20 rounded-full bg-orange-100 text-[#FF6B00] flex items-center justify-center text-2xl mx-auto shadow-sm">
                <Navigation className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-[#002B49]">3. In Transit</h4>
              <p className="text-sm text-slate-600">Real-time live GPS tracking updates.</p>
            </div>

            {/* Step 4 */}
            <div className="space-y-4">
              <div className="w-20 h-20 rounded-full bg-orange-100 text-[#FF6B00] flex items-center justify-center text-2xl mx-auto shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-[#002B49]">4. Delivery</h4>
              <p className="text-sm text-slate-600">Safe delivery with OTP verification.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. STATS COUNTER */}
      <section className="bg-[#002B49] text-white py-16 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="space-y-1">
            <h3 className="text-4xl sm:text-5xl font-extrabold text-[#FF6B00]">5M+</h3>
            <p className="text-slate-300 text-sm font-medium">Deliveries Done</p>
          </div>
          <div className="space-y-1">
            <h3 className="text-4xl sm:text-5xl font-extrabold text-[#FF6B00]">27,000+</h3>
            <p className="text-slate-300 text-sm font-medium">Pincodes Active</p>
          </div>
          <div className="space-y-1">
            <h3 className="text-4xl sm:text-5xl font-extrabold text-[#FF6B00]">99.8%</h3>
            <p className="text-slate-300 text-sm font-medium">On-Time Delivery</p>
          </div>
          <div className="space-y-1">
            <h3 className="text-4xl sm:text-5xl font-extrabold text-[#FF6B00]">24/7</h3>
            <p className="text-slate-300 text-sm font-medium">Live Support</p>
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION BANNER */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-[#002B49] to-[#00426d] text-white rounded-3xl p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
          <div className="space-y-2.5 max-w-xl text-center md:text-left">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Ready to dispatch your parcel?
            </h2>
            <p className="text-slate-200 text-sm sm:text-base leading-relaxed">
              Book online in under 2 minutes. Transparent rates, multi-carrier network, and 24/7 live tracking.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 shrink-0 justify-center">
            <Link href="/book">
              <Button
                variant="accent"
                size="lg"
                className="bg-[#FF6B00] hover:bg-[#e05e00] text-white font-bold shadow-lg"
              >
                Book a Parcel Now <ArrowRight className="w-5 h-5 ml-1" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white/10"
              >
                Contact Sales
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
