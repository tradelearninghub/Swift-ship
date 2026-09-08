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
  Package,
  Navigation,
  CheckCircle2,
  Clock,
  ShieldCheck,
} from "lucide-react";

type TrackType = "awb" | "order" | "mobile";

export default function HomePage() {
  const router = useRouter();
  const [trackType, setTrackType] = useState<TrackType>("awb");
  const [searchValue, setSearchValue] = useState("");
  const [mobileValue, setMobileValue] = useState("");
  const [pincodeValue, setPincodeValue] = useState("");

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackType === "awb") {
      const q = searchValue.trim();
      if (!q) return;
      router.push(`/track?awb=${encodeURIComponent(q)}`);
    } else if (trackType === "order") {
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
    <div className="font-sans">
      {/* ========================================================================= */}
      {/* 2. HERO SECTION & LIVE TRACKING WITH 3 OPTIONS (From ai_studio_code (14).html) */}
      {/* ========================================================================= */}
      <section
        className="relative text-white py-24 sm:py-28 md:py-32 px-4 text-center bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0,43,73,0.88), rgba(0,43,73,0.88)), url('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1500&q=80')`,
        }}
        id="track"
      >
        <div className="w-[90%] max-w-[1200px] mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-[42px] font-bold mb-3 tracking-tight">
            Fast, Safe & Reliable Courier Services
          </h1>
          <p className="text-slate-200 text-base sm:text-[17px] mb-8 max-w-xl mx-auto">
            Track your package live anywhere across the globe
          </p>

          {/* Tracking Container */}
          <div className="max-w-[750px] mx-auto text-left">
            {/* 3 Tabs */}
            <div className="flex justify-start gap-2 -mb-0.5">
              <button
                type="button"
                onClick={() => {
                  setTrackType("awb");
                  setSearchValue("");
                }}
                className={`px-4 sm:px-5 py-2.5 text-sm font-semibold rounded-t-lg transition-all flex items-center gap-2 ${
                  trackType === "awb"
                    ? "bg-white text-[#002B49] shadow-sm"
                    : "bg-white/20 hover:bg-white/30 text-white"
                }`}
              >
                <Barcode className="w-4 h-4" />
                <span>AWB No.</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTrackType("order");
                  setSearchValue("");
                }}
                className={`px-4 sm:px-5 py-2.5 text-sm font-semibold rounded-t-lg transition-all flex items-center gap-2 ${
                  trackType === "order"
                    ? "bg-white text-[#002B49] shadow-sm"
                    : "bg-white/20 hover:bg-white/30 text-white"
                }`}
              >
                <Receipt className="w-4 h-4" />
                <span>Order ID</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTrackType("mobile");
                  setMobileValue("");
                  setPincodeValue("");
                }}
                className={`px-4 sm:px-5 py-2.5 text-sm font-semibold rounded-t-lg transition-all flex items-center gap-2 ${
                  trackType === "mobile"
                    ? "bg-white text-[#002B49] shadow-sm"
                    : "bg-white/20 hover:bg-white/30 text-white"
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>Mobile No.</span>
              </button>
            </div>

            {/* Input Form Box */}
            <form
              onSubmit={handleTrackSubmit}
              className="bg-white rounded-r-lg rounded-bl-lg p-2 sm:p-2.5 flex flex-col sm:flex-row shadow-[0_12px_35px_rgba(0,0,0,0.3)] gap-2"
            >
              {trackType === "mobile" ? (
                <div className="flex-1 flex flex-col sm:flex-row gap-2">
                  <input
                    type="tel"
                    maxLength={10}
                    value={mobileValue}
                    onChange={(e) => setMobileValue(e.target.value.replace(/\D/g, ""))}
                    placeholder="Enter 10-digit mobile number"
                    required
                    className="flex-1 px-4 py-3 text-[#333] text-sm sm:text-base border border-slate-200 sm:border-none rounded-md sm:rounded-none outline-none focus:ring-0 placeholder-slate-400"
                  />
                  <div className="hidden sm:block w-px bg-slate-200 my-2" />
                  <input
                    type="text"
                    maxLength={6}
                    value={pincodeValue}
                    onChange={(e) => setPincodeValue(e.target.value.replace(/\D/g, ""))}
                    placeholder="Delivery Pincode (6 digits)"
                    required
                    className="w-full sm:w-48 px-4 py-3 text-[#333] text-sm sm:text-base border border-slate-200 sm:border-none rounded-md sm:rounded-none outline-none focus:ring-0 placeholder-slate-400 font-mono"
                  />
                </div>
              ) : (
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder={
                    trackType === "awb"
                      ? "Enter AWB / Consignment Number (e.g. DEL123456)"
                      : "Enter Order / Reference ID (e.g. BK-1025)"
                  }
                  required
                  className="flex-1 px-4 py-3 text-[#333] text-sm sm:text-base border-none outline-none focus:ring-0 placeholder-slate-400 font-mono"
                />
              )}

              <button
                type="submit"
                className="bg-[#FF6B00] hover:bg-[#e05e00] text-white px-7 py-3.5 rounded-md font-semibold text-base transition-colors duration-200 flex items-center justify-center gap-2 whitespace-nowrap shadow-sm cursor-pointer"
              >
                <Search className="w-5 h-5" />
                <span>Track Parcel</span>
              </button>
            </form>

            <div className="mt-3 flex items-center justify-center sm:justify-start gap-5 text-xs text-slate-300">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Multi-Courier Sync
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#FF6B00]" /> Live GPS Tracking
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. QUICK FEATURES (FLOATING CARDS) (From ai_studio_code (14).html) */}
      {/* ========================================================================= */}
      <section className="-mt-14 sm:-mt-16 relative z-10 px-4">
        <div className="w-[90%] max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Card 1 */}
            <Link
              href="/calculator"
              className="bg-white p-6 sm:p-7 rounded-lg shadow-[0_5px_20px_rgba(0,0,0,0.08)] text-center border-b-4 border-[#FF6B00] hover:-translate-y-1 transition-transform duration-300 block group"
            >
              <Calculator className="w-9 h-9 text-[#FF6B00] mx-auto mb-3.5 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-bold text-[#002B49] mb-2 group-hover:text-[#FF6B00] transition-colors">
                Rate Calculator
              </h3>
              <p className="text-sm text-[#666] leading-relaxed">
                Calculate shipping cost instantly by weight & distance.
              </p>
            </Link>

            {/* Card 2 */}
            <Link
              href="/book"
              className="bg-white p-6 sm:p-7 rounded-lg shadow-[0_5px_20px_rgba(0,0,0,0.08)] text-center border-b-4 border-[#FF6B00] hover:-translate-y-1 transition-transform duration-300 block group"
            >
              <Truck className="w-9 h-9 text-[#FF6B00] mx-auto mb-3.5 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-bold text-[#002B49] mb-2 group-hover:text-[#FF6B00] transition-colors">
                Schedule Pickup
              </h3>
              <p className="text-sm text-[#666] leading-relaxed">
                Get doorstep parcel pickup from your home or warehouse.
              </p>
            </Link>

            {/* Card 3 */}
            <Link
              href="/contact"
              className="bg-white p-6 sm:p-7 rounded-lg shadow-[0_5px_20px_rgba(0,0,0,0.08)] text-center border-b-4 border-[#FF6B00] hover:-translate-y-1 transition-transform duration-300 block group"
            >
              <MapPin className="w-9 h-9 text-[#FF6B00] mx-auto mb-3.5 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-bold text-[#002B49] mb-2 group-hover:text-[#FF6B00] transition-colors">
                Locate Hub
              </h3>
              <p className="text-sm text-[#666] leading-relaxed">
                Find the nearest delivery hub and service branches in Jaipur.
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. SERVICES SECTION (From ai_studio_code (14).html) */}
      {/* ========================================================================= */}
      <section className="py-20 sm:py-24 bg-[#F4F7FA] px-4 mt-8 sm:mt-12" id="services">
        <div className="w-[90%] max-w-[1200px] mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-[32px] font-bold text-[#002B49] mb-2.5">
              Our Shipping Services
            </h2>
            <p className="text-[#666] text-sm sm:text-base max-w-xl mx-auto">
              Tailored logistics solutions for individuals and enterprises.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
            {/* Service 1 */}
            <div className="bg-white rounded-lg overflow-hidden shadow-[0_4px_15px_rgba(0,0,0,0.05)] hover:-translate-y-1 transition-transform duration-300">
              <div className="h-44 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=500&q=60"
                  alt="Domestic Courier"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold text-[#002B49] mb-2">
                  Domestic Delivery
                </h3>
                <p className="text-sm text-[#666] leading-relaxed">
                  Fast delivery across all pincodes with cash on delivery (COD).
                </p>
              </div>
            </div>

            {/* Service 2 */}
            <div className="bg-white rounded-lg overflow-hidden shadow-[0_4px_15px_rgba(0,0,0,0.05)] hover:-translate-y-1 transition-transform duration-300">
              <div className="h-44 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1524522173746-f628baad3644?auto=format&fit=crop&w=500&q=60"
                  alt="International Shipping"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold text-[#002B49] mb-2">
                  International Cargo
                </h3>
                <p className="text-sm text-[#666] leading-relaxed">
                  Worldwide parcel delivery with complete customs clearance support.
                </p>
              </div>
            </div>

            {/* Service 3 */}
            <div className="bg-white rounded-lg overflow-hidden shadow-[0_4px_15px_rgba(0,0,0,0.05)] hover:-translate-y-1 transition-transform duration-300">
              <div className="h-44 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&w=500&q=60"
                  alt="Same Day Delivery"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold text-[#002B49] mb-2">
                  Same Day / Express
                </h3>
                <p className="text-sm text-[#666] leading-relaxed">
                  Urgent documents and high-priority parcels delivered within hours.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. HOW IT WORKS (From ai_studio_code (14).html) */}
      {/* ========================================================================= */}
      <section className="py-20 sm:py-24 bg-white px-4">
        <div className="w-[90%] max-w-[1200px] mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-2xl sm:text-3xl md:text-[32px] font-bold text-[#002B49] mb-2.5">
              How It Works
            </h2>
            <p className="text-[#666] text-sm sm:text-base max-w-xl mx-auto">
              Track, ship and receive in 4 easy steps
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {/* Step 1 */}
            <div className="space-y-3">
              <div className="w-20 h-20 bg-[#ffe8d6] text-[#FF6B00] rounded-full flex items-center justify-center text-3xl mx-auto shadow-xs">
                <FileText className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-[#002B49]">1. Book</h4>
              <p className="text-sm text-[#666]">Enter parcel details online.</p>
            </div>

            {/* Step 2 */}
            <div className="space-y-3">
              <div className="w-20 h-20 bg-[#ffe8d6] text-[#FF6B00] rounded-full flex items-center justify-center text-3xl mx-auto shadow-xs">
                <Package className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-[#002B49]">2. Pickup</h4>
              <p className="text-sm text-[#666]">We pick up from doorstep.</p>
            </div>

            {/* Step 3 */}
            <div className="space-y-3">
              <div className="w-20 h-20 bg-[#ffe8d6] text-[#FF6B00] rounded-full flex items-center justify-center text-3xl mx-auto shadow-xs">
                <Navigation className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-[#002B49]">3. In Transit</h4>
              <p className="text-sm text-[#666]">Real-time live GPS tracking.</p>
            </div>

            {/* Step 4 */}
            <div className="space-y-3">
              <div className="w-20 h-20 bg-[#ffe8d6] text-[#FF6B00] rounded-full flex items-center justify-center text-3xl mx-auto shadow-xs">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-[#002B49]">4. Delivery</h4>
              <p className="text-sm text-[#666]">Safe delivery with OTP verify.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. STATS COUNTER (From ai_studio_code (14).html) */}
      {/* ========================================================================= */}
      <section className="bg-[#002B49] text-white py-14 px-4 text-center">
        <div className="w-[90%] max-w-[1200px] mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-3xl sm:text-[40px] font-bold text-[#FF6B00] mb-1">5M+</h3>
              <p className="text-sm sm:text-base text-slate-200">Deliveries Done</p>
            </div>
            <div>
              <h3 className="text-3xl sm:text-[40px] font-bold text-[#FF6B00] mb-1">27,000+</h3>
              <p className="text-sm sm:text-base text-slate-200">Pincodes Active</p>
            </div>
            <div>
              <h3 className="text-3xl sm:text-[40px] font-bold text-[#FF6B00] mb-1">99.8%</h3>
              <p className="text-sm sm:text-base text-slate-200">On-Time Delivery</p>
            </div>
            <div>
              <h3 className="text-3xl sm:text-[40px] font-bold text-[#FF6B00] mb-1">24/7</h3>
              <p className="text-sm sm:text-base text-slate-200">Live Support</p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. CALL TO ACTION BANNER */}
      {/* ========================================================================= */}
      <section className="py-14 sm:py-16 px-4">
        <div className="w-[90%] max-w-[1200px] mx-auto bg-gradient-to-r from-[#002B49] to-[#003c66] text-white rounded-xl p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="text-center md:text-left space-y-2 max-w-xl">
            <h2 className="text-2xl sm:text-3xl font-bold">Ready to dispatch your parcel?</h2>
            <p className="text-slate-200 text-sm sm:text-base">
              Book online in under 2 minutes. Transparent rates, multi-carrier network, and 24/7 tracking.
            </p>
          </div>
          <div className="flex flex-wrap gap-4 shrink-0 justify-center">
            <Link
              href="/book"
              className="bg-[#FF6B00] hover:bg-[#e05e00] text-white font-bold px-7 py-3.5 rounded-md text-sm sm:text-base shadow-md transition-colors"
            >
              Book a Parcel Now
            </Link>
            <Link
              href="/contact"
              className="border border-white/80 hover:bg-white/10 text-white font-semibold px-7 py-3.5 rounded-md text-sm sm:text-base transition-colors"
            >
              Contact Hub
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
