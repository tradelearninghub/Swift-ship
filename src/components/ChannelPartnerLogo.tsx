"use client";

import React, { useState } from "react";
import { ChannelPartnerCompany, getPartnerLogo } from "@/lib/partnerChannel";

interface ChannelPartnerLogoProps {
  company: ChannelPartnerCompany;
  className?: string;
}

export function ChannelPartnerLogo({ company, className = "" }: ChannelPartnerLogoProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const effectiveLogoUrl = getPartnerLogo(company.name || company.id, company.logo_url);

  // 1. Primary: Load the verified authentic high-res partner image
  if (effectiveLogoUrl && !imgFailed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={effectiveLogoUrl}
        alt={company.name}
        onError={() => setImgFailed(true)}
        className={`h-full w-full object-contain ${className}`}
        loading="lazy"
      />
    );
  }

  // 2. Fallback to domain favicon if image failed
  const faviconUrl = company.website
    ? `https://www.google.com/s2/favicons?domain=${encodeURIComponent(company.website.replace(/^https?:\/\//i, "").split("/")[0])}&sz=128`
    : "";

  if (faviconUrl && !imgFailed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={faviconUrl}
        alt={company.name}
        onError={() => setImgFailed(true)}
        className={`max-h-9 sm:max-h-10 max-w-[125px] sm:max-w-[145px] object-contain ${className}`}
      />
    );
  }

  // 3. Clean typographic fallback with initials badge
  const initials = (company.name || "")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 3)
    .join("")
    .toUpperCase();

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 text-[#2563EB] font-bold text-xs flex items-center justify-center shrink-0">
        {initials}
      </div>
      <span className="font-bold text-sm text-slate-800 truncate max-w-[110px]">
        {company.name}
      </span>
    </div>
  );
}

