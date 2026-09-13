"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  MapPin,
  CheckCircle2,
  AlertCircle,
  Truck,
  Building2,
  Package,
  Calendar,
  Clock,
} from "lucide-react";

interface MilestoneUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  shipment: any | null;
  onSuccess?: (updatedShipment: any) => void;
}

const MILESTONE_OPTIONS = [
  { value: "PICKED_UP", label: "Picked Up from Sender", defaultRemark: "Shipment collected from pickup location" },
  { value: "AT_ORIGIN_HUB", label: "At Origin Sorting Facility", defaultRemark: "Package processed at origin sorting center" },
  { value: "IN_TRANSIT", label: "In Transit to Destination", defaultRemark: "Line-haul transit towards destination hub" },
  { value: "AT_DESTINATION_HUB", label: "At Destination Delivery Hub", defaultRemark: "Consignment arrived at destination delivery branch" },
  { value: "OUT_FOR_DELIVERY", label: "Out For Delivery", defaultRemark: "Dispatched with courier associate for final doorstep delivery" },
  { value: "DELIVERED", label: "Delivered to Consignee", defaultRemark: "Consignment delivered successfully with signature" },
  { value: "FAILED_ATTEMPT", label: "Delivery Attempt Failed / Rescheduled", defaultRemark: "Customer unavailable / premises closed / rescheduled" },
  { value: "RTO", label: "Return to Origin (RTO)", defaultRemark: "Returning package back to sender origin address" },
  { value: "EXCEPTION", label: "Transit Delay / Exception", defaultRemark: "Operational delay encountered in transit" },
];

export function MilestoneUpdateModal({
  isOpen,
  onClose,
  shipment,
  onSuccess,
}: MilestoneUpdateModalProps) {
  const [status, setStatus] = useState("IN_TRANSIT");
  const [location, setLocation] = useState("");
  const [remarks, setRemarks] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (shipment) {
      // Default location to receiver city or sender city
      const defaultLoc =
        shipment.booking?.receiver_city ||
        shipment.booking?.sender_city ||
        "Jaipur Hub";
      setLocation(defaultLoc);
      setStatus(
        shipment.status === "AWB_GENERATED"
          ? "PICKED_UP"
          : shipment.status === "PICKED_UP"
          ? "AT_ORIGIN_HUB"
          : shipment.status === "OUT_FOR_DELIVERY"
          ? "DELIVERED"
          : "IN_TRANSIT"
      );
      setRemarks("");
      setErrorMsg(null);
      setSuccessMsg(null);
    }
  }, [shipment]);

  if (!shipment) return null;

  const isInHouse =
    shipment.courier_partner?.code === "IN_HOUSE" ||
    shipment.awb?.startsWith("SSC-");

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
    const opt = MILESTONE_OPTIONS.find((o) => o.value === newStatus);
    if (opt && !remarks) {
      setRemarks(opt.defaultRemark);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location.trim()) {
      setErrorMsg("Please specify the current checkpoint location");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(`/api/admin/shipments/${shipment.id}/milestone`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          location: location.trim(),
          remarks: remarks.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to post milestone update");
      }

      setSuccessMsg(`Status updated to ${status} successfully.`);
      if (onSuccess) {
        onSuccess(data.shipment);
      }
      setTimeout(() => {
        onClose();
      }, 900);
    } catch (err: any) {
      setErrorMsg(err.message || "Network error while saving milestone");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Update Shipment Tracking & Milestones"
      description={`Post real-time status and physical checkpoint for AWB ${shipment.awb}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        {/* Shipment Header Banner */}
        <div className="p-3 bg-surface-subtle border border-border-default rounded-xl space-y-1.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-mono font-bold text-brand-primary text-sm">
              {shipment.awb}
            </span>
            <div className="flex items-center gap-1.5">
              {isInHouse ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1">
                  <Truck className="w-3 h-3" /> In-House Fleet
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                  {shipment.courier_partner?.name || "Third-Party"}
                </span>
              )}
              <StatusBadge status={shipment.status} />
            </div>
          </div>
          <div className="text-text-muted flex justify-between">
            <span>
              Route: {shipment.booking?.sender_city || "Origin"} →{" "}
              {shipment.booking?.receiver_city || "Destination"}
            </span>
            <span>Receiver: {shipment.booking?.receiver_name || "—"}</span>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Milestone Selection */}
        <div className="space-y-1">
          <label className="block text-xs font-bold text-text-primary">
            New Tracking Process / Milestone <span className="text-red-500">*</span>
          </label>
          <select
            value={status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="w-full h-9 px-3 text-xs bg-surface-base border border-border-default rounded-lg focus:ring-1 focus:ring-brand-primary font-medium"
            required
          >
            {MILESTONE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Location Input */}
        <div className="space-y-1">
          <label className="block text-xs font-bold text-text-primary">
            Current Location / Sorting Hub <span className="text-red-500">*</span>
          </label>
          <Input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Jaipur Sorting Hub, Tonk Road Delivery Center, Delhi Transit..."
            required
          />
          {/* Quick Location Suggestion Pills */}
          <div className="flex flex-wrap gap-1.5 pt-1 text-[11px]">
            {[
              shipment.booking?.sender_city ? `${shipment.booking.sender_city} Hub` : null,
              shipment.booking?.receiver_city ? `${shipment.booking.receiver_city} Delivery Center` : null,
              "Jaipur Central Hub",
              "Out for Delivery Route",
            ]
              .filter(Boolean)
              .map((loc, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => setLocation(loc as string)}
                  className="px-2 py-0.5 rounded bg-surface-subtle border border-border-default text-text-secondary hover:text-brand-primary hover:border-brand-primary text-[10px]"
                >
                  + {loc}
                </button>
              ))}
          </div>
        </div>

        {/* Remarks / Process Note */}
        <div className="space-y-1">
          <label className="block text-xs font-bold text-text-primary">
            Process Remarks / Status Detail (Customer Visible)
          </label>
          <input
            type="text"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="e.g. In transit towards destination hub via express route"
            className="w-full h-9 px-3 text-xs bg-surface-base border border-border-default rounded-lg focus:border-brand-primary focus:outline-none"
          />
          <p className="text-[10px] text-text-muted">
            This status and timestamp will appear directly in the public tracking timeline for the customer.
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-3 border-t border-border-default">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            isLoading={isSubmitting}
            className="bg-brand-primary hover:bg-brand-primary/90 text-white"
          >
            <MapPin className="w-3.5 h-3.5 mr-1.5" /> Save Checkpoint
          </Button>
        </div>
      </form>
    </Modal>
  );
}
