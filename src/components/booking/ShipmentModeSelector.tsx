"use client";

import React from "react";
import { Truck, Globe } from "lucide-react";

export type ShipmentMode = "DOMESTIC" | "INTERNATIONAL";

interface ShipmentModeSelectorProps {
  mode: ShipmentMode;
  onChange: (mode: ShipmentMode) => void;
  disabled?: boolean;
}

export function ShipmentModeSelector({
  mode,
  onChange,
  disabled = false,
}: ShipmentModeSelectorProps) {
  return (
    <div className="w-full mb-8">
      <div className="text-center sm:text-left mb-3">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Select Shipment Service
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Option 1: Domestic Shipment */}
        <button
          type="button"
          onClick={() => onChange("DOMESTIC")}
          disabled={disabled}
          className={`relative p-5 rounded-2xl border-2 text-left transition-all flex items-start gap-4 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF6B00] ${
            mode === "DOMESTIC"
              ? "border-[#FF6B00] bg-orange-50/50 shadow-md shadow-orange-500/10"
              : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
          } ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
        >
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
              mode === "DOMESTIC"
                ? "bg-[#FF6B00] text-white shadow-sm shadow-orange-500/30"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            <Truck className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span
                className={`font-bold text-base sm:text-lg tracking-tight ${
                  mode === "DOMESTIC" ? "text-[#002B49]" : "text-slate-800"
                }`}
              >
                Domestic Shipment
              </span>
              {mode === "DOMESTIC" && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FF6B00] text-white uppercase tracking-wider">
                  Active
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-snug">
              Ship within India (28 States & 8 Union Territories)
            </p>
          </div>
        </button>

        {/* Option 2: International Shipment */}
        <button
          type="button"
          onClick={() => onChange("INTERNATIONAL")}
          disabled={disabled}
          className={`relative p-5 rounded-2xl border-2 text-left transition-all flex items-start gap-4 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#002B49] ${
            mode === "INTERNATIONAL"
              ? "border-[#002B49] bg-sky-50/40 shadow-md shadow-[#002B49]/10"
              : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
          } ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
        >
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
              mode === "INTERNATIONAL"
                ? "bg-[#002B49] text-white shadow-sm shadow-[#002B49]/30"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            <Globe className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span
                className={`font-bold text-base sm:text-lg tracking-tight ${
                  mode === "INTERNATIONAL" ? "text-[#002B49]" : "text-slate-800"
                }`}
              >
                International Shipment
              </span>
              {mode === "INTERNATIONAL" && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#002B49] text-white uppercase tracking-wider">
                  Active
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-snug">
              Ship to another country (USA, UK, UAE, Canada, 200+ countries)
            </p>
          </div>
        </button>
      </div>
    </div>
  );
}
