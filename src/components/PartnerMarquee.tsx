"use client";

import React, { useEffect, useState } from "react";
import { COURIER_COMPANIES_CATALOG } from "@/lib/courierPartnersData";
import { CourierBrandLogo } from "@/components/CourierBrandLogo";
import { ShieldCheck, Sparkles } from "lucide-react";

interface PartnerMarqueeProps {
  initialVisible?: boolean;
}

export function PartnerMarquee({ initialVisible = true }: PartnerMarqueeProps) {
  const [isVisible, setIsVisible] = useState(initialVisible);

  useEffect(() => {
    // Fetch live visibility settings
    fetch("/api/partner-channel")
      .then((res) => res.json())
      .then((data) => {
        if (typeof data.is_visible === "boolean") {
          setIsVisible(data.is_visible);
        }
      })
      .catch(() => {});
  }, []);

  if (!isVisible) {
    return null;
  }

  // Split into Indian and International partners or dual tracks for a rich presentation
  const indianCouriers = COURIER_COMPANIES_CATALOG.filter((c) => c.country === "India");
  const intlCouriers = COURIER_COMPANIES_CATALOG.filter((c) => c.country === "International / USA");

  // Duplicate arrays to create continuous infinite loops
  const row1 = [...COURIER_COMPANIES_CATALOG, ...COURIER_COMPANIES_CATALOG];
  const row2 = [...intlCouriers, ...indianCouriers, ...intlCouriers, ...indianCouriers];

  return (
    <section className="py-12 sm:py-16 bg-gradient-to-b from-slate-50/80 via-white to-slate-50/50 border-y border-slate-200/80 overflow-hidden relative">
      {/* Decorative background glows */}
      <div className="absolute top-1/2 left-0 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 pointer-events-none" />
      <div className="absolute top-1/2 right-0 w-72 h-72 bg-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 pointer-events-none" />

      <div className="main-container mb-8 text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-[#2563EB] text-xs font-bold mb-3 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Multi-Carrier Global Partner Network</span>
        </div>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
          Integrated with <span className="text-[#2563EB]">Leading Express Networks</span>
        </h2>
        <p className="text-slate-500 text-xs sm:text-sm max-w-2xl mx-auto mt-2">
          Direct API integration &amp; priority transit with India&apos;s foremost domestic couriers and major US/International air cargo carriers.
        </p>
      </div>

      {/* Marquee Track 1 (Left Scrolling) */}
      <div className="relative w-full overflow-hidden mb-4 group">
        {/* Left & Right gradient fade masks */}
        <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-r from-white via-white/80 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-l from-white via-white/80 to-transparent z-10 pointer-events-none" />

        <div className="flex gap-4 w-max animate-marquee group-hover:[animation-play-state:paused] py-1">
          {row1.map((partner, idx) => (
            <CourierBrandLogo
              key={`track1-${partner.id}-${idx}`}
              partner={partner}
              className="hover:scale-105 transition-transform duration-200 shrink-0"
            />
          ))}
        </div>
      </div>

      {/* Marquee Track 2 (Right Scrolling - Reverse) */}
      <div className="relative w-full overflow-hidden group">
        <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-r from-white via-white/80 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-l from-white via-white/80 to-transparent z-10 pointer-events-none" />

        <div className="flex gap-4 w-max animate-marquee-reverse group-hover:[animation-play-state:paused] py-1">
          {row2.map((partner, idx) => (
            <CourierBrandLogo
              key={`track2-${partner.id}-${idx}`}
              partner={partner}
              className="hover:scale-105 transition-transform duration-200 shrink-0"
            />
          ))}
        </div>
      </div>

      {/* Bottom Confidence Badges */}
      <div className="main-container mt-8 pt-4 border-t border-slate-200/60 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-xs text-slate-500 font-medium">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Real-Time Milestone Webhooks</span>
        </div>
        <span className="opacity-30 hidden sm:inline">•</span>
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          <span>Standardized Commercial Invoices</span>
        </div>
        <span className="opacity-30 hidden sm:inline">•</span>
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-indigo-600" />
          <span>Direct Airway Bill (AWB) Barcode Generation</span>
        </div>
      </div>
    </section>
  );
}
