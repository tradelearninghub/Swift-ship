"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Card } from "@/components/ui/Card";
import { StateView } from "@/components/ui/StateView";
import { ReceiptLabelModal } from "@/components/ui/ReceiptLabelModal";
import { formatPaiseToRupees, formatGramsToKg } from "@/lib/utils";
import {
  Search,
  Plus,
  Printer,
  RefreshCw,
} from "lucide-react";

export default function AdminBookingsPage() {
  const [viewState, setViewState] = useState<"populated" | "loading" | "empty" | "error">("loading");
  const [bookings, setBookings] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [courierFilter, setCourierFilter] = useState("ALL");
  const [paymentFilter, setPaymentFilter] = useState("ALL");
  const [selectedForLabel, setSelectedForLabel] = useState<any | null>(null);

  const fetchBookings = useCallback(async () => {
    setViewState("loading");
    try {
      const res = await fetch("/api/bookings?limit=100");
      if (!res.ok) {
        throw new Error("Failed to fetch bookings");
      }
      const data = await res.json();
      const list = data.bookings || [];
      setBookings(list);
      setViewState(list.length === 0 ? "empty" : "populated");
    } catch (e) {
      console.error("Fetch error:", e);
      setViewState("error");
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const filteredBookings = bookings.filter((b) => {
    const customerName = b.customer?.name || b.sender_name || "";
    const matchesSearch =
      !searchQuery ||
      b.booking_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.sender_city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.receiver_city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.shipment?.awb?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTab =
      activeTab === "ALL" ||
      (activeTab === "NEW" && b.status === "REQUESTED") ||
      (activeTab === "REVIEW" && b.status === "UNDER_REVIEW") ||
      (activeTab === "APPROVED" && b.status === "APPROVED") ||
      (activeTab === "CANCELLED" && (b.status === "CANCELLED" || b.status === "REJECTED"));

    const matchesCourier =
      courierFilter === "ALL" ||
      b.shipment?.courier_partner_id === courierFilter ||
      b.shipment?.courier_partner?.name?.toLowerCase().includes(courierFilter.toLowerCase());

    const matchesPayment =
      paymentFilter === "ALL" || b.payment_type === paymentFilter;

    return matchesSearch && matchesTab && matchesCourier && matchesPayment;
  });

  return (
    <div className="space-y-6">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Booking Operations Management</h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Process intake requests, verify package weight & dimensions, and assign courier line-haul dispatches.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchBookings}
            title="Refresh database records"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Refresh
          </Button>

          <Link href="/admin/bookings/new">
            <Button variant="primary" size="sm">
              <Plus className="w-4 h-4 mr-1" /> New Booking (Staff)
            </Button>
          </Link>
        </div>
      </div>

      {/* Tabs & Search Filter Bar */}
      <Card className="p-4 space-y-4">
        {/* Status Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-default pb-3">
          <div className="flex flex-wrap gap-2 text-xs font-semibold">
            {[
              { key: "ALL", label: "All Bookings", count: bookings.length },
              {
                key: "NEW",
                label: "New Requests (Review Queue)",
                count: bookings.filter((b) => b.status === "REQUESTED").length,
                highlight: true,
              },
              {
                key: "REVIEW",
                label: "Under Review",
                count: bookings.filter((b) => b.status === "UNDER_REVIEW").length,
              },
              {
                key: "APPROVED",
                label: "Approved & Dispatched",
                count: bookings.filter((b) => b.status === "APPROVED").length,
              },
              {
                key: "CANCELLED",
                label: "Cancelled / Rejected",
                count: bookings.filter(
                  (b) => b.status === "CANCELLED" || b.status === "REJECTED"
                ).length,
              },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === tab.key
                    ? "bg-brand-primary text-white shadow-sm font-bold"
                    : tab.highlight
                    ? "bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100"
                    : "bg-surface-subtle text-text-secondary hover:text-text-primary border border-border-default"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    activeTab === tab.key ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Search & Sub-filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-2 relative">
            <input
              type="text"
              placeholder="Search by Booking ID, customer, route, AWB..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-4 text-xs bg-surface-subtle border border-border-default rounded-lg focus:border-brand-primary focus:outline-none"
            />
            <Search className="w-4 h-4 text-text-muted absolute left-3 top-2.5" />
          </div>

          <div>
            <select
              value={courierFilter}
              onChange={(e) => setCourierFilter(e.target.value)}
              className="w-full h-9 px-3 text-xs bg-surface-subtle border border-border-default rounded-lg focus:border-brand-primary focus:outline-none"
            >
              <option value="ALL">All Couriers</option>
              <option value="delhivery">Delhivery</option>
              <option value="bluedart">Blue Dart</option>
              <option value="dtdc">DTDC</option>
              <option value="xpressbees">XpressBees</option>
            </select>
          </div>

          <div>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="w-full h-9 px-3 text-xs bg-surface-subtle border border-border-default rounded-lg focus:border-brand-primary focus:outline-none"
            >
              <option value="ALL">All Payment Types</option>
              <option value="PREPAID">Prepaid Only</option>
              <option value="COD">COD Only</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Bookings Table */}
      <Card>
        <StateView
          state={viewState}
          emptyTitle="No bookings found"
          emptyDescription="There are no bookings matching the current filters or registered in the database."
          onRetry={fetchBookings}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-subtle border-b border-border-default uppercase text-text-muted">
                <tr>
                  <th className="px-4 py-3 font-semibold">Booking ID</th>
                  <th className="px-4 py-3 font-semibold">Customer / Source</th>
                  <th className="px-4 py-3 font-semibold">Origin → Dest</th>
                  <th className="px-4 py-3 font-semibold">Weight (Sub / Ver)</th>
                  <th className="px-4 py-3 font-semibold">Payment / COD</th>
                  <th className="px-4 py-3 font-semibold">Shipping Charge</th>
                  <th className="px-4 py-3 font-semibold">Courier / AWB</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-default">
                {filteredBookings.map((b) => {
                  const parcel = b.parcels && b.parcels[0];
                  const subWeight = parcel?.submitted_weight_grams || 0;
                  const verWeight = parcel?.verified_weight_grams;
                  const custName = b.customer?.name || b.sender_name;
                  const custMobile = b.customer?.mobile || b.sender_mobile;

                  return (
                    <tr key={b.id} className="hover:bg-surface-subtle transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-brand-primary">
                        {b.booking_number}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-text-primary">{custName}</div>
                        <div className="text-[11px] text-text-muted flex items-center gap-1">
                          <span>{custMobile}</span> •{" "}
                          <span className="bg-slate-100 px-1 py-0.2 rounded uppercase font-bold text-[9px]">
                            {b.source}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-text-primary">
                          {b.sender_city} → {b.receiver_city}
                        </div>
                        <div className="text-[11px] text-text-muted">
                          To: {b.receiver_name}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono">
                        <div>Sub: {formatGramsToKg(subWeight)}</div>
                        <div className={verWeight ? "text-emerald-700 font-bold" : "text-amber-700"}>
                          Ver: {verWeight ? formatGramsToKg(verWeight) : "Pending"}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {b.payment_type === "COD" ? (
                          <span className="text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded font-bold text-[11px] border border-amber-200">
                            COD: {formatPaiseToRupees(b.cod_amount)}
                          </span>
                        ) : (
                          <span className="text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded font-semibold text-[11px] border border-emerald-200">
                            Prepaid
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono font-bold">
                        {b.charges ? (
                          formatPaiseToRupees(b.charges.total)
                        ) : (
                          <span className="text-amber-600 font-normal italic">Unset</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {b.shipment ? (
                          <div>
                            <div className="font-semibold text-text-primary">
                              {b.shipment.courier_partner?.name || "Assigned Partner"}
                            </div>
                            <div className="font-mono text-[11px] text-brand-primary">
                              {b.shipment.awb}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={b.shipment?.status || b.status} />
                      </td>
                      <td className="px-4 py-3 text-right space-x-1.5">
                        <Link href={`/admin/bookings/${b.booking_number}/review`}>
                          <Button
                            variant={b.status === "REQUESTED" ? "accent" : "outline"}
                            size="sm"
                          >
                            {b.status === "REQUESTED" ? "Review & Rate" : "View"}
                          </Button>
                        </Link>
                        {b.shipment && (
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Print Thermal Label"
                            onClick={() => setSelectedForLabel(b)}
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </StateView>
      </Card>

      {/* Label Modal */}
      {selectedForLabel && (
        <ReceiptLabelModal
          isOpen={!!selectedForLabel}
          onClose={() => setSelectedForLabel(null)}
          booking={selectedForLabel}
        />
      )}
    </div>
  );
}
