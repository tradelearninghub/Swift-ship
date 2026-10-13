"use client";

import React, { useState, useEffect } from "react";
import { Globe, Plane, ShieldCheck, CheckCircle2 } from "lucide-react";
import { InternationalBookingForm } from "@/components/booking/InternationalBookingForm";

export default function BookParcelPage() {
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);

  // Load authenticated customer details & address book on mount
  useEffect(() => {
    async function loadAddressBook() {
      try {
        const authRes = await fetch("/api/auth/me");
        if (authRes.ok) {
          const authData = await authRes.json();
          if (authData.user) {
            const addrRes = await fetch("/api/customer/addresses");
            if (addrRes.ok) {
              const addrData = await addrRes.json();
              setSavedAddresses(addrData.addresses || []);
            }
          }
        }
      } catch (e) {
        // Guest user browsing unauthenticated
      }
    }
    loadAddressBook();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-8 animate-in fade-in-50 duration-300">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase bg-sky-50 text-sky-800 border border-sky-200 shadow-xs">
          <Plane className="w-3.5 h-3.5 text-sky-600 animate-pulse" />
          <span>Global Air Express Courier</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#002B49] tracking-tight">
          Book International Shipment
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Fast, customs-cleared global parcel dispatch across 220+ countries with automated commercial invoices, live tracking, and door-to-door transit.
        </p>

        {/* Feature Highlights Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 max-w-2xl mx-auto text-left">
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-slate-200/80 shadow-xs">
            <Globe className="w-4 h-4 text-sky-600 shrink-0" />
            <div className="text-xs">
              <span className="font-semibold text-slate-800 block">220+ Destinations</span>
              <span className="text-slate-500 text-[11px]">USA, UK, UAE, EU & more</span>
            </div>
          </div>
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-slate-200/80 shadow-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <div className="text-xs">
              <span className="font-semibold text-slate-800 block">Customs & IOSS Ready</span>
              <span className="text-slate-500 text-[11px]">Commercial invoice support</span>
            </div>
          </div>
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-slate-200/80 shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
            <div className="text-xs">
              <span className="font-semibold text-slate-800 block">INR & USD Currency</span>
              <span className="text-slate-500 text-[11px]">Auto live FX conversion</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main International Booking Engine */}
      <InternationalBookingForm savedAddresses={savedAddresses} />
    </div>
  );
}
