"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import {
  Calculator,
  ArrowRight,
  Truck,
  Zap,
  Package,
  MapPin,
  Scale,
  CheckCircle2,
  Info,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
import { calculateShippingQuote, CalculationResult } from "@/lib/rate-card";

export default function RateCalculatorPage() {
  const [originPincode, setOriginPincode] = useState("302003");
  const [destPincode, setDestPincode] = useState("110001");
  const [weightKg, setWeightKg] = useState("1.0");
  const [lengthCm, setLengthCm] = useState("20");
  const [widthCm, setWidthCm] = useState("15");
  const [heightCm, setHeightCm] = useState("10");
  const [errorMsg, setErrorMsg] = useState("");
  const [result, setResult] = useState<CalculationResult | null>(null);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanDest = destPincode.replace(/\D/g, "");
    if (cleanDest.length !== 6) {
      setErrorMsg("Please enter a valid 6-digit Indian destination pincode.");
      return;
    }
    setErrorMsg("");

    const quote = calculateShippingQuote({
      originPincode,
      destinationPincode: cleanDest,
      weightKg: parseFloat(weightKg) || 0.5,
      lengthCm: parseFloat(lengthCm) || 10,
      widthCm: parseFloat(widthCm) || 10,
      heightCm: parseFloat(heightCm) || 10,
    });

    setResult(quote);
  };

  return (
    <div className="py-12 bg-surface-subtle min-h-[85vh]">
      <div className="main-container max-w-4xl mx-auto px-4 space-y-8">
        {/* Page Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-brand-primary text-xs font-bold border border-blue-200">
            <Calculator className="w-3.5 h-3.5" /> Automated Pricing Engine (§65a)
          </div>
          <h1 className="text-3xl font-extrabold text-text-primary">
            Shipping Rate & Cargo Cost Calculator
          </h1>
          <p className="text-text-secondary text-sm max-w-xl mx-auto">
            Get instant indicative shipping estimates across Delhivery, DTDC, and XpressBees carrier networks based on genuine zone & weight slab logic.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Calculator Input Form */}
          <div className="md:col-span-6">
            <Card className="shadow-sm">
              <CardHeader className="bg-white border-b border-border-default py-4">
                <CardTitle className="text-sm font-bold text-text-primary flex items-center gap-2">
                  <Package className="w-4 h-4 text-brand-primary" /> Parcel Dimensions & Route
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleCalculate} className="space-y-4 text-xs">
                  {/* Origin & Destination */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-semibold text-text-secondary flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-brand-primary" /> Origin Pincode
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        value={originPincode}
                        onChange={(e) => setOriginPincode(e.target.value.replace(/\D/g, ""))}
                        placeholder="302003 (Jaipur)"
                        className="w-full h-9 px-3 bg-surface-subtle border border-border-default rounded-lg font-mono text-xs focus:border-brand-primary focus:outline-none"
                        required
                      />
                      <span className="text-[10px] text-text-muted">Jaipur Central Hub</span>
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold text-text-secondary flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-amber-500" /> Destination Pincode
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        value={destPincode}
                        onChange={(e) => {
                          setDestPincode(e.target.value.replace(/\D/g, ""));
                          setErrorMsg("");
                        }}
                        placeholder="e.g. 110001 or 400001"
                        className="w-full h-9 px-3 bg-white border border-border-default rounded-lg font-mono text-xs focus:border-brand-primary focus:outline-none"
                        required
                      />
                      <span className="text-[10px] text-text-muted">Any 6-digit Indian Pincode</span>
                    </div>
                  </div>

                  {errorMsg && (
                    <p className="text-xs text-status-danger font-medium">{errorMsg}</p>
                  )}

                  {/* Weight */}
                  <div className="space-y-1">
                    <label className="font-semibold text-text-secondary flex items-center gap-1">
                      <Scale className="w-3 h-3 text-emerald-600" /> Gross Parcel Weight (KG)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.05"
                      value={weightKg}
                      onChange={(e) => setWeightKg(e.target.value)}
                      placeholder="e.g. 1.0"
                      className="w-full h-9 px-3 bg-white border border-border-default rounded-lg font-mono text-xs focus:border-brand-primary focus:outline-none"
                      required
                    />
                  </div>

                  {/* Dimensions */}
                  <div className="space-y-1">
                    <label className="font-semibold text-text-secondary">
                      Dimensions (Length x Width x Height in CM)
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <input
                          type="number"
                          placeholder="L (cm)"
                          value={lengthCm}
                          onChange={(e) => setLengthCm(e.target.value)}
                          className="w-full h-9 px-3 bg-white border border-border-default rounded-lg font-mono text-xs focus:border-brand-primary focus:outline-none text-center"
                          required
                        />
                        <span className="block text-[10px] text-text-muted text-center mt-0.5">Length</span>
                      </div>
                      <div>
                        <input
                          type="number"
                          placeholder="W (cm)"
                          value={widthCm}
                          onChange={(e) => setWidthCm(e.target.value)}
                          className="w-full h-9 px-3 bg-white border border-border-default rounded-lg font-mono text-xs focus:border-brand-primary focus:outline-none text-center"
                          required
                        />
                        <span className="block text-[10px] text-text-muted text-center mt-0.5">Width</span>
                      </div>
                      <div>
                        <input
                          type="number"
                          placeholder="H (cm)"
                          value={heightCm}
                          onChange={(e) => setHeightCm(e.target.value)}
                          className="w-full h-9 px-3 bg-white border border-border-default rounded-lg font-mono text-xs focus:border-brand-primary focus:outline-none text-center"
                          required
                        />
                        <span className="block text-[10px] text-text-muted text-center mt-0.5">Height</span>
                      </div>
                    </div>
                  </div>

                  <Button variant="accent" size="md" type="submit" className="w-full mt-2">
                    <Calculator className="w-4 h-4 mr-1.5" /> Calculate Shipping Quotes
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Regulatory Disclaimer Notice (§10 & §16) */}
            <div className="mt-4 p-4 bg-amber-50/80 border border-amber-200 rounded-xl space-y-1.5 text-xs text-amber-950">
              <div className="font-bold flex items-center gap-1.5 text-amber-800">
                <AlertCircle className="w-4 h-4 shrink-0" /> Important Pricing Notice:
              </div>
              <p className="text-[11px] leading-relaxed text-amber-900">
                Rates generated by this calculator are <strong>indicative estimates</strong> based on standard courier partner rate cards. In accordance with operations policy (§10 & §16), the final shipping charge is confirmed by SS Courier admin staff upon physical intake and weight verification at our hub.
              </p>
            </div>
          </div>

          {/* Rate Estimate Results */}
          <div className="md:col-span-6 space-y-4">
            {result ? (
              <div className="space-y-4 animate-in fade-in-50">
                {/* Zone Resolution Banner */}
                <div className="p-4 bg-white border border-border-default rounded-xl shadow-xs space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-text-primary text-sm">
                      {result.zoneInfo.zoneName}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-blue-50 text-brand-primary font-bold text-[10px] border border-blue-200">
                      {result.zoneInfo.typicalTransitDays}
                    </span>
                  </div>
                  <p className="text-text-secondary text-[11px]">
                    {result.zoneInfo.zoneDescription}
                  </p>

                  {/* Volumetric Analysis */}
                  <div className="pt-2 border-t border-border-default flex items-center justify-between text-[11px] text-text-muted">
                    <span>
                      Actual: <strong>{result.actualWeightKg} kg</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Volumetric: <strong>{result.volumetricWeightKg} kg</strong>
                    </span>
                    <span>•</span>
                    <span className="text-brand-primary font-semibold">
                      Chargeable: <strong>{result.chargeableWeightKg} kg</strong>
                    </span>
                  </div>
                </div>

                {/* Multi-Carrier Options */}
                {result.options.map((opt) => (
                  <Card
                    key={opt.courierCode}
                    className={`overflow-hidden transition-all shadow-sm ${
                      opt.serviceType === "EXPRESS"
                        ? "border-2 border-brand-primary/80"
                        : "border border-border-default"
                    }`}
                  >
                    <div
                      className={`p-3 flex items-center justify-between text-xs font-semibold ${
                        opt.serviceType === "EXPRESS"
                          ? "bg-brand-primary text-white"
                          : "bg-slate-100 text-text-primary border-b border-border-default"
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        {opt.serviceType === "EXPRESS" ? (
                          <Zap className="w-4 h-4 text-amber-300" />
                        ) : (
                          <Truck className="w-4 h-4 text-slate-600" />
                        )}
                        <span>{opt.courierName}</span>
                      </div>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                          opt.serviceType === "EXPRESS"
                            ? "bg-white/20 text-white"
                            : "bg-slate-200 text-slate-800"
                        }`}
                      >
                        {opt.transitDays}
                      </span>
                    </div>

                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-baseline justify-between">
                        <div>
                          <div className="text-2xl font-black font-mono text-text-primary">
                            ₹{opt.totalEstimatedRupees}
                          </div>
                          <div className="text-[10px] text-text-muted">
                            Base: ₹{opt.baseRateRupees} (first {opt.baseWeightKg}kg) + ₹{opt.additionalRateRupees} per addl {opt.additionalWeightKg}kg
                          </div>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                          {opt.serviceBadge}
                        </span>
                      </div>

                      <div className="pt-2 border-t border-border-default flex justify-between items-center text-xs">
                        <span className="text-text-secondary text-[11px]">
                          Doorstep pickup & verified tracking included
                        </span>
                        <Link href="/book">
                          <Button variant={opt.serviceType === "EXPRESS" ? "primary" : "outline"} size="sm">
                            Book Parcel <ArrowRight className="w-3.5 h-3.5 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="p-10 bg-white border border-border-default rounded-2xl text-center space-y-3 text-xs shadow-xs">
                <div className="w-12 h-12 rounded-full bg-blue-50 text-brand-primary flex items-center justify-center mx-auto">
                  <Calculator className="w-6 h-6" />
                </div>
                <div className="font-bold text-text-primary text-sm">
                  Ready to Calculate Rates
                </div>
                <p className="text-text-secondary text-[11px] max-w-xs mx-auto leading-relaxed">
                  Enter your destination pincode and package dimensions on the left to calculate transparent multi-carrier quotes across Indian courier networks.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
