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
} from "lucide-react";

export default function RateCalculatorPage() {
  const [originPincode, setOriginPincode] = useState("302003");
  const [destPincode, setDestPincode] = useState("");
  const [weightKg, setWeightKg] = useState("1.5");
  const [lengthCm, setLengthCm] = useState("20");
  const [widthCm, setWidthCm] = useState("15");
  const [heightCm, setHeightCm] = useState("10");
  const [serviceType, setServiceType] = useState<"EXPRESS" | "SURFACE">("EXPRESS");
  const [calculated, setCalculated] = useState(false);
  const [rates, setRates] = useState<{
    surface: number;
    express: number;
    volumetricWeightKg: number;
    chargeableWeightKg: number;
  } | null>(null);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    const actualWt = parseFloat(weightKg) || 0.5;
    const l = parseFloat(lengthCm) || 10;
    const w = parseFloat(widthCm) || 10;
    const h = parseFloat(heightCm) || 10;

    // Volumetric formula (cm3 / 5000 standard for express air / surface)
    const volumetricWt = Number(((l * w * h) / 5000).toFixed(2));
    const chargeableWt = Math.max(actualWt, volumetricWt);

    // Indicative slab pricing
    const baseSurface = 80;
    const perKgSurface = 45;
    const surfaceCost = Math.round(baseSurface + Math.max(0, chargeableWt - 0.5) * perKgSurface);

    const baseExpress = 140;
    const perKgExpress = 75;
    const expressCost = Math.round(baseExpress + Math.max(0, chargeableWt - 0.5) * perKgExpress);

    setRates({
      surface: surfaceCost,
      express: expressCost,
      volumetricWeightKg: volumetricWt,
      chargeableWeightKg: chargeableWt,
    });
    setCalculated(true);
  };

  return (
    <div className="py-12 bg-surface-subtle min-h-[85vh]">
      <div className="main-container max-w-4xl mx-auto px-4 space-y-8">
        {/* Page Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-brand-primary text-xs font-bold border border-blue-200">
            <Calculator className="w-3.5 h-3.5" /> Instant Shipping Rate Calculator
          </div>
          <h1 className="text-3xl font-extrabold text-text-primary">
            Estimate Your Courier & Cargo Charges
          </h1>
          <p className="text-text-secondary text-sm max-w-xl mx-auto">
            Calculate instant indicative delivery charges across Delhivery, DTDC, Shiprocket, and XpressBees carrier networks. Final rate confirmed upon admin parcel verification.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Calculator Input Form */}
          <div className="md:col-span-7">
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
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold text-text-secondary flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-amber-500" /> Destination Pincode
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        value={destPincode}
                        onChange={(e) => setDestPincode(e.target.value.replace(/\D/g, ""))}
                        placeholder="e.g. 110001 or 400001"
                        className="w-full h-9 px-3 bg-surface-subtle border border-border-default rounded-lg font-mono text-xs focus:border-brand-primary focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Weight */}
                  <div className="space-y-1">
                    <label className="font-semibold text-text-secondary flex items-center gap-1">
                      <Scale className="w-3 h-3 text-emerald-600" /> Gross Parcel Weight (KG)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      value={weightKg}
                      onChange={(e) => setWeightKg(e.target.value)}
                      placeholder="e.g. 1.5"
                      className="w-full h-9 px-3 bg-surface-subtle border border-border-default rounded-lg font-mono text-xs focus:border-brand-primary focus:outline-none"
                    />
                  </div>

                  {/* Dimensions */}
                  <div className="space-y-1">
                    <label className="font-semibold text-text-secondary">
                      Dimensions (Length x Width x Height in CM)
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="number"
                        placeholder="L (cm)"
                        value={lengthCm}
                        onChange={(e) => setLengthCm(e.target.value)}
                        className="h-9 px-3 bg-surface-subtle border border-border-default rounded-lg font-mono text-xs focus:border-brand-primary focus:outline-none text-center"
                      />
                      <input
                        type="number"
                        placeholder="W (cm)"
                        value={widthCm}
                        onChange={(e) => setWidthCm(e.target.value)}
                        className="h-9 px-3 bg-surface-subtle border border-border-default rounded-lg font-mono text-xs focus:border-brand-primary focus:outline-none text-center"
                      />
                      <input
                        type="number"
                        placeholder="H (cm)"
                        value={heightCm}
                        onChange={(e) => setHeightCm(e.target.value)}
                        className="h-9 px-3 bg-surface-subtle border border-border-default rounded-lg font-mono text-xs focus:border-brand-primary focus:outline-none text-center"
                      />
                    </div>
                  </div>

                  <Button variant="accent" size="md" type="submit" className="w-full">
                    <Calculator className="w-4 h-4 mr-1.5" /> Calculate Indicative Rates
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Rate Estimate Results Card */}
          <div className="md:col-span-5 space-y-4">
            {rates ? (
              <div className="space-y-4">
                {/* Express Air Plan */}
                <Card className="border-2 border-brand-primary shadow-md overflow-hidden">
                  <div className="bg-brand-primary text-white p-3 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold">
                      <Zap className="w-4 h-4 text-amber-300" /> Express Air Delivery
                    </div>
                    <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded font-mono">
                      1 - 2 Business Days
                    </span>
                  </div>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-baseline justify-between">
                      <span className="text-text-muted text-xs">Estimated Rate</span>
                      <span className="text-2xl font-black font-mono text-text-primary">
                        ₹{rates.express}
                      </span>
                    </div>
                    <p className="text-[11px] text-text-secondary leading-snug">
                      Priority dispatch via fastest air-cargo route. Delhivery Air or Blue Dart Apex connection.
                    </p>
                    <Link href="/book" className="block">
                      <Button variant="primary" size="sm" className="w-full">
                        Book Express Pickup <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                {/* Surface Cargo Plan */}
                <Card className="shadow-sm border border-border-default">
                  <div className="bg-slate-100 p-3 flex items-center justify-between border-b border-border-default">
                    <div className="flex items-center gap-1.5 font-bold text-text-primary">
                      <Truck className="w-4 h-4 text-slate-700" /> Standard Surface Cargo
                    </div>
                    <span className="text-[10px] bg-slate-200 text-slate-800 px-2 py-0.5 rounded font-mono">
                      3 - 5 Business Days
                    </span>
                  </div>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-baseline justify-between">
                      <span className="text-text-muted text-xs">Estimated Rate</span>
                      <span className="text-xl font-bold font-mono text-text-primary">
                        ₹{rates.surface}
                      </span>
                    </div>
                    <p className="text-[11px] text-text-secondary leading-snug">
                      Cost-effective logistics for heavier consignments and non-urgent parcels.
                    </p>
                    <Link href="/book" className="block">
                      <Button variant="outline" size="sm" className="w-full">
                        Book Surface Parcel
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                {/* Volumetric info note */}
                <div className="p-3 bg-white border border-border-default rounded-xl space-y-1 text-[11px]">
                  <div className="font-semibold text-text-primary flex items-center gap-1">
                    <Info className="w-3.5 h-3.5 text-brand-primary" /> Volumetric Weight Analysis:
                  </div>
                  <div className="text-text-muted">
                    Actual: <strong>{weightKg} kg</strong> • Volumetric:{" "}
                    <strong>{rates.volumetricWeightKg} kg</strong> • Chargeable:{" "}
                    <strong>{rates.chargeableWeightKg} kg</strong>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 bg-white border border-border-default rounded-xl text-center space-y-3 text-xs">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-text-muted flex items-center justify-center mx-auto">
                  <Calculator className="w-6 h-6" />
                </div>
                <div className="font-bold text-text-primary text-sm">No Rates Calculated Yet</div>
                <p className="text-text-secondary text-[11px] max-w-xs mx-auto">
                  Enter your origin & destination pincodes and parcel measurements on the left to see instant comparative quotes.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
