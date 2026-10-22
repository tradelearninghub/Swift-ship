"use client";

import React, { useState } from "react";
import { ChannelPartnerCompany } from "@/lib/partnerChannel";

interface ChannelPartnerLogoProps {
  company: ChannelPartnerCompany;
  className?: string;
}

export function ChannelPartnerLogo({ company, className = "" }: ChannelPartnerLogoProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const nameLower = (company.name || "").toLowerCase().trim();
  const websiteLower = (company.website || "").toLowerCase().trim();

  // 1. Authentic SVG / stylized brand renderers for standard carriers in reference image
  if (nameLower.includes("uniuni") || websiteLower.includes("uniuni")) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <span className="font-extrabold text-2xl sm:text-3xl tracking-tight text-[#FF6600]">
          uni<span className="text-[#FF6600]/90">uni</span>
        </span>
      </div>
    );
  }

  if (nameLower === "ups" || nameLower.includes("united parcel") || websiteLower.includes("ups.com")) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <svg className="h-10 w-auto" viewBox="0 0 100 120" fill="none">
          {/* UPS Shield */}
          <path
            d="M50 0 C77 0 95 15 95 45 C95 85 50 118 50 118 C50 118 5 85 5 45 C5 15 23 0 50 0 Z"
            fill="#351C15"
          />
          <path
            d="M50 8 C72 8 87 20 87 45 C87 78 50 106 50 106 C50 106 13 78 13 45 C13 20 28 8 50 8 Z"
            fill="#FFB500"
          />
          <path
            d="M50 15 C68 15 80 25 80 45 C80 72 50 96 50 96 C50 96 20 72 20 45 C20 25 32 15 50 15 Z"
            fill="#351C15"
          />
          <text
            x="50"
            y="65"
            fill="#FFB500"
            fontSize="34"
            fontWeight="900"
            textAnchor="middle"
            fontFamily="sans-serif"
          >
            ups
          </text>
        </svg>
      </div>
    );
  }

  if (nameLower.includes("usps") || nameLower.includes("postal service") || websiteLower.includes("usps.com")) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="w-8 h-8 bg-[#004B87] rounded flex items-center justify-center text-white">
          <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24">
            <path d="M12 2L2 7l10 5 10-5-10-5zm0 8.5L4.5 7.2 12 3.8l7.5 3.4L12 10.5zm0 2.5L2 8v8l10 5 10-5V8l-10 5zm0 8.5l-8-4v-5l8 4 8-4v5l-8 4z" />
          </svg>
        </div>
        <div className="flex flex-col text-left leading-none">
          <span className="font-extrabold text-[11px] text-[#004B87] tracking-wider uppercase">
            UNITED STATES
          </span>
          <span className="font-bold text-[9px] text-[#004B87]/80 tracking-widest uppercase">
            POSTAL SERVICE
          </span>
        </div>
      </div>
    );
  }

  if (nameLower.includes("yunexpress") || websiteLower.includes("yunexpress")) {
    return (
      <div className={`flex items-center gap-1.5 ${className}`}>
        <svg className="w-7 h-7 text-[#009688]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
        </svg>
        <span className="font-bold text-lg text-[#009688] tracking-tight">YunExpress</span>
      </div>
    );
  }

  if (nameLower.includes("aramex") || websiteLower.includes("aramex")) {
    return (
      <div className={`flex flex-col items-center justify-center leading-none ${className}`}>
        <span className="font-black text-2xl text-[#E31837] tracking-tighter">aramex</span>
        <span className="text-[7.5px] font-semibold text-slate-500 tracking-wider">delivery unlimited</span>
      </div>
    );
  }

  if (nameLower.includes("dhl") || websiteLower.includes("dhl")) {
    return (
      <div className={`bg-[#FFCC00] px-3.5 py-1.5 rounded-md flex items-center justify-center ${className}`}>
        <span className="font-black text-2xl text-[#D40511] tracking-wider italic font-sans">
          DHL
        </span>
      </div>
    );
  }

  if (nameLower.includes("dpd") || websiteLower.includes("dpd")) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="w-7 h-7 bg-[#DC0032] rounded flex items-center justify-center shadow-xs">
          <div className="w-3.5 h-3.5 bg-white transform rotate-45" />
        </div>
        <span className="font-black text-2xl text-[#2B2B2A] tracking-tighter">dpd</span>
      </div>
    );
  }

  if (nameLower.includes("fedex") || websiteLower.includes("fedex")) {
    return (
      <div className={`flex items-center justify-center font-black text-2xl tracking-tight ${className}`}>
        <span className="text-[#4D148C]">Fed</span>
        <span className="text-[#FF6600]">Ex</span>
      </div>
    );
  }

  if (nameLower.includes("gofo") || websiteLower.includes("gofo")) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <span className="font-black text-2xl text-[#FF5500] italic tracking-tight">GOFO</span>
      </div>
    );
  }

  if (nameLower.includes("canada post") || websiteLower.includes("canadapost")) {
    return (
      <div className={`flex items-center gap-1.5 justify-center ${className}`}>
        <span className="font-black text-base sm:text-lg text-[#002F6C] tracking-tight uppercase">
          CANADA <span className="text-[#DA291C]">POST</span>
        </span>
      </div>
    );
  }

  if (nameLower.includes("india post") || nameLower.includes("indian post") || websiteLower.includes("indiapost")) {
    return (
      <div className={`flex items-center gap-1.5 justify-center ${className}`}>
        <div className="w-6 h-6 rounded bg-[#E41C23] flex items-center justify-center text-white font-bold text-xs">
          ✉
        </div>
        <span className="font-extrabold text-base sm:text-lg text-[#E41C23] tracking-tight">
          India <span className="text-[#FDB813]">Post</span>
        </span>
      </div>
    );
  }

  if (nameLower.includes("yodel") || websiteLower.includes("yodel")) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <span className="font-black text-2xl text-[#00A551] tracking-tighter uppercase">
          YODEL
        </span>
      </div>
    );
  }

  if (nameLower.includes("toll") || websiteLower.includes("tollgroup")) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <span className="font-black text-2xl text-[#E31837] tracking-wider uppercase">
          TOLL
        </span>
      </div>
    );
  }

  if (nameLower.includes("skynet") || websiteLower.includes("skynet")) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <span className="font-black italic text-xl sm:text-2xl text-[#003896] tracking-tight">
          SKY<span className="text-[#E31837]">NET</span>
        </span>
      </div>
    );
  }

  if (nameLower.includes("ship global") || websiteLower.includes("shipglobal")) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <span className="font-extrabold text-xl text-[#0B2545] tracking-tight">
          Ship<span className="text-[#FF6B35]">Global</span>
        </span>
      </div>
    );
  }

  if (nameLower.includes("xportal") || websiteLower.includes("xportal")) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <span className="font-black text-xl text-[#0F172A] tracking-wider uppercase">
          X<span className="text-[#7C3AED]">PORTAL</span>
        </span>
      </div>
    );
  }

  if (nameLower.includes("dhl") && (nameLower.includes("ecommerce") || nameLower.includes("e-commerce"))) {
    return (
      <div className={`flex items-center gap-1.5 justify-center ${className}`}>
        <span className="font-black text-2xl text-[#D40511] tracking-tighter">DHL</span>
        <span className="font-semibold text-xs text-slate-700 uppercase tracking-widest">eCommerce</span>
      </div>
    );
  }

  // 2. Fallback to image (either custom logo_url or domain favicon) if available and not failed
  const effectiveLogoUrl = company.logo_url?.trim() || (company.website ? `https://www.google.com/s2/favicons?domain=${encodeURIComponent(company.website.replace(/^https?:\/\//i, "").split("/")[0])}&sz=128` : "");

  if (effectiveLogoUrl && !imgFailed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={effectiveLogoUrl}
        alt={company.name}
        onError={() => setImgFailed(true)}
        className={`max-h-9 sm:max-h-10 max-w-[125px] sm:max-w-[145px] object-contain transition-all duration-200 ${className}`}
      />
    );
  }

  // 3. Clean typographic fallback with initials badge
  const initials = company.name
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
