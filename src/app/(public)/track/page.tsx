"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ShipmentTimeline } from "@/components/ui/ShipmentTimeline";
import { MOCK_BOOKINGS, MockBooking } from "@/lib/mockData";
import {
  Search,
  Truck,
  ShieldCheck,
  MapPin,
  Calendar,
  RefreshCw,
  AlertCircle,
  Package,
  Layers,
  Phone,
  ArrowRight,
  Loader2,
} from "lucide-react";

function TrackingContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || searchParams.get("awb") || "BK-1025";

  const [activeTab, setActiveTab] = useState<"query" | "phone">("query");
  const [searchQuery, setSearchQuery] = useState(initialQuery);

  // Phone + Pincode Form
  const [mobileInput, setMobileInput] = useState("9876543210");
  const [pincodeInput, setPincodeInput] = useState("302022");

  // Search Results State
  const [matchedBookings, setMatchedBookings] = useState<MockBooking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<MockBooking | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Perform initial search on mount
  useEffect(() => {
    if (initialQuery) {
      handleDirectLookup(initialQuery);
    }
  }, [initialQuery]);

  const handleDirectLookup = (query: string) => {
    setIsLoading(true);
    setHasSearched(true);

    setTimeout(() => {
      const q = query.trim().toUpperCase();
      const match = MOCK_BOOKINGS.find(
        (b) =>
          b.booking_number.toUpperCase() === q ||
          b.shipment?.awb?.toUpperCase() === q ||
          b.shipment?.tracking_token?.toUpperCase() === q
      );

      if (match) {
        setMatchedBookings([match]);
        setSelectedBooking(match);
      } else {
        setMatchedBookings([]);
        setSelectedBooking(null);
      }
      setIsLoading(false);
    }, 400);
  };

  const handlePhoneLookup = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setHasSearched(true);

    setTimeout(() => {
      const mob = mobileInput.trim();
      const pin = pincodeInput.trim();

      // Check (Sender Mobile + Pincode) OR (Receiver Mobile + Pincode) per §25
      const matches = MOCK_BOOKINGS.filter(
        (b) =>
          (b.sender_mobile.includes(mob) && b.sender_pincode === pin) ||
          (b.receiver_mobile.includes(mob) && b.receiver_pincode === pin)
      );

      setMatchedBookings(matches);
      if (matches.length === 1) {
        setSelectedBooking(matches[0]);
      } else {
        setSelectedBooking(null);
      }
      setIsLoading(false);
    }, 450);
  };

  const handleLiveRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 700);
  };

  // Mask sensitive phone numbers and addresses per §27
  const maskPhone = (phone: string) => {
    if (phone.length < 5) return "••••••";
    return phone.slice(0, 2) + "••••••" + phone.slice(-2);
  };

  return (
    <div className="max-w-container mx-auto px-4 py-10 space-y-10">
      {/* Tracking Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-brand-primary bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
          Real-Time Shipment Tracking
        </span>
        <h1 className="text-h1">Track Your Consignment</h1>
        <p className="text-body">
          Unified multi-carrier status updates across Delhivery, Blue Dart, DTDC, and XpressBees.
        </p>
      </div>

      {/* Search Container with Tabs */}
      <div className="max-w-2xl mx-auto bg-surface-base border border-border-default rounded-2xl p-6 shadow-md space-y-6">
        {/* Tab Switcher */}
        <div className="flex rounded-xl bg-surface-subtle p-1 border border-border-default text-xs font-semibold">
          <button
            onClick={() => setActiveTab("query")}
            className={`flex-1 py-2.5 rounded-lg transition-all ${
              activeTab === "query"
                ? "bg-surface-base text-brand-primary shadow-sm font-bold"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            Option 1: AWB / Order ID
          </button>
          <button
            onClick={() => setActiveTab("phone")}
            className={`flex-1 py-2.5 rounded-lg transition-all ${
              activeTab === "phone"
                ? "bg-surface-base text-brand-primary shadow-sm font-bold"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            Option 2: Mobile + Pincode
          </button>
        </div>

        {/* Tab 1: Direct AWB/Order Form */}
        {activeTab === "query" && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleDirectLookup(searchQuery);
            }}
            className="space-y-4"
          >
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g. BK-1025 or DEL98234123"
                className="w-full h-12 pl-4 pr-12 text-sm font-mono bg-surface-subtle border border-border-default rounded-xl focus:border-brand-primary focus:ring-2 focus:ring-brand-primary focus:outline-none transition-all"
                required
              />
              <Search className="w-5 h-5 text-text-muted absolute right-4 top-3.5" />
            </div>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full shadow-md"
              isLoading={isLoading}
            >
              Track Consignment
            </Button>
            <p className="text-center text-[11px] text-text-muted font-mono">
              Try demo references: BK-1025, BK-1018, DEL98234123, BLU77491021
            </p>
          </form>
        )}

        {/* Tab 2: Mobile + Pincode Form (§25-26) */}
        {activeTab === "phone" && (
          <form onSubmit={handlePhoneLookup} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Mobile Number"
                type="tel"
                placeholder="10-digit mobile"
                value={mobileInput}
                onChange={(e) => setMobileInput(e.target.value)}
                required
              />
              <Input
                label="Origin or Destination Pincode"
                type="text"
                placeholder="6-digit pincode"
                value={pincodeInput}
                onChange={(e) => setPincodeInput(e.target.value)}
                required
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full shadow-md"
              isLoading={isLoading}
            >
              Search by Mobile + Pincode
            </Button>
            <p className="text-center text-[11px] text-text-muted">
              Checks both sender and receiver credentials with automated fraud-protected rate limiting.
            </p>
          </form>
        )}
      </div>

      {/* Multiple Matches Disambiguation List (§26) */}
      {!selectedBooking && matchedBookings.length > 1 && (
        <Card className="max-w-3xl mx-auto border-amber-200 bg-amber-50/30">
          <CardHeader>
            <CardTitle className="text-base text-amber-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-600" />
              Multiple Shipments Found ({matchedBookings.length})
            </CardTitle>
            <p className="text-xs text-amber-700">
              Multiple consignments matched your search credentials. Please select the specific shipment to view detailed timeline:
            </p>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border-default">
              {matchedBookings.map((b) => (
                <div
                  key={b.id}
                  onClick={() => setSelectedBooking(b)}
                  className="p-4 hover:bg-surface-base cursor-pointer transition-colors flex items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-brand-primary">
                        {b.booking_number}
                      </span>
                      <StatusBadge status={b.shipment?.status || b.status} />
                    </div>
                    <div className="text-xs text-text-secondary">
                      {b.sender_city} → {b.receiver_city} • {b.payment_type}
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    View Tracking <ArrowRight className="w-3.5 h-3.5 ml-1" />
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
          <h3 className="text-base font-bold text-text-primary">Shipment Not Found</h3>
          <p className="text-xs text-text-secondary max-w-sm mx-auto">
            We could not find any active booking or AWB matching your query. Please verify the code or contact support.
          </p>
        </div>
      )}

      {/* Detailed Tracking Result Display */}
      {selectedBooking && (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in-50">
          {/* Back button if disambiguated from multiple */}
          {matchedBookings.length > 1 && (
            <button
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
                    status={selectedBooking.shipment?.status || selectedBooking.status}
                  />
                </div>
                <div className="text-xs text-text-muted font-mono flex flex-wrap gap-x-4 gap-y-1">
                  <span>
                    AWB:{" "}
                    <strong className="text-text-primary">
                      {selectedBooking.shipment?.awb || "Pending Allocation"}
                    </strong>
                  </span>
                  <span>
                    Courier:{" "}
                    <strong className="text-text-primary">
                      {selectedBooking.shipment?.courier_name || "Assigned Partner"}
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
                    Sender: {maskPhone(selectedBooking.sender_mobile)}
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
                    Receiver: {maskPhone(selectedBooking.receiver_mobile)}
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
                  selectedBooking.shipment?.status || selectedBooking.status
                }
                events={selectedBooking.shipment?.tracking_events || []}
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
          <p className="text-xs text-text-muted">Loading tracking system...</p>
        </div>
      }
    >
      <TrackingContent />
    </Suspense>
  );
}

