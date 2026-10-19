"use client";

import React, { useEffect, useState } from "react";
import { ChannelPartnerCompany, DEFAULT_PARTNER_COMPANIES } from "@/lib/partnerChannel";
import { ChannelPartnerLogo } from "@/components/ChannelPartnerLogo";

interface PartnerMarqueeProps {
  initialVisible?: boolean;
}

export function PartnerMarquee({ initialVisible = true }: PartnerMarqueeProps) {
  const [isVisible, setIsVisible] = useState(initialVisible);
  const [companies, setCompanies] = useState<ChannelPartnerCompany[]>(DEFAULT_PARTNER_COMPANIES);

  useEffect(() => {
    fetch("/api/partner-channel")
      .then((res) => res.json())
      .then((data) => {
        if (typeof data.is_visible === "boolean") {
          setIsVisible(data.is_visible);
        }
        if (data.companies && Array.isArray(data.companies) && data.companies.length > 0) {
          setCompanies(data.companies);
        }
      })
      .catch(() => {});
  }, []);

  if (!isVisible || companies.length === 0) {
    return null;
  }

  // Duplicate for smooth seamless looping
  const marqueeItems = [...companies, ...companies, ...companies];

  return (
    <section className="py-12 sm:py-16 bg-white border-y border-slate-100 overflow-hidden relative">
      <div className="main-container mb-8 text-center">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0B1536] tracking-tight">
          Our Channel Partner
        </h2>
      </div>

      {/* Marquee Track (Smooth Infinite Scroll with pause on hover) */}
      <div className="relative w-full overflow-hidden group">
        {/* Subtle Edge Gradient Masks */}
        <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-24 bg-gradient-to-r from-white via-white/80 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-24 bg-gradient-to-l from-white via-white/80 to-transparent z-10 pointer-events-none" />

        <div className="flex gap-4 sm:gap-6 w-max animate-marquee group-hover:[animation-play-state:paused] py-2 items-center">
          {marqueeItems.map((company, idx) => (
            <div
              key={`${company.id}-${idx}`}
              className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all duration-300 px-6 sm:px-8 py-3 sm:py-4 flex items-center justify-center min-w-[150px] sm:min-w-[180px] h-20 sm:h-22 shrink-0 group/card"
            >
              <ChannelPartnerLogo
                company={company}
                className="group-hover/card:scale-105 transition-transform duration-200"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

