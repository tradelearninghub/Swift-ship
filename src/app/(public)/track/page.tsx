"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ShipmentTimeline } from "@/components/ui/ShipmentTimeline";
import {
  Search,
  Truck,
  Layers,
  MapPin,
  Calendar,
  RefreshCw,
  AlertCircle,
  ArrowRight,
  Loader2,
  FileText,
  Phone,
  Barcode,
} from "lucide-react";

type SearchMode = "AWB" | "ORDER_ID" | "MOBILE";

function TrackingContent() {
  const searchParams = useSearchParams();
  const initialAwb = searchParams.get("awb") || "";
  const initialBookingId = searchParams.get("booking_id") || searchParams.get("order_id") || "";
  const initialMobile = searchParams.get("mobile") || "";
  const initialQuery = searchParams.get("q") || initialAwb || initialBookingId;

  const [activeTab, setActiveTab] = useState<SearchMode>(
    initialAwb
      ? "AWB"
      : initialBookingId
      ? "ORDER_ID"
      : initialMobile
      ? "MOBILE"
      : "AWB"
  );

  // Search fields
  const [awbInput, setAwbInput] = useState(initialAwb);
  const [bookingIdInput, setBookingIdInput] = useState(initialBookingId);
  const [mobileInput, setMobileInput] = useState(initialMobile);

  // Search Results State
  const [matchedBookings, setMatchedBookings] = useState<any[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Perform initial search on mount if URL parameters exist
  useEffect(() => {
    if (initialQuery) {
      handleDirectLookup(initialQuery);
    } else if (initialMobile) {
      handleMobileLookup(initialMobile);
    }
  }, [initialQuery, initialMobile]);

  // Direct AWB / Booking ID Lookup via real /api/track
  const handleDirectLookup = async (query: string) => {
    const q = query.trim().toUpperCase();
    if (!q) return;
    setIsLoading(true);
    setHasSearched(true);

    try {
      const res = await fetch(`/api/track?q=${encodeURIComponent(q)}`);
      const data = await res.json();

      if (res.ok && data.found && data.shipment) {
        setSelectedBooking(data.shipment);
        setMatchedBookings([data.shipment]);
      } else {
        setSelectedBooking(null);
        setMatchedBookings([]);
      }
    } catch (e) {
      console.error("Direct lookup error:", e);
      setSelectedBooking(null);
      setMatchedBookings([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Mobile-Only Search via real /api/track
  const handleMobileLookup = async (mobVal: string) => {
    const mob = mobVal.trim().replace(/\D/g, "");
    if (!mob) return;
    setIsLoading(true);
    setHasSearched(true);

    try {
      const res = await fetch(`/api/track?mobile=${encodeURIComponent(mob)}`);
      const data = await res.json();

      if (res.ok && data.found) {
        if (data.type === "SINGLE" && data.shipment) {
          setSelectedBooking(data.shipment);
          setMatchedBookings([data.shipment]);
        } else if (data.type === "MULTIPLE" && Array.isArray(data.results)) {
          setSelectedBooking(null);
          setMatchedBookings(data.results);
        }
      } else {
        setSelectedBooking(null);
        setMatchedBookings([]);
      }
    } catch (e) {
      console.error("Mobile lookup error:", e);
      setSelectedBooking(null);
      setMatchedBookings([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLiveRefresh = async () => {
    if (!selectedBooking) return;
    const key = selectedBooking.awb || selectedBooking.booking_number;
    if (!key) return;
    setIsRefreshing(true);
    try {
      const res = await fetch(`/api/track?q=${encodeURIComponent(key)}`);
      const data = await res.json();
      if (res.ok && data.found && data.shipment) {
        setSelectedBooking(data.shipment);
      }
    } catch (e) {
      console.error("Refresh error:", e);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Mask sensitive data per §27
  const maskPhone = (phone?: string) => {
    if (!phone) return "••••••";
    if (phone.includes("••")) return phone;
    if (phone.length < 5) return "••••••";
    return phone.slice(0, 2) + "••••••" + phone.slice(-2);
  };

  const maskAwb = (awb?: string) => {
    if (!awb) return "Allocating";
    if (awb.includes("••")) return awb;
    if (awb.length <= 4) return "••••";
    return awb.slice(0, 3) + "••••" + awb.slice(-3);
  };

  return (
    <div className="max-w-container mx-auto px-4 py-10 space-y-10">
      {/* Tracking Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-brand-primary bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
          Real-Time Consignment Tracking
        </span>
        <h1 className="text-h1">Track Your Shipment</h1>
        <p className="text-body text-sm">
          Unified multi-carrier status updates across Delhivery, Blue Dart, DTDC, and XpressBees by SS Courier service.
        </p>
      </div>

      {/* 3-Option Search Container */}
      <div className="max-w-2xl mx-auto bg-surface-base border border-border-default rounded-2xl p-6 shadow-md space-y-6">
        {/* 3 Distinct Search Option Tabs */}
        <div className="grid grid-cols-3 rounded-xl bg-surface-subtle p-1 border border-border-default text-xs font-semibold gap-1">
          <button
            type="button"
            onClick={() => setActiveTab("AWB")}
            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg transition-all ${
              activeTab === "AWB"
                ? "bg-surface-base text-brand-primary shadow-sm font-bold"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            <Barcode className="w-4 h-4 hidden sm:inline" />
            <span>AWB Number</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("ORDER_ID")}
            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg transition-all ${
              activeTab === "ORDER_ID"
                ? "bg-surface-base text-brand-primary shadow-sm font-bold"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            <FileText className="w-4 h-4 hidden sm:inline" />
            <span>Order / Booking ID</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("MOBILE")}
            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg transition-all ${
              activeTab === "MOBILE"
                ? "bg-surface-base text-brand-primary shadow-sm font-bold"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            <Phone className="w-4 h-4 hidden sm:inline" />
            <span>Mobile Number</span>
          </button>
        </div>

        {/* Option 1: AWB Number Search */}
        {activeTab === "AWB" && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleDirectLookup(awbInput);
            }}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-text-primary">
                Enter Air Waybill (AWB) Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={awbInput}
                  onChange={(e) => setAwbInput(e.target.value)}
                  placeholder="e.g. DEL98234123 or BLU77491021"
                  className="w-full h-12 pl-4 pr-12 text-sm font-mono bg-surface-subtle border border-border-default rounded-xl focus:border-brand-primary focus:ring-2 focus:ring-brand-primary focus:outline-none transition-all"
                  required
                />
                <Search className="w-5 h-5 text-text-muted absolute right-4 top-3.5" />
              </div>
            </div>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full shadow-md"
              isLoading={isLoading}
            >
              Track by AWB
            </Button>
          </form>
        )}

        {/* Option 2: Order ID / Booking ID Search */}
        {activeTab === "ORDER_ID" && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleDirectLookup(bookingIdInput);
            }}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-text-primary">
                Enter Booking ID / Order Reference
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={bookingIdInput}
                  onChange={(e) => setBookingIdInput(e.target.value)}
                  placeholder="e.g. BK-1025 or BK-1018"
                  className="w-full h-12 pl-4 pr-12 text-sm font-mono bg-surface-subtle border border-border-default rounded-xl focus:border-brand-primary focus:ring-2 focus:ring-brand-primary focus:outline-none transition-all"
                  required
                />
                <Search className="w-5 h-5 text-text-muted absolute right-4 top-3.5" />
              </div>
            </div>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full shadow-md"
              isLoading={isLoading}
            >
              Track by Booking ID
            </Button>
          </form>
        )}

        {/* Option 3: Mobile Number Only Search */}
        {activeTab === "MOBILE" && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleMobileLookup(mobileInput);
            }}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-text-primary">
                Enter Registered 10-Digit Mobile Number
              </label>
              <div className="relative">
                <input
                  type="tel"
                  maxLength={10}
                  value={mobileInput}
                  onChange={(e) => setMobileInput(e.target.value.replace(/\D/g, ""))}
                  placeholder="e.g. 9876543210 or 8000151117"
                  className="w-full h-12 pl-4 pr-12 text-sm font-mono bg-surface-subtle border border-border-default rounded-xl focus:border-brand-primary focus:ring-2 focus:ring-brand-primary focus:outline-none transition-all"
                  required
                />
                <Phone className="w-5 h-5 text-text-muted absolute right-4 top-3.5" />
              </div>
            </div>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full shadow-md"
              isLoading={isLoading}
            >
              Track by Mobile Number
            </Button>
            <p className="text-center text-[11px] text-text-muted">
              Searches shipments where this mobile number is either sender or receiver.
            </p>
          </form>
        )}
      </div>

      {/* Multiple Matches Disambiguation List (§26) */}
      {!selectedBooking && matchedBookings.length > 1 && (
        <Card className="max-w-3xl mx-auto border-blue-200 bg-blue-50/20 shadow-md">
          <CardHeader className="pb-3 border-b border-border-default bg-surface-subtle/50">
            <CardTitle className="text-base text-text-primary flex items-center justify-between">
              <span className="flex items-center gap-2 font-bold">
                <Layers className="w-5 h-5 text-brand-primary" />
                Multiple Shipments Found ({matchedBookings.length})
              </span>
              <span className="text-xs font-normal text-text-muted">
                Showing all consignments associated with your mobile number
              </span>
            </CardTitle>
            <p className="text-xs text-text-secondary mt-1">
              Select any consignment below to inspect full delivery timeline and courier checkpoints:
            </p>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border-default max-h-96 overflow-y-auto">
              {matchedBookings.map((b) => (
                <div
                  key={b.booking_number || b.id}
                  onClick={() => handleDirectLookup(b.booking_number)}
                  className="p-4 hover:bg-blue-50/60 cursor-pointer transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-brand-primary">
                        {b.booking_number}
                      </span>
                      <StatusBadge status={b.status || b.shipment?.status} />
                    </div>
                    <div className="text-xs text-text-secondary flex flex-wrap gap-x-3 gap-y-1">
                      <span>
                        Route: <strong>{b.sender_city} → {b.receiver_city}</strong>
                      </span>
                      <span>•</span>
                      <span>AWB: {b.awb_masked || maskAwb(b.shipment?.awb || b.awb)}</span>
                      <span>•</span>
                      <span>{b.payment_type === "COD" ? "Cash on Delivery" : "Prepaid"}</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="self-start sm:self-center">
                    View Timeline <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Match Result */}
      {hasSearched && !isLoading && matchedBookings.length === 0 && (
        <div className="max-w-xl mx-auto text-center p-10 bg-surface-subtle border border-border-default rounded-2xl space-y-3">
          <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
          <h3 className="text-base font-bold text-text-primary">No Consignment Found</h3>
          <p className="text-xs text-text-secondary max-w-sm mx-auto">
            We could not find any active shipment matching your query. Please double-check your AWB, Booking ID, or Mobile Number.
          </p>
        </div>
      )}

      {/* Detailed Tracking Result Display */}
      {selectedBooking && (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in-50">
          {/* Back button if disambiguated from multiple */}
          {matchedBookings.length > 1 && (
            <button
              type="button"
              onClick={() => setSelectedBooking(null)}
              className="text-xs font-semibold text-brand-primary hover:underline flex items-center gap-1"
            >
              ← Back to {matchedBookings.length} results
            </button>
          )}

          {/* Shipment Header Banner */}
          <Card className="border-brand-primary/30 shadow-md">
            <CardHeader className="bg-surface-subtle py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xl font-bold text-brand-primary">
                    {selectedBooking.booking_number}
                  </span>
                  <StatusBadge
                    status={selectedBooking.status || selectedBooking.shipment?.status}
                  />
                </div>
                <div className="text-xs text-text-muted font-mono flex flex-wrap gap-x-4 gap-y-1">
                  <span>
                    AWB:{" "}
                    <strong className="text-text-primary">
                      {selectedBooking.awb || selectedBooking.shipment?.awb || "Pending Allocation"}
                    </strong>
                  </span>
                  <span>
                    Courier Partner:{" "}
                    <strong className="text-text-primary">
                      {selectedBooking.courier_name || selectedBooking.shipment?.courier_name || "Assigned Partner"}
                    </strong>
                  </span>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleLiveRefresh}
                isLoading={isRefreshing}
                className="self-start sm:self-center"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Refresh Status
              </Button>
            </CardHeader>

            <CardContent className="p-6 space-y-8">
              {/* Privacy Preserving Route Overview (§27) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                <div className="space-y-1">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                    Origin
                  </div>
                  <div className="text-sm font-bold text-text-primary flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-brand-primary shrink-0" />
                    {selectedBooking.sender_city}, {selectedBooking.sender_state}
                  </div>
                  <div className="text-xs text-text-muted font-mono">
                    Sender: {selectedBooking.sender_mobile_masked || maskPhone(selectedBooking.sender_mobile)}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                    Destination
                  </div>
                  <div className="text-sm font-bold text-text-primary flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-brand-accent shrink-0" />
                    {selectedBooking.receiver_city}, {selectedBooking.receiver_state}
                  </div>
                  <div className="text-xs text-text-muted font-mono">
                    Receiver: {selectedBooking.receiver_mobile_masked || maskPhone(selectedBooking.receiver_mobile)}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                    Shipment Date & Type
                  </div>
                  <div className="text-sm font-semibold text-text-primary flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
                    {new Date(selectedBooking.created_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                  <div className="text-xs font-medium text-emerald-700">
                    {selectedBooking.payment_type === "COD"
                      ? "Cash on Delivery"
                      : "Prepaid Dispatch"}
                  </div>
                </div>
              </div>

              {/* Standardized Tracking Timeline (§31) */}
              <ShipmentTimeline
                currentStatus={
                  selectedBooking.status || selectedBooking.shipment?.status
                }
                events={selectedBooking.events || selectedBooking.shipment?.tracking_events || []}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default function TrackingPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 text-center flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
          <p className="text-xs text-text-muted">Loading tracking portal...</p>
        </div>
      }
    >
      <TrackingContent />
    </Suspense>
  );
}
