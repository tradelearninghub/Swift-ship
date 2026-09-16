"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Card, CardContent } from "@/components/ui/Card";
import { StateView } from "@/components/ui/StateView";
import { ReceiptLabelModal } from "@/components/ui/ReceiptLabelModal";
import { formatPaiseToRupees, formatGramsToKg } from "@/lib/utils";
import { formatDateTimeIST } from "@/lib/datetime";
import {
  Search,
  Plus,
  Filter,
  Eye,
  ArrowRight,
  Package,
  CheckCircle2,
  Printer,
  RefreshCw,
  ExternalLink,
} from "lucide-react";

export default function CustomerBookingsPage() {
  const [viewState, setViewState] = useState<"populated" | "loading" | "empty" | "error">("loading");
  const [bookings, setBookings] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedForLabel, setSelectedForLabel] = useState<any | null>(null);

  const fetchBookings = useCallback(async () => {
    setViewState("loading");
    try {
      const res = await fetch("/api/bookings?limit=100");
      if (!res.ok) throw new Error("Failed to fetch bookings");
      const data = await res.json();
      const list = data.bookings || [];
      setBookings(list);
      setViewState(list.length === 0 ? "empty" : "populated");
    } catch (err) {
      console.error("Failed to load bookings", err);
      setViewState("error");
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const filteredBookings = bookings.filter((b) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      b.booking_number?.toLowerCase().includes(q) ||
      b.receiver_name?.toLowerCase().includes(q) ||
      b.receiver_city?.toLowerCase().includes(q) ||
      b.shipment?.awb?.toLowerCase().includes(q);

    const matchesStatus =
      statusFilter === "ALL" ||
      b.status === statusFilter ||
      b.shipment?.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Booking History</h1>
          <p className="text-xs text-text-secondary mt-0.5">
            View all past and active parcel bookings, track shipments, and review payment status.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchBookings}>
            <RefreshCw className="w-3.5 h-3.5 mr-1" /> Refresh
          </Button>
          <Link href="/book">
            <Button variant="accent" size="sm">
              <Plus className="w-4 h-4 mr-1" /> New Booking
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters Bar */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row items-center gap-4 justify-between">
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="Search by ID, receiver, city, or AWB..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-4 text-xs bg-surface-subtle border border-border-default rounded-lg focus:border-brand-primary focus:outline-none"
            />
            <Search className="w-4 h-4 text-text-muted absolute left-3 top-2.5" />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <Filter className="w-3.5 h-3.5 text-text-muted shrink-0" />
            <span className="text-xs font-semibold text-text-muted shrink-0">Filter:</span>
            {["ALL", "REQUESTED", "UNDER_REVIEW", "APPROVED", "IN_TRANSIT", "DELIVERED", "RTO"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                  statusFilter === st
                    ? "bg-brand-primary text-white"
                    : "bg-surface-subtle text-text-secondary hover:bg-slate-200"
                }`}
              >
                {st.replace(/_/g, " ")}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Main Content Table / StateView */}
      <Card>
        <StateView
          state={viewState}
          emptyTitle="No bookings found"
          emptyDescription={
            searchQuery || statusFilter !== "ALL"
              ? "No consignments match your search and filter criteria."
              : "You have not submitted any delivery bookings yet."
          }
          emptyAction={
            searchQuery || statusFilter !== "ALL" ? undefined : (
              <Link href="/book">
                <Button variant="primary" size="sm">
                  <Plus className="w-4 h-4 mr-1" /> Book a Parcel
                </Button>
              </Link>
            )
          }
          onRetry={fetchBookings}
        >
          {filteredBookings.length === 0 ? (
            <div className="py-12 text-center text-xs text-text-muted">
              <Package className="w-8 h-8 mx-auto mb-2 text-text-muted/60" />
              <p className="font-semibold text-text-primary">No matching records</p>
              <p className="mt-0.5">Try adjusting your search terms or filter.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-surface-subtle border-b border-border-default text-xs uppercase text-text-muted">
                  <tr>
                    <th className="px-6 py-3 font-semibold">Booking ID / Date</th>
                    <th className="px-6 py-3 font-semibold">Recipient & Destination</th>
                    <th className="px-6 py-3 font-semibold">Courier / AWB</th>
                    <th className="px-6 py-3 font-semibold">Weight & Valuation</th>
                    <th className="px-6 py-3 font-semibold">Amount / Mode</th>
                    <th className="px-6 py-3 font-semibold">Status</th>
                    <th className="px-6 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-default">
                  {filteredBookings.map((b) => {
                    const trackingToken = b.shipment?.tracking_token || b.shipment?.awb || b.booking_number;
                    const parcel = b.parcels?.[0];
                    const weightGrams = parcel?.verified_weight_grams ?? parcel?.submitted_weight_grams ?? 0;
                    const amountPaise = b.final_total_paise || b.charges?.total || b.estimated_total_paise || 0;

                    return (
                      <tr key={b.id} className="hover:bg-surface-subtle transition-colors">
                        <td className="px-6 py-4">
                          <Link href={`/customer/bookings/${b.id}`} className="font-mono font-bold text-brand-primary hover:underline">
                            {b.booking_number}
                          </Link>
                          <div className="text-[10px] text-text-muted font-sans font-normal">
                            {formatDateTimeIST(b.created_at)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-text-primary">{b.receiver_name}</div>
                          <div className="text-xs text-text-secondary">
                            {b.receiver_city}{b.receiver_state ? `, ${b.receiver_state}` : ""}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {b.shipment ? (
                            <div>
                              <div className="font-mono text-xs font-semibold text-text-primary">
                                {b.shipment.awb || "Pending AWB"}
                              </div>
                              <div className="text-[11px] text-text-muted">
                                {b.shipment.courier_partner?.name || "In-House"}
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-text-muted">Awaiting Review</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-xs font-medium text-text-primary">
                            {weightGrams > 0 ? formatGramsToKg(weightGrams) : "—"}
                          </div>
                          {parcel?.declared_value > 0 && (
                            <div className="text-[10px] text-text-muted">
                              Val: ₹{Math.round(parcel.declared_value / 100)}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-text-primary">
                            {amountPaise > 0 ? formatPaiseToRupees(amountPaise) : "Pending"}
                          </div>
                          <div className="text-[10px] text-text-muted uppercase">
                            {b.payment_type === "COD" ? `COD (₹${Math.round(b.cod_amount / 100)})` : "Prepaid"}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={b.shipment?.status || b.status} />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/track/${trackingToken}`}>
                              <Button variant="outline" size="sm" title="Track Live">
                                Track <ExternalLink className="w-3 h-3 ml-1" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="sm"
                              title="Print Shipping Label"
                              onClick={() => setSelectedForLabel(b)}
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </StateView>
      </Card>

      {/* Label Modal */}
      {selectedForLabel && (
        <ReceiptLabelModal
          isOpen={Boolean(selectedForLabel)}
          onClose={() => setSelectedForLabel(null)}
          booking={selectedForLabel}
        />
      )}
    </div>
  );
}
