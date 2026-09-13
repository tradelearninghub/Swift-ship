"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { StateView } from "@/components/ui/StateView";
import { formatPaiseToRupees } from "@/lib/utils";
import {
  Package,
  Clock,
  Truck,
  CheckCircle2,
  RotateCcw,
  DollarSign,
  ArrowRight,
  Plus,
  RefreshCw,
  Loader2,
} from "lucide-react";

interface DashboardKPIs {
  today_bookings: number;
  new_requests: number;
  processing: number;
  in_transit: number;
  delivered: number;
  rto_returns: number;
  cod_pending_paise: number;
  cod_settled_paise: number;
}

export default function AdminDashboardPage() {
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [pendingBookings, setPendingBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboard = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/dashboard");
      if (res.ok) {
        const data = await res.json();
        setKpis(data.kpis);
        setPendingBookings(data.recent_pending || []);
      }
    } catch {
      // Silently fail — dashboard is non-critical
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const kpiCards = kpis
    ? [
        { label: "Today's Bookings", value: kpis.today_bookings, color: "" },
        { label: "New Requests", value: kpis.new_requests, color: "border-amber-200 bg-amber-50/50", textColor: "text-amber-700" },
        { label: "Processing", value: kpis.processing, color: "", textColor: "text-blue-700" },
        { label: "In Transit", value: kpis.in_transit, color: "", textColor: "text-blue-700" },
        { label: "Delivered", value: kpis.delivered, color: "", textColor: "text-emerald-700" },
        { label: "RTO / Returns", value: kpis.rto_returns, color: "", textColor: "text-rose-700" },
        { label: "COD Pending", value: formatPaiseToRupees(kpis.cod_pending_paise), color: "", textColor: "text-slate-800" },
        { label: "COD Settled", value: formatPaiseToRupees(kpis.cod_settled_paise), color: "", textColor: "text-emerald-700" },
      ]
    : Array(8).fill(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Operations Overview</h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Monitor real-time booking queue, courier API status, and daily logistics workflow.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={fetchDashboard} disabled={isLoading}>
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? "animate-spin" : ""}`} /> Refresh
          </Button>
          <Link href="/admin/bookings/new">
            <Button variant="primary" size="sm">
              <Plus className="w-4 h-4 mr-1" /> New Booking
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        {kpiCards.map((card, i) =>
          card ? (
            <Card key={i} className={`p-3 ${card.color || ""}`}>
              <div className={`text-[11px] font-semibold uppercase ${card.textColor ? card.textColor : "text-text-muted"}`}>
                {card.label}
              </div>
              <div className={`text-xl font-bold mt-1 ${card.textColor || "text-text-primary"}`}>
                {card.value}
              </div>
            </Card>
          ) : (
            <Card key={i} className="p-3">
              <div className="h-3 bg-slate-200 rounded animate-pulse w-16 mb-2" />
              <div className="h-6 bg-slate-200 rounded animate-pulse w-10" />
            </Card>
          )
        )}
      </div>

      {/* Pending Review Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between py-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600" />
                <CardTitle className="text-sm">Pending Review Queue</CardTitle>
              </div>
              <Link href="/admin/bookings?status=REQUESTED" className="text-xs text-brand-primary font-medium hover:underline">
                View All
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-6 flex items-center justify-center gap-2 text-xs text-text-muted">
                  <Loader2 className="w-4 h-4 animate-spin" /> Loading booking queue…
                </div>
              ) : pendingBookings.length === 0 ? (
                <div className="p-6 text-center text-xs text-text-muted">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
                  All bookings reviewed — no pending requests.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-surface-subtle border-b border-border-default uppercase text-text-muted">
                      <tr>
                        <th className="px-4 py-2.5 font-semibold">Booking ID</th>
                        <th className="px-4 py-2.5 font-semibold">Customer</th>
                        <th className="px-4 py-2.5 font-semibold">Route</th>
                        <th className="px-4 py-2.5 font-semibold">Weight</th>
                        <th className="px-4 py-2.5 font-semibold">Type</th>
                        <th className="px-4 py-2.5 font-semibold text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-default">
                      {pendingBookings.map((b) => {
                        const parcel = b.parcels?.[0];
                        return (
                          <tr key={b.id} className="hover:bg-surface-subtle transition-colors">
                            <td className="px-4 py-3 font-mono font-medium text-brand-primary">
                              {b.booking_number}
                            </td>
                            <td className="px-4 py-3">
                              <div className="font-semibold text-text-primary">
                                {b.customer?.name || b.sender_name}
                              </div>
                              <div className="text-[11px] text-text-muted">
                                {b.customer?.mobile || b.sender_mobile}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              {b.sender_city} → {b.receiver_city}
                            </td>
                            <td className="px-4 py-3">
                              {parcel
                                ? `${(parcel.submitted_weight_grams / 1000).toFixed(2)} kg`
                                : "—"}
                            </td>
                            <td className="px-4 py-3">
                              <span className="font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
                                {b.payment_type === "COD"
                                  ? `COD ${formatPaiseToRupees(b.cod_amount)}`
                                  : "Prepaid"}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <Link href={`/admin/bookings/${b.booking_number}/review`}>
                                <Button variant="accent" size="sm">
                                  Review & Rate
                                </Button>
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Courier Partner Status — still static as this requires real ping */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm">Courier Partner Status</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {[
                { name: "Delhivery", status: "active" },
                { name: "DTDC Express", status: "active" },
                { name: "Blue Dart", status: "active" },
                { name: "XpressBees", status: "manual" },
              ].map((p) => (
                <div key={p.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        p.status === "active" ? "bg-emerald-500" : "bg-slate-400"
                      }`}
                    />
                    <span className="font-semibold text-text-primary">{p.name}</span>
                  </div>
                  <span
                    className={`text-[11px] font-medium ${
                      p.status === "active" ? "text-emerald-700" : "text-slate-500"
                    }`}
                  >
                    {p.status === "active" ? "API Active" : "Manual Fallback"}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
