"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { StateView } from "@/components/ui/StateView";
import { ReceiptLabelModal } from "@/components/ui/ReceiptLabelModal";
import { MilestoneUpdateModal } from "@/components/ui/MilestoneUpdateModal";
import { Search, Printer, RefreshCw, ExternalLink, MapPin } from "lucide-react";

export default function AdminShipmentsPage() {
  const [viewState, setViewState] = useState<"populated" | "loading" | "empty" | "error">("loading");
  const [shipments, setShipments] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedForLabel, setSelectedForLabel] = useState<any | null>(null);
  const [selectedForMilestone, setSelectedForMilestone] = useState<any | null>(null);

  const fetchShipments = useCallback(async () => {
    setViewState("loading");
    try {
      const params = new URLSearchParams({ limit: "100" });
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      if (searchQuery) params.set("q", searchQuery);

      const res = await fetch(`/api/admin/shipments?${params}`);
      if (!res.ok) throw new Error("Failed to fetch shipments");
      const data = await res.json();
      const list = data.shipments || [];
      setShipments(list);
      setViewState(list.length === 0 ? "empty" : "populated");
    } catch {
      setViewState("error");
    }
  }, [statusFilter, searchQuery]);

  useEffect(() => {
    fetchShipments();
  }, [fetchShipments]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Shipments & AWB Management</h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Monitor active carrier dispatches, sync live tracking checkpoints, and print thermal labels.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchShipments}>
          <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Refresh
        </Button>
      </div>

      {/* Filters Bar */}
      <Card className="p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2 text-xs font-semibold">
            {[
              { key: "ALL", label: "All Active Shipments" },
              { key: "IN_TRANSIT", label: "In Transit" },
              { key: "OUT_FOR_DELIVERY", label: "Out For Delivery" },
              { key: "DELIVERED", label: "Delivered" },
              { key: "RTO", label: "RTO / Returns" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  statusFilter === tab.key
                    ? "bg-brand-primary text-white font-bold shadow-sm"
                    : "bg-surface-subtle text-text-secondary hover:text-text-primary border border-border-default"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search AWB or Booking ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-8 pl-8 pr-3 text-xs bg-surface-subtle border border-border-default rounded-lg focus:border-brand-primary focus:outline-none"
            />
            <Search className="w-3.5 h-3.5 text-text-muted absolute left-2.5 top-2.5" />
          </div>
        </div>
      </Card>

      {/* Shipments Table */}
      <Card>
        <StateView
          state={viewState}
          emptyTitle="No shipments found"
          emptyDescription="No shipments match the selected status filters."
          onRetry={fetchShipments}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-subtle border-b border-border-default uppercase text-text-muted">
                <tr>
                  <th className="px-4 py-3 font-semibold">AWB Number</th>
                  <th className="px-4 py-3 font-semibold">Booking ID</th>
                  <th className="px-4 py-3 font-semibold">Courier Partner</th>
                  <th className="px-4 py-3 font-semibold">Route</th>
                  <th className="px-4 py-3 font-semibold">Latest Checkpoint</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-default">
                {shipments.map((s) => {
                  const latestEvent = s.tracking_events?.[0];
                  const b = s.booking;

                  return (
                    <tr key={s.id} className="hover:bg-surface-subtle transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-brand-primary">
                        {s.awb}
                      </td>
                      <td className="px-4 py-3 font-mono font-semibold text-text-primary">
                        {b?.booking_number || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-text-primary">
                          {s.courier_partner?.name || "Unknown"}
                        </div>
                        <div className="text-[10px] text-text-muted font-mono uppercase">
                          {s.awb_source || s.courier_partner?.code}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          {b?.sender_city} → {b?.receiver_city}
                        </div>
                        <div className="text-[11px] text-text-muted">{b?.receiver_name}</div>
                      </td>
                      <td className="px-4 py-3">
                        {latestEvent ? (
                          <div>
                            <div className="font-medium text-text-primary">
                              {latestEvent.raw_status}
                            </div>
                            <div className="text-[10px] text-text-muted font-mono">
                              {latestEvent.location} •{" "}
                              {new Date(latestEvent.occurred_at).toLocaleTimeString("en-IN", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">No events logged</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={s.status} />
                      </td>
                      <td className="px-4 py-3 text-right space-x-1.5 whitespace-nowrap">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-brand-primary hover:bg-brand-primary/10 border-brand-primary/30"
                          onClick={() => setSelectedForMilestone(s)}
                          title="Update Tracking Status / Milestones"
                        >
                          <MapPin className="w-3.5 h-3.5 mr-1" /> Update Status
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedForLabel({ ...b, shipment: s })}
                        >
                          <Printer className="w-3.5 h-3.5 mr-1" /> Label
                        </Button>
                        <Link href={`/track?q=${s.awb}`}>
                          <Button variant="ghost" size="sm" title="View Public Tracking">
                            <ExternalLink className="w-3.5 h-3.5" />
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

      {/* Thermal Label Modal */}
      {selectedForLabel && (
        <ReceiptLabelModal
          isOpen={!!selectedForLabel}
          onClose={() => setSelectedForLabel(null)}
          booking={selectedForLabel}
        />
      )}

      {/* Milestone / Checkpoint Update Modal */}
      {selectedForMilestone && (
        <MilestoneUpdateModal
          isOpen={!!selectedForMilestone}
          onClose={() => setSelectedForMilestone(null)}
          shipment={selectedForMilestone}
          onSuccess={() => fetchShipments()}
        />
      )}
    </div>
  );
}
