"use client";

import React, { useState } from "react";

interface WhatsAppFloatingButtonProps {
  whatsappNumber?: string;
  whatsappUrl?: string;
  companyName?: string;
}

export function WhatsAppFloatingButton({
  whatsappNumber = "8000151117",
  whatsappUrl,
  companyName = "SS International Courier",
}: WhatsAppFloatingButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  const cleanNumber = whatsappNumber.replace(/\D/g, "").replace(/^91/, "");
  const defaultUrl = `https://wa.me/91${cleanNumber}?text=${encodeURIComponent(
    `Hello ${companyName}, I would like to inquire about courier booking and parcel tracking.`
  )}`;

  let finalUrl = defaultUrl;
  if (whatsappUrl?.trim()) {
    const trimmed = whatsappUrl.trim();
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      finalUrl = trimmed;
    } else {
      const num = trimmed.replace(/\D/g, "").replace(/^91/, "");
      finalUrl = `https://wa.me/91${num}?text=${encodeURIComponent(
        `Hello ${companyName}, I have a shipping inquiry.`
      )}`;
    }
  }

  return (
    <aside
      aria-label="WhatsApp Live Support"
      className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 flex items-center group pointer-events-auto"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Tooltip on Desktop */}
      <div
        className={`hidden sm:flex items-center gap-2 mr-3 px-3.5 py-2 rounded-full bg-[#070D1B] text-white text-xs font-semibold shadow-2xl border border-white/10 transition-all duration-300 origin-right ${
          isHovered
            ? "opacity-100 scale-100 translate-x-0"
            : "opacity-0 scale-95 translate-x-2 pointer-events-none"
        }`}
      >
        <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse"></span>
        <span>Chat with Support (+91 {cleanNumber})</span>
      </div>

      {/* Circular Shape Text + Floating Action Button Container */}
      <a
        href={finalUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with SS International Courier on WhatsApp"
        title="Chat on WhatsApp"
        className="relative w-22 h-22 sm:w-26 sm:h-26 flex items-center justify-center rounded-full bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 group/btn cursor-pointer"
      >
        {/* Radar Pulse Effect */}
        <span className="absolute inset-3 rounded-full bg-[#25D366] opacity-25 animate-ping -z-10 pointer-events-none"></span>

        {/* Circular Static Text SVG (Fixed in circle without rotation) */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none select-none"
          viewBox="0 0 100 100"
        >
          <defs>
            <path
              id="whatsappStaticCirclePath"
              d="M 50,50 m -39,0 a 39,39 0 1,1 78,0 a 39,39 0 1,1 -78,0"
              fill="none"
            />
          </defs>
          <text className="text-[9px] font-black uppercase tracking-[0.22em] fill-[#0B1536]">
            <textPath href="#whatsappStaticCirclePath" startOffset="25%" textAnchor="middle">
              • CHAT WITH US •
            </textPath>
          </text>
        </svg>

        {/* Center Green WhatsApp Button */}
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#25D366] group-hover/btn:bg-[#20ba59] text-white flex items-center justify-center shadow-md transition-colors z-10">
          <svg
            className="w-6 h-6 sm:w-7 sm:h-7 fill-current drop-shadow-xs"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        </div>
      </a>
    </aside>
  );
}
