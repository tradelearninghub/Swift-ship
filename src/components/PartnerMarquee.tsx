"use client";

import React, { useEffect, useState } from "react";
import { ChannelPartnerCompany, DEFAULT_PARTNER_COMPANIES, getPartnerLogo } from "@/lib/partnerChannel";
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

  // Duplicate for smooth seamless infinite scroll looping
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

        <div className="flex gap-6 w-max animate-marquee group-hover:[animation-play-state:paused] py-4 items-center">
          {marqueeItems.map((company, idx) => {
            const logoSrc = getPartnerLogo(company.name || company.id, company.logo_url);
            return (
              <div
                key={`${company.id}-${idx}`}
                className="flex h-24 w-40 shrink-0 items-center justify-center rounded-lg bg-white p-4 shadow-sm border border-slate-100/90 transition-transform duration-300 hover:scale-105 group/card"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt={company.name}
                  className="h-full w-full object-contain select-none transition-transform duration-300 group-hover/card:scale-105"
                  loading="lazy"
                  src={logoSrc}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

