"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ShipmentTimeline } from "@/components/ui/ShipmentTimeline";
import {
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  MapPin,
  Calendar,
  Truck,
  ArrowLeft,
  QrCode,
  Loader2,
} from "lucide-react";

export default function QrTrackingTokenPage() {
  const params = useParams();
  const token = params?.token as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shipment, setShipment] = useState<any | null>(null);

  const fetchTokenTracking = useCallback(async (showRefreshSpinner = false) => {
    if (!token) return;
    if (showRefreshSpinner) setIsRefreshing(true);
    else setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/track/${encodeURIComponent(token)}`);
      const data = await res.json();

      if (res.ok && data.found && data.shipment) {
        setShipment(data.shipment);
      } else {
        setError(data.error || "No consignment found for this QR tracking scan.");
        setShipment(null);
      }
    } catch (err: any) {
      setError("Network error while resolving QR consignment token.");
      setShipment(null);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    fetchTokenTracking();
  }, [fetchTokenTracking]);

  return (
    <div className="max-w-container mx-auto px-4 py-10 space-y-8">
      {/* Top Breadcrumb & Portal Identifier */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border-default pb-4">
        <Link
          href="/track"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-primary hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Main Tracking Search
        </Link>
        <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full text-xs font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Verified QR Label Scan (§29)</span>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="py-24 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-brand-primary mx-auto" />
          <p className="text-xs text-text-muted">Resolving encrypted consignment token...</p>
        </div>
      )}

      {/* Error / Not Found State */}
      {!isLoading && error && (
        <div className="max-w-lg mx-auto text-center p-8 bg-surface-subtle border border-border-default rounded-2xl space-y-4">
          <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto">
            <QrCode className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-text-primary">Consignment Token Not Found</h2>
          <p className="text-xs text-text-secondary">{error}</p>
          <div className="pt-2">
            <Link href="/track">
              <Button variant="primary" size="sm">
                Search via AWB or Mobile Number
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Detailed QR Tracking Result (§27 Privacy Preserving) */}
      {!isLoading && shipment && (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in-50">
          <Card className="border-brand-primary/30 shadow-md">
            <CardHeader className="bg-surface-subtle py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xl font-bold text-brand-primary">
                    {shipment.booking_number}
                  </span>
                  <StatusBadge status={shipment.status} />
                </div>
                <div className="text-xs text-text-muted font-mono flex flex-wrap gap-x-4 gap-y-1">
                  <span>
                    AWB: <strong className="text-text-primary">{shipment.awb_masked}</strong>
                  </span>
                  <span>
                    Carrier Partner: <strong className="text-text-primary">{shipment.courier_name}</strong>
                  </span>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchTokenTracking(true)}
                isLoading={isRefreshing}
                className="self-start sm:self-center"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Refresh Status
              </Button>
            </CardHeader>

            <CardContent className="p-6 space-y-8">
              {/* Privacy Preserving Route Overview (§27 - NO Street Addresses) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                <div className="space-y-1">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                    Origin
                  </div>
                  <div className="text-sm font-bold text-text-primary flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-brand-primary shrink-0" />
                    {shipment.sender_city}, {shipment.sender_state}
                  </div>
                  <div className="text-xs text-text-muted font-mono">
                    Sender: {shipment.sender_mobile_masked}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                    Destination
                  </div>
                  <div className="text-sm font-bold text-text-primary flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-brand-accent shrink-0" />
                    {shipment.receiver_city}, {shipment.receiver_state}
                  </div>
                  <div className="text-xs text-text-muted font-mono">
                    Receiver: {shipment.receiver_mobile_masked}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                    Booking Type & Date
                  </div>
                  <div className="text-sm font-semibold text-text-primary flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
                    {new Date(shipment.created_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                  <div className="text-xs font-medium text-emerald-700">
                    {shipment.payment_type === "COD" ? "Cash on Delivery" : "Prepaid Consignment"}
                  </div>
                </div>
              </div>

              {/* Verified Tracking Milestones Timeline */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-4">
                  Consignment Milestone History (§31)
                </h3>
                <ShipmentTimeline
                  currentStatus={shipment.status}
                  events={shipment.events || []}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
