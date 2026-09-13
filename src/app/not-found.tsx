"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Package,
  Search,
  Home,
  ArrowLeft,
  Truck,
  Phone,
  Calculator,
  Compass,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  const router = useRouter();
  const [awbQuery, setAwbQuery] = useState("");

  const handleQuickTrack = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = awbQuery.trim();
    if (trimmed) {
      router.push(`/track?awb=${encodeURIComponent(trimmed)}`);
    } else {
      router.push("/track");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between text-[#222]">
      {/* Top Header Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="logo text-xl font-extrabold text-[#0B2A4A] tracking-tight">
            SS Courier<span className="text-[#FF6B00]"> services</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/track"
              className="text-xs sm:text-sm font-semibold text-slate-600 hover:text-[#FF6B00] transition-colors hidden sm:inline"
            >
              Track Shipment
            </Link>
            <Link
              href="/book"
              className="px-3.5 py-1.5 rounded-lg bg-[#FF6B00] hover:bg-[#e05f00] text-white text-xs sm:text-sm font-semibold transition-colors shadow-sm"
            >
              Book a Parcel
            </Link>
          </div>
        </div>
      </header>

      {/* Main 404 Hero Section */}
      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6">
        <div className="max-w-3xl w-full text-center space-y-8">
          {/* Animated/Vibrant 404 Badge & Graphic */}
          <div className="relative inline-block">
            <div className="text-8xl sm:text-9xl font-black tracking-tighter text-slate-200 select-none">
              404
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-[#0B2A4A] to-[#1A3B5C] text-white shadow-xl flex items-center justify-center border-2 border-white transform -rotate-6">
                <Package className="w-8 h-8 sm:w-10 sm:h-10 text-[#FF6B00]" />
              </div>
            </div>
          </div>

          {/* Heading & Context */}
          <div className="space-y-3 max-w-xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
              <Compass className="w-3.5 h-3.5 text-amber-600" />
              Consignment / Page Lost in Transit
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-[#0B2A4A] tracking-tight">
              We couldn&apos;t find that page
            </h1>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              The link you followed may be broken, or the consignment tracking URL may have expired.
              Use the tools below to get back on route.
            </p>
          </div>

          {/* Quick Tracking Search Box */}
          <div className="max-w-md mx-auto bg-white p-2 rounded-2xl shadow-md border border-slate-200">
            <form onSubmit={handleQuickTrack} className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={awbQuery}
                  onChange={(e) => setAwbQuery(e.target.value)}
                  placeholder="Enter AWB or Tracking No..."
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-transparent border-none focus:outline-none text-slate-800 placeholder-slate-400"
                />
              </div>
              <Button
                type="submit"
                size="sm"
                className="bg-[#0B2A4A] hover:bg-[#1A3B5C] text-white text-xs px-4"
              >
                Track Now
              </Button>
            </form>
          </div>

          {/* Helpful Navigation Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-left max-w-2xl mx-auto pt-2">
            <Link
              href="/"
              className="p-4 rounded-xl bg-white border border-slate-200 hover:border-[#FF6B00]/40 hover:shadow-md transition-all group"
            >
              <div className="w-9 h-9 rounded-lg bg-blue-50 text-[#0B2A4A] flex items-center justify-center mb-2.5 group-hover:bg-[#0B2A4A] group-hover:text-white transition-colors">
                <Home className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#FF6B00] transition-colors">
                Home Portal
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Return to our main logistics homepage
              </p>
            </Link>

            <Link
              href="/calculator"
              className="p-4 rounded-xl bg-white border border-slate-200 hover:border-[#FF6B00]/40 hover:shadow-md transition-all group"
            >
              <div className="w-9 h-9 rounded-lg bg-orange-50 text-[#FF6B00] flex items-center justify-center mb-2.5 group-hover:bg-[#FF6B00] group-hover:text-white transition-colors">
                <Calculator className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#FF6B00] transition-colors">
                Rate Calculator
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Estimate cargo shipping costs across India
              </p>
            </Link>

            <Link
              href="/contact"
              className="p-4 rounded-xl bg-white border border-slate-200 hover:border-[#FF6B00]/40 hover:shadow-md transition-all group"
            >
              <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-2.5 group-hover:bg-emerald-700 group-hover:text-white transition-colors">
                <Phone className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#FF6B00] transition-colors">
                Help & Contact
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Direct phone & email support assistance
              </p>
            </Link>
          </div>

          {/* Back Action */}
          <div className="pt-2">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Go Back to Previous Page
            </button>
          </div>
        </div>
      </main>

      {/* Footer Bar with Attribution */}
      <footer className="bg-slate-900 text-slate-400 py-6 border-t border-slate-800 text-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <p>
            Developed & Managed by{" "}
            <a
              href="https://decentonline.in"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-300 hover:text-[#FF6B00] font-medium transition-colors underline underline-offset-2"
            >
              Decent Online
            </a>
          </p>
          <div className="flex items-center gap-4 text-xs">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <Link href="/track" className="hover:text-white transition-colors">
              Tracking
            </Link>
            <Link href="/contact" className="hover:text-white transition-colors">
              Contact
            </Link>
            <Link href="/shipping-policy" className="hover:text-white transition-colors">
              Shipping Policy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
