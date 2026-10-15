"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  ArrowRight,
  ShieldCheck,
  Headphones,
  Sliders,
  Truck,
  MapPin,
  CheckCircle2,
  PhoneCall,
  Mail,
  Star,
  Globe2,
  Package,
  FileText,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";

export default function HomePage() {
  const router = useRouter();

  // Quick Tracking state
  const [quickAwb, setQuickAwb] = useState("");

  const handleQuickTrack = (e: React.FormEvent) => {
    e.preventDefault();
    const q = quickAwb.trim();
    if (!q) return;
    router.push(`/track?awb=${encodeURIComponent(q)}`);
  };

  // Instant Rate Calculator state
  const [calcCountry, setCalcCountry] = useState("United States");
  const [calcWeight, setCalcWeight] = useState("1.0");
  const [calcType, setCalcType] = useState<"document" | "parcel" | "express">("parcel");

  // Dynamic estimated rate preview
  const estimatedPrice = React.useMemo(() => {
    const w = parseFloat(calcWeight) || 1.0;
    let base = 1250;
    if (calcCountry === "United States" || calcCountry === "Canada") base = 1650;
    else if (calcCountry === "United Kingdom" || calcCountry === "Germany" || calcCountry === "France") base = 1450;
    else if (calcCountry === "United Arab Emirates" || calcCountry === "Saudi Arabia") base = 950;
    else if (calcCountry === "Australia" || calcCountry === "New Zealand") base = 1750;

    let multiplier = calcType === "document" ? 0.8 : calcType === "express" ? 1.35 : 1.0;
    const total = Math.round((base + (w - 1) * (base * 0.45)) * multiplier);
    return Math.max(total, 599);
  }, [calcCountry, calcWeight, calcType]);

  // FAQ Accordion state (first item open by default)
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const faqs = [
    {
      q: "What types of cargo and goods can be shipped internationally?",
      a: "We ship a wide range of international cargo including commercial merchandise, garments, handcrafted items, personal effects, essential medicines (with valid doctor prescription & bill), electronic items, printed documents, and university transcripts. Hazardous chemicals and prohibited materials are strictly restricted.",
    },
    {
      q: "How long does international air courier delivery take?",
      a: "Our express air network delivers to major global commercial hubs (USA, UK, UAE, Europe, Canada, Australia) within 3 to 6 business days. Remote or regional destinations generally require 5 to 8 business days with continuous online milestone tracking.",
    },
    {
      q: "What is the difference between Dead Weight and Volumetric Weight?",
      a: "Airlines charge according to whichever is greater: actual physical scale weight or dimensional (volumetric) weight. Volumetric weight is calculated using the international IATA formula: (Length × Width × Height in cm) / 5000. For lightweight bulky boxes, volumetric weight applies.",
    },
    {
      q: "What documents are needed for export customs clearance from India?",
      a: "Standard requirements include the sender's KYC (Aadhaar Card, Passport, or PAN for individuals; GST & IEC for business entities), along with an itemized commercial invoice containing product descriptions, quantities, declared values, and HSN codes.",
    },
    {
      q: "What is customs clearance, and how does import duty work at destination?",
      a: "Every cross-border package is inspected by the destination nation's customs agency. Depending on that country's specific duty-free exemption threshold (e.g. De Minimis value) and product category, local customs authorities may assess import tariffs or VAT, payable by the consignee prior to final delivery.",
    },
  ];

  // Callback Form state
  const [cbName, setCbName] = useState("");
  const [cbCompany, setCbCompany] = useState("");
  const [cbEmail, setCbEmail] = useState("");
  const [cbPhone, setCbPhone] = useState("");
  const [cbMessage, setCbMessage] = useState("");
  const [cbAgreed, setCbAgreed] = useState(true);
  const [cbLoading, setCbLoading] = useState(false);
  const [cbSuccess, setCbSuccess] = useState(false);
  const [cbError, setCbError] = useState("");

  const handleCallbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCbError("");
    if (!cbName.trim()) {
      setCbError("Please provide your name.");
      return;
    }
    const cleanMobile = cbPhone.replace(/\D/g, "");
    if (cleanMobile.length !== 10) {
      setCbError("Please enter a valid 10-digit Indian mobile number.");
      return;
    }
    if (!cbEmail.includes("@")) {
      setCbError("Please enter a valid email address.");
      return;
    }
    if (!cbAgreed) {
      setCbError("Please consent to the processing of your contact details.");
      return;
    }

    setCbLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: cbName.trim(),
          email: cbEmail.trim(),
          mobile: cleanMobile,
          subject: `Callback Request - ${cbCompany.trim() || "Individual Exporter"}`,
          message: cbMessage.trim() || "Requested an express callback for international shipment consultation.",
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to submit request.");
      }

      setCbSuccess(true);
      setCbName("");
      setCbCompany("");
      setCbEmail("");
      setCbPhone("");
      setCbMessage("");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setCbError(err.message);
      } else {
        setCbError("Unable to submit callback request right now.");
      }
    } finally {
      setCbLoading(false);
    }
  };

  return (
    <div className="bg-white text-slate-800">
      {/* ========================================================================= */}
      {/* 1. HERO SECTION (Fast. Reliable Courier Service.) */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#070E24] via-[#0B1536] to-[#081226] text-white pt-16 pb-28 md:pt-20 md:pb-36">
        {/* Subtle decorative glow accents */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-10 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="main-container relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/15 border border-blue-400/25 text-blue-300 text-xs font-semibold backdrop-blur-sm">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span>Global Express Air Freight &amp; International Courier</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.08]">
                Fast. Reliable <br />
                <span className="text-white">Courier Service.</span>
              </h1>

              {/* Subtitle */}
              <p className="text-slate-300 text-base sm:text-lg max-w-xl font-normal leading-relaxed">
                Send parcels from India to 220+ countries worldwide starting from ₹599.
                Free doorstep pickup, real-time live GPS tracking, and paperless customs clearance.
              </p>

              {/* Social Proof / Trustpilot Rating Badge */}
              <div className="flex flex-wrap items-center gap-4 pt-1">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/15">
                  <span className="text-white font-bold text-sm">4.5</span>
                  <div className="flex items-center text-emerald-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <span className="text-xs text-slate-300 font-medium border-l border-white/20 pl-2">
                    Trustpilot Verified
                  </span>
                </div>
                <div className="text-xs text-slate-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>99.8% On-Time International Deliveries</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="/book"
                  className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-sm shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <Package className="w-4 h-4" />
                  <span>Book a Parcel Now</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/calculator"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-sm border border-white/20 transition-all hover:-translate-y-0.5"
                >
                  <span>Calculate Shipping Rate</span>
                </Link>
              </div>
            </div>

            {/* Right Visual Column (Delivery Specialist + Live Floating Cards) */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Main Courier Showcase Card */}
                <div className="relative rounded-3xl overflow-hidden border border-white/15 shadow-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm p-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://images.unsplash.com/photo-1580674684081-7617fbf3d745?auto=format&fit=crop&w=800&q=80"
                    alt="SS International Courier Specialist"
                    className="w-full h-80 sm:h-96 object-cover rounded-2xl"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B1536]/90 via-transparent to-transparent rounded-2xl"></div>

                  {/* Overlay Tag inside card */}
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-bold text-base">SS International Courier</p>
                        <p className="text-xs text-blue-300">Fast · Doorstep · Trackable</p>
                      </div>
                      <div className="w-9 h-9 rounded-full bg-[#2563EB] text-white flex items-center justify-center shadow-md">
                        <Globe2 className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Micro-Card 1: Live Status */}
                <div className="absolute -top-4 -left-4 sm:-left-6 bg-white text-slate-800 p-3.5 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3 backdrop-blur-md animate-fade-in">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                      <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Live In Transit</p>
                    </div>
                    <p className="text-xs font-bold text-slate-900">Consignment #DEL9824</p>
                    <p className="text-[10px] text-slate-500">Departed Delhi Hub → London, UK</p>
                  </div>
                </div>

                {/* Floating Micro-Card 2: Doorstep Collection */}
                <div className="absolute -bottom-5 -right-4 sm:-right-6 bg-white text-slate-800 p-3.5 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3 backdrop-blur-md">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">Instant Pickup</p>
                    <p className="text-xs font-bold text-slate-900">Doorstep Collection in India</p>
                    <p className="text-[10px] text-slate-500">Same-Day Hub Handover</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. FLOATING QUICK TRACKING & ACTION BAR (Matches reference exactly) */}
      {/* ========================================================================= */}
      <div className="relative z-30 max-w-6xl mx-auto px-4 -mt-10 sm:-mt-14 mb-16">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 p-5 sm:p-7">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Tracking Search Form */}
            <div className="lg:col-span-6 border-b lg:border-b-0 lg:border-r border-slate-200 pb-5 lg:pb-0 lg:pr-6">
              <div className="flex items-center gap-3 mb-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center shrink-0">
                  <Search className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Tracking Your Parcel</h3>
                  <p className="text-[11px] text-slate-500">Enter your Consignment AWB or Order Reference</p>
                </div>
              </div>

              <form onSubmit={handleQuickTrack} className="flex items-center gap-2">
                <input
                  type="text"
                  value={quickAwb}
                  onChange={(e) => setQuickAwb(e.target.value)}
                  placeholder="Enter your Tracking ID (e.g. DEL98234123)"
                  className="flex-1 h-11 px-3.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-slate-900 placeholder:text-slate-400"
                  required
                />
                <button
                  type="submit"
                  className="h-11 px-5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-500/20 transition-all shrink-0 flex items-center gap-1.5"
                >
                  <span>Track &amp; Trace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>

            {/* Email Support Box */}
            <div className="lg:col-span-3 border-b lg:border-b-0 lg:border-r border-slate-200 pb-4 lg:pb-0 lg:pr-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-slate-500 font-medium">Send Your Document via:</p>
                <a
                  href="mailto:info@ssinternationalcourier.com"
                  className="text-xs sm:text-sm font-bold text-slate-900 hover:text-[#2563EB] transition-colors truncate block"
                >
                  info@ssinternational...
                </a>
              </div>
            </div>

            {/* Phone Support Box */}
            <div className="lg:col-span-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Always On Support:</p>
                <a
                  href="tel:+918000151117"
                  className="text-xs sm:text-sm font-bold text-slate-900 hover:text-[#2563EB] transition-colors block"
                >
                  +91 80001 51117
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. BENTO GRID: Reliability. Speed & Efficiency. (Crisp white canvas) */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="main-container">
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight mb-4">
              Reliability. <span className="text-[#2563EB]">Speed</span> &amp; Efficiency.
            </h2>
            <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
              Every parcel is backed by high-tier international air freight, multi-layer customs validation, and dedicated live tracking.
            </p>
          </div>

          {/* Bento Box Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1: Real-Time Tracking (Crisp White Card) */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-7 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#2563EB] flex items-center justify-center mb-6 shadow-xs">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Real-Time Tracking</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Live tracking + live location updates from pickup in India right to final international delivery.
                </p>
              </div>
            </div>

            {/* Card 2: Photo Card (Happy Business Team / Logistics) */}
            <div className="relative rounded-3xl overflow-hidden min-h-[220px] shadow-xs group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1556745757-8d76bdb6984b?auto=format&fit=crop&w=700&q=80"
                alt="Happy Global Clients"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent"></div>
              <div className="absolute bottom-5 left-5 right-5 text-white">
                <p className="text-xs uppercase tracking-wider font-bold text-blue-300">Global Commerce</p>
                <p className="text-base font-bold">Trusted by 10,000+ Exporters</p>
              </div>
            </div>

            {/* Card 3: 24/7 Customer Support (Solid Sapphire Blue - matches reference) */}
            <div className="bg-[#2563EB] text-white rounded-3xl p-7 shadow-xl shadow-blue-500/20 flex flex-col justify-between hover:-translate-y-1 transition-transform">
              <div className="w-12 h-12 rounded-2xl bg-white/20 text-white flex items-center justify-center mb-6 backdrop-blur-sm">
                <Headphones className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">24/7 Customer Support</h3>
                <p className="text-blue-100 text-sm leading-relaxed">
                  Round-the-clock dedicated assistance for air flight updates, customs documentation, and rapid resolution.
                </p>
              </div>
            </div>

            {/* Card 4: Customized Solutions (Soft Slate / Ice Blue) */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-3xl p-7 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between">
              <div className="w-12 h-12 rounded-2xl bg-white text-slate-700 flex items-center justify-center mb-6 shadow-xs border border-slate-200">
                <Sliders className="w-6 h-6 text-[#2563EB]" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Customized Solutions</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Easy access to tailored cross-border courier packages through mobile and web platforms.
                </p>
              </div>
            </div>

            {/* Card 5: 100% Safe Delivery (Crisp White Card) */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-7 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6 shadow-xs">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">100% Safe Delivery</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Multi-layer international security packaging, fragile cargo protection, and complete consignment transit safety.
                </p>
              </div>
            </div>

            {/* Card 6: Door-to-Door Service (Soft Warm Peach / Sand Tint) */}
            <div className="bg-[#FFF7ED] border border-orange-200/70 rounded-3xl p-7 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between">
              <div className="w-12 h-12 rounded-2xl bg-white text-amber-600 flex items-center justify-center mb-6 shadow-xs border border-orange-200">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Door-to-Door Service</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Door-to-Door Service – Convenient collection at your doorstep in India and delivery right to overseas recipients.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Prompt matching reference */}
          <div className="text-center mt-12 pt-4">
            <p className="text-sm sm:text-base text-slate-600">
              Do not wait to connect to the world one bit at a time!{" "}
              <Link href="/calculator" className="text-[#2563EB] font-bold hover:underline inline-flex items-center gap-1">
                <span>Request a Quote</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. SHIPPING RATE CALCULATOR (With background warehouse photo) */}
      {/* ========================================================================= */}
      <section className="relative py-24 sm:py-32 bg-slate-900 overflow-hidden">
        {/* Background Image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1800&q=80"
          alt="Logistics Warehouse"
          className="absolute inset-0 w-full h-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-900/60"></div>

        <div className="main-container relative z-10">
          {/* Centered Pristine White Calculator Card */}
          <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-2xl p-7 sm:p-10 border border-slate-100">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight mb-2">
                <span className="text-[#2563EB]">Calculate</span> Shipping Rate
              </h2>
              <p className="text-slate-500 text-xs sm:text-sm">
                Get an instant estimate for priority air cargo across 220+ international destinations
              </p>

              {/* Mode Pill */}
              <div className="inline-flex items-center gap-2 mt-4 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-[#2563EB] text-xs font-bold">
                <Globe2 className="w-3.5 h-3.5" />
                <span>Send Internationally (220+ Countries)</span>
              </div>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {/* Origin */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  From (Your Location)
                </label>
                <div className="h-11 px-3.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-700 text-sm flex items-center gap-2 font-medium">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <span>India (All Major Hubs &amp; Cities)</span>
                </div>
              </div>

              {/* Destination Country */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  To (Destination Country)
                </label>
                <select
                  value={calcCountry}
                  onChange={(e) => setCalcCountry(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                >
                  <option value="United States">United States (USA)</option>
                  <option value="United Kingdom">United Kingdom (UK)</option>
                  <option value="Canada">Canada</option>
                  <option value="United Arab Emirates">United Arab Emirates (UAE)</option>
                  <option value="Australia">Australia</option>
                  <option value="Germany">Germany</option>
                  <option value="France">France</option>
                  <option value="Saudi Arabia">Saudi Arabia</option>
                  <option value="Singapore">Singapore</option>
                  <option value="New Zealand">New Zealand</option>
                </select>
              </div>

              {/* Weight */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Weight (Kilograms)
                </label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={calcWeight}
                  onChange={(e) => setCalcWeight(e.target.value)}
                  placeholder="e.g. 2.5"
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                />
              </div>

              {/* Shipment Type */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Shipment Type
                </label>
                <select
                  value={calcType}
                  onChange={(e) => setCalcType(e.target.value as "document" | "parcel" | "express")}
                  className="w-full h-11 px-3 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                >
                  <option value="parcel">Standard Commercial Parcel</option>
                  <option value="document">Legal / Business Documents</option>
                  <option value="express">Express Priority Air Freight</option>
                </select>
              </div>
            </div>

            {/* Price Preview & CTA Row */}
            <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-xs text-slate-500 font-medium">Estimated Starting Rate:</p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900">₹{estimatedPrice.toLocaleString("en-IN")}</span>
                  <span className="text-xs text-slate-500">approx. base air tariff</span>
                </div>
              </div>

              <Link
                href={`/book?country=${encodeURIComponent(calcCountry)}&weight=${encodeURIComponent(calcWeight)}`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-sm shadow-md shadow-blue-500/25 transition-all transform hover:-translate-y-0.5"
              >
                <span>Book This Shipment</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. DELIVERY MILESTONE BANNER (Fast. Reliable. Trackable Deliveries) */}
      {/* ========================================================================= */}
      <section className="relative py-20 bg-slate-900 overflow-hidden text-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1566576912321-d58ddd74335a?auto=format&fit=crop&w=1600&q=80"
          alt="Delivery Milestone"
          className="absolute inset-0 w-full h-full object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#070D1B]/95 via-[#070D1B]/80 to-transparent"></div>

        <div className="main-container relative z-10">
          <div className="max-w-2xl space-y-4">
            <p className="text-xs sm:text-sm font-bold text-blue-400 uppercase tracking-widest">
              We&apos;ve delivered over 1.2 million parcels.
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              Fast. Reliable. Trackable Deliveries
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Serving domestic exporters and international recipients with end-to-end flight booking, automated customs clearance, and instant SMS/WhatsApp milestone updates.
            </p>
            <div className="pt-2">
              <Link
                href="/book"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all transform hover:-translate-y-0.5"
              >
                <span>Start Your Shipment</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. FAQ ACCORDION SECTION (Clean White Background) */}
      {/* ========================================================================= */}
      <section className="py-20 sm:py-24 bg-white border-b border-slate-100">
        <div className="main-container max-w-4xl">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-3">
              Frequently Asked &amp; Questions
            </h2>
            <p className="text-slate-500 text-sm sm:text-base">
              Clear answers to the most common queries about international courier shipping and customs.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className={`rounded-2xl border transition-colors ${
                    isOpen ? "border-[#2563EB]/40 bg-slate-50/70 shadow-xs" : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="w-full py-4 sm:py-5 px-5 sm:px-6 flex items-center justify-between text-left gap-4 font-bold text-slate-900 text-sm sm:text-base focus:outline-none"
                  >
                    <span>{faq.q}</span>
                    <span className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center shrink-0 text-slate-600">
                      {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-5 sm:px-6 pb-5 pt-1 text-slate-600 text-xs sm:text-sm leading-relaxed border-t border-slate-200/60">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Bottom link matching reference */}
          <div className="text-right mt-6">
            <Link href="/contact" className="text-xs sm:text-sm font-semibold text-[#2563EB] hover:underline inline-flex items-center gap-1">
              <span>Drop Your Question →</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. CONTACT / CALLBACK BANNER (Split: Photo on Left + Dark Form on Right) */}
      {/* ========================================================================= */}
      <section className="py-20 sm:py-28 bg-[#F8FAFC]">
        <div className="main-container">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
            {/* Left: Friendly Courier Photo */}
            <div className="lg:col-span-5 relative rounded-3xl overflow-hidden shadow-xl min-h-[360px] lg:min-h-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1586528116493-a029325540fa?auto=format&fit=crop&w=800&q=80"
                alt="Courier Driver"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B1536]/80 via-transparent to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <p className="text-xs font-bold uppercase tracking-wider text-blue-300">Fast Assistance</p>
                <h3 className="text-xl font-bold">Dedicated Export Logistics Desk</h3>
                <p className="text-xs text-slate-300 mt-1">Our customer support responds within 15 minutes.</p>
              </div>
            </div>

            {/* Right: Sleek Deep Navy Callback Card */}
            <div className="lg:col-span-7 bg-[#0B1536] text-white rounded-3xl p-7 sm:p-10 shadow-2xl">
              <div className="mb-6">
                <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-1.5">
                  Request a Fast Callback
                </h3>
                <p className="text-slate-300 text-xs sm:text-sm">
                  Fill in your details below and an international freight specialist will assist with rates and pickup.
                </p>
              </div>

              {cbSuccess ? (
                <div className="bg-emerald-500/20 border border-emerald-400/30 rounded-2xl p-6 text-center space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                  <h4 className="text-lg font-bold text-white">Thank You! Request Received</h4>
                  <p className="text-xs text-slate-300">
                    Our team has received your details and will call you shortly on your provided mobile number.
                  </p>
                  <button
                    type="button"
                    onClick={() => setCbSuccess(false)}
                    className="mt-3 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold"
                  >
                    Submit Another Inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleCallbackSubmit} className="space-y-4">
                  {cbError && (
                    <div className="p-3 bg-red-500/20 border border-red-500/40 rounded-xl text-red-200 text-xs font-medium">
                      {cbError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Full Name <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={cbName}
                        onChange={(e) => setCbName(e.target.value)}
                        placeholder="e.g. Rahul Sharma"
                        required
                        className="w-full h-11 px-3.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                      />
                    </div>

                    {/* Company Name */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Company Name (Optional)
                      </label>
                      <input
                        type="text"
                        value={cbCompany}
                        onChange={(e) => setCbCompany(e.target.value)}
                        placeholder="e.g. Sharma Exports"
                        className="w-full h-11 px-3.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Your Email <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="email"
                        value={cbEmail}
                        onChange={(e) => setCbEmail(e.target.value)}
                        placeholder="e.g. rahul@example.com"
                        required
                        className="w-full h-11 px-3.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                      />
                    </div>

                    {/* Phone Number */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Phone Number (10 digits) <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="tel"
                        maxLength={10}
                        value={cbPhone}
                        onChange={(e) => setCbPhone(e.target.value.replace(/\D/g, ""))}
                        placeholder="e.g. 9829012345"
                        required
                        className="w-full h-11 px-3.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                      />
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Shipment Details / Message
                    </label>
                    <textarea
                      rows={3}
                      value={cbMessage}
                      onChange={(e) => setCbMessage(e.target.value)}
                      placeholder="Destination country, approximate weight, and item details..."
                      className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                    ></textarea>
                  </div>

                  {/* Checkbox */}
                  <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={cbAgreed}
                      onChange={(e) => setCbAgreed(e.target.checked)}
                      className="w-4 h-4 rounded text-[#2563EB] focus:ring-blue-500 bg-white/10 border-white/20"
                    />
                    <span>I consent to my data being processed according to the privacy policy</span>
                  </label>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={cbLoading}
                      className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all transform hover:-translate-y-0.5 disabled:opacity-50"
                    >
                      {cbLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <span>Request Callback</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
