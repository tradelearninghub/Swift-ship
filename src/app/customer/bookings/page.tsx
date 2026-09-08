"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { StateView } from "@/components/ui/StateView";
import { ReceiptLabelModal } from "@/components/ui/ReceiptLabelModal";
import { MOCK_BOOKINGS, MockBooking } from "@/lib/mockData";
import { formatPaiseToRupees, formatGramsToKg } from "@/lib/utils";
import {
  Search,
  Plus,
  Filter,
  Eye,
  ArrowRight,
  Package,
  Layers,
  CheckCircle2,
  Printer,
} from "lucide-react";

export default function CustomerBookingsPage() {
  const [viewState, setViewState] = useState<"populated" | "loading" | "empty" | "error">("populated");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedForLabel, setSelectedForLabel] = useState<MockBooking | null>(null);

  const filteredBookings = MOCK_BOOKINGS.filter((b) => {
    const matchesSearch =
      b.booking_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.receiver_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.shipment?.awb?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" || b.status === statusFilter || b.shipment?.status === statusFilter;

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
        <div className="flex items-center gap-3">
          {/* State Switcher for visual inspection */}
          <div className="hidden lg:flex items-center gap-1 bg-surface-base p-1 rounded-lg border border-border-default text-[11px]">
            <span className="text-text-muted px-2 font-semibold">State:</span>
            <button
              onClick={() => setViewState("populated")}
              className={`px-2 py-0.5 rounded ${viewState === "populated" ? "bg-brand-primary text-white" : "text-text-secondary"}`}
            >
              Populated
            </button>
            <button
              onClick={() => setViewState("loading")}
              className={`px-2 py-0.5 rounded ${viewState === "loading" ? "bg-brand-primary text-white" : "text-text-secondary"}`}
            >
              Loading
            </button>
            <button
              onClick={() => setViewState("empty")}
              className={`px-2 py-0.5 rounded ${viewState === "empty" ? "bg-brand-primary text-white" : "text-text-secondary"}`}
            >
              Empty
            </button>
            <button
              onClick={() => setViewState("error")}
              className={`px-2 py-0.5 rounded ${viewState === "error" ? "bg-brand-primary text-white" : "text-text-secondary"}`}
            >
              Error
            </button>
          </div>

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
              placeholder="Search by ID, receiver, or AWB..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-4 text-xs bg-surface-subtle border border-border-default rounded-lg focus:border-brand-primary focus:outline-none"
            />
            <Search className="w-4 h-4 text-text-muted absolute left-3 top-2.5" />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <span className="text-xs text-text-muted flex items-center gap-1 font-semibold">
              <Filter className="w-3.5 h-3.5" /> Filter Status:
            </span>
            {["ALL", "REQUESTED", "UNDER_REVIEW", "IN_TRANSIT", "DELIVERED"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  statusFilter === st
                    ? "bg-brand-primary text-white shadow-sm"
                    : "bg-surface-subtle text-text-secondary hover:text-text-primary border border-border-default"
                }`}
              >
                {st.replace(/_/g, " ")}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Bookings Data Table wrapped in StateView */}
      <Card>
        <StateView
          state={viewState}
          emptyTitle="No bookings found"
          emptyDescription="You haven't placed any bookings matching this criteria yet."
          emptyAction={
            <Link href="/book">
              <Button variant="accent" size="sm">
                <Plus className="w-4 h-4 mr-1" /> Create First Booking
              </Button>
            </Link>
          }
          onRetry={() => setViewState("populated")}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-subtle border-b border-border-default uppercase text-text-muted">
                <tr>
                  <th className="px-6 py-3 font-semibold">Booking ID</th>
                  <th className="px-6 py-3 font-semibold">Date</th>
                  <th className="px-6 py-3 font-semibold">Receiver & Route</th>
                  <th className="px-6 py-3 font-semibold">Weight</th>
                  <th className="px-6 py-3 font-semibold">Payment / Charge</th>
                  <th className="px-6 py-3 font-semibold">Courier / AWB</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                  <th className="px-6 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-default">
                {filteredBookings.map((b) => {
                  const parcel = b.parcels[0];
                  const weightGrams =
                    parcel?.verified_weight_grams ?? parcel?.submitted_weight_grams ?? 0;

                  return (
                    <tr key={b.id} className="hover:bg-surface-subtle transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-brand-primary">
                        {b.booking_number}
                      </td>
                      <td className="px-6 py-4 text-text-secondary">
                        {new Date(b.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-text-primary">{b.receiver_name}</div>
                        <div className="text-[11px] text-text-muted">
                          {b.sender_city} → {b.receiver_city}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono">
                        {formatGramsToKg(weightGrams)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-text-primary">
                          {b.payment_type === "COD" ? (
                            <span className="text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                              COD: {formatPaiseToRupees(b.cod_amount)}
                            </span>
                          ) : (
                            <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                              Prepaid
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-text-muted mt-0.5">
                          Shipping:{" "}
                          {b.charges
                            ? formatPaiseToRupees(b.charges.total)
                            : "Pending review"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {b.shipment ? (
                          <div>
                            <div className="font-medium text-text-primary">
                              {b.shipment.courier_name}
                            </div>
                            <div className="font-mono text-[11px] text-brand-primary">
                              {b.shipment.awb}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Pending Assignment</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={b.shipment?.status || b.status} />
                      </td>
                      <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedForLabel(b)}
                        >
                          <Printer className="w-3.5 h-3.5 mr-1" /> Print Slip
                        </Button>
                        <Link href={`/customer/bookings/${b.booking_number}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="w-3.5 h-3.5 mr-1" /> View
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </StateView>
      </Card>

      {/* Booking Slip / Shipping Label Modal */}
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
