import React from "react";
import { CourierCompanyPartner } from "@/lib/courierPartnersData";

interface CourierBrandLogoProps {
  partner: CourierCompanyPartner;
  variant?: "full" | "compact";
  className?: string;
}

export function CourierBrandLogo({ partner, variant = "full", className = "" }: CourierBrandLogoProps) {
  // Render specific brand logo icon with authentic brand marks
  const renderBrandIcon = () => {
    switch (partner.logoType) {
      case "fedex":
        return (
          <div className="flex items-center font-black text-base tracking-tighter leading-none select-none">
            <span style={{ color: "#4D148C" }}>Fed</span>
            <span style={{ color: "#FF6600" }}>Ex</span>
          </div>
        );

      case "dhl":
        return (
          <div className="bg-[#FFCC00] text-[#D40511] font-black italic px-2 py-0.5 rounded text-sm tracking-wider select-none border border-amber-400">
            DHL
          </div>
        );

      case "ups":
        return (
          <div className="w-8 h-8 rounded-lg bg-[#351C15] text-[#FFB500] flex items-center justify-center font-black text-xs shadow-xs border border-amber-500/30">
            <span className="tracking-tighter">UPS</span>
          </div>
        );

      case "usps":
        return (
          <div className="w-8 h-8 rounded-lg bg-[#004B87] text-white flex items-center justify-center font-black text-[10px] shadow-xs border border-blue-400/30">
            <span className="tracking-tighter">USPS</span>
          </div>
        );

      case "delhivery":
        return (
          <div className="w-8 h-8 rounded-lg bg-[#E31837] text-white flex items-center justify-center font-black text-xs shadow-xs">
            <span>D</span>
          </div>
        );

      case "bluedart":
        return (
          <div className="bg-[#002B66] text-white font-extrabold italic px-2 py-0.5 rounded text-xs select-none border-l-2 border-[#CC0000]">
            BLUE DART
          </div>
        );

      case "dtdc":
        return (
          <div className="flex items-center gap-1 font-black text-xs select-none">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D32F2F] inline-block animate-pulse"></span>
            <span className="text-[#D32F2F]">DTDC</span>
          </div>
        );

      case "indiapost":
        return (
          <div className="w-8 h-8 rounded-lg bg-[#C62828] text-[#F9A825] flex items-center justify-center font-black text-[11px] border border-amber-400/40">
            <span>IP</span>
          </div>
        );

      case "ekart":
        return (
          <div className="w-8 h-8 rounded-lg bg-[#2874F0] text-[#FFE500] flex items-center justify-center font-extrabold text-xs">
            <span>eK</span>
          </div>
        );

      case "shadowfax":
        return (
          <div className="w-8 h-8 rounded-lg bg-[#1E293B] text-[#F59E0B] flex items-center justify-center font-bold text-xs border border-amber-500/30">
            <span>SF</span>
          </div>
        );

      case "xpressbees":
        return (
          <div className="w-8 h-8 rounded-lg bg-[#FF6F00] text-white flex items-center justify-center font-black text-xs shadow-xs">
            <span>XB</span>
          </div>
        );

      case "tpc":
        return (
          <div className="w-8 h-8 rounded-lg bg-[#B71C1C] text-white flex items-center justify-center font-bold text-[10px] border border-blue-600">
            <span>TPC</span>
          </div>
        );

      case "aramex":
        return (
          <div className="text-[#E31837] font-black tracking-wider text-xs select-none">
            aramex
          </div>
        );

      case "tnt":
        return (
          <div className="bg-[#FF6600] text-white font-black px-1.5 py-0.5 rounded text-xs tracking-tight select-none">
            TNT
          </div>
        );

      case "royalmail":
        return (
          <div className="w-8 h-8 rounded-lg bg-[#D6001C] text-[#FFD200] flex items-center justify-center font-black text-[10px] border border-yellow-300/40">
            <span>RM</span>
          </div>
        );

      case "safexpress":
        return (
          <div className="w-8 h-8 rounded-lg bg-[#B91C1C] text-[#FBBF24] flex items-center justify-center font-black text-[10px]">
            <span>SAFE</span>
          </div>
        );

      case "gati":
        return (
          <div className="w-8 h-8 rounded-lg bg-[#0284C7] text-white flex items-center justify-center font-black text-[10px]">
            <span>GATI</span>
          </div>
        );

      default:
        return (
          <div
            className="w-8 h-8 rounded-lg text-white flex items-center justify-center font-bold text-xs"
            style={{ backgroundColor: partner.primaryColor }}
          >
            {partner.name.substring(0, 2).toUpperCase()}
          </div>
        );
    }
  };

  return (
    <div
      className={`inline-flex items-center gap-3 bg-white px-4 py-2.5 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-blue-400 transition-all select-none ${className}`}
    >
      {/* Brand Icon */}
      <div className="shrink-0 flex items-center justify-center">
        {renderBrandIcon()}
      </div>

      {/* Brand Full Name & Tag */}
      <div className="flex flex-col text-left min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="font-extrabold text-xs sm:text-sm text-slate-900 tracking-tight whitespace-nowrap">
            {partner.name}
          </span>
          <span
            className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full whitespace-nowrap ${
              partner.country === "India"
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-blue-50 text-blue-700 border border-blue-200"
            }`}
          >
            {partner.badge}
          </span>
        </div>
        <span className="text-[10px] text-slate-500 truncate max-w-[190px] font-medium leading-tight">
          {partner.tagline}
        </span>
      </div>
    </div>
  );
}
