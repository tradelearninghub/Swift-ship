"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { COURIER_COMPANIES_CATALOG } from "@/lib/courierPartnersData";
import { getThirdPartyTrackingUrl } from "@/lib/trackingUrls";
import {
  Truck,
  ExternalLink,
  Barcode,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Globe,
  Loader2,
  Link as LinkIcon,
} from "lucide-react";

export interface UpdateTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: any;
  onSuccess?: (updatedBooking: any) => void;
}

export function UpdateTrackingModal({
  isOpen,
  onClose,
  booking,
  onSuccess,
}: UpdateTrackingModalProps) {
  const [courierCode, setCourierCode] = useState("DELHIVERY");
  const [courierName, setCourierName] = useState("Delhivery Logistics");
  const [thirdPartyTrackingId, setThirdPartyTrackingId] = useState("");
  const [thirdPartyTrackingUrl, setThirdPartyTrackingUrl] = useState("");
  const [manualAwb, setManualAwb] = useState("");
  const [awbDate, setAwbDate] = useState("");
  const [status, setStatus] = useState("IN_TRANSIT");

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Load existing tracking metadata whenever modal opens
  useEffect(() => {
    if (!isOpen || !booking) return;

    setErrorMsg(null);
    setSuccessMsg(null);
    setIsLoading(true);

    const bookingId = booking.id || booking.booking_number;

    async function loadTracking() {
      try {
        const res = await fetch(`/api/admin/bookings/${bookingId}/tracking`);
        if (res.ok) {
          const data = await res.json();
          setCourierCode(data.courier_code || "DELHIVERY");
          setCourierName(data.courier_name || "Delhivery Logistics");
          setThirdPartyTrackingId(data.third_party_tracking_id || "");
          setThirdPartyTrackingUrl(data.third_party_tracking_url || "");
          setManualAwb(data.manual_awb || booking.shipment?.awb || "");
          setAwbDate(data.awb_date || new Date().toISOString().split("T")[0]);
          setStatus(data.shipment_status || "IN_TRANSIT");
        } else {
          // Initialize defaults from booking
          setManualAwb(booking.shipment?.awb || "");
          setAwbDate(new Date().toISOString().split("T")[0]);
        }
      } catch (e) {
        // Fallback defaults
        setManualAwb(booking.shipment?.awb || "");
        setAwbDate(new Date().toISOString().split("T")[0]);
      } finally {
        setIsLoading(false);
      }
    }

    loadTracking();
  }, [isOpen, booking]);

  // Auto-regenerate tracking URL whenever carrier or tracking ID changes
  const handleTrackingIdChange = (idVal: string) => {
    setThirdPartyTrackingId(idVal);
    if (idVal.trim()) {
      const autoUrl = getThirdPartyTrackingUrl(courierCode || courierName, idVal.trim());
      setThirdPartyTrackingUrl(autoUrl);
    } else {
      setThirdPartyTrackingUrl("");
    }
  };

  const handleCourierChange = (codeVal: string) => {
    setCourierCode(codeVal);
    const matched = COURIER_COMPANIES_CATALOG.find(
      (c) => c.code === codeVal || c.id === codeVal
    );
    const nameVal = matched ? matched.name : codeVal;
    setCourierName(nameVal);

    if (thirdPartyTrackingId.trim()) {
      const autoUrl = getThirdPartyTrackingUrl(codeVal, thirdPartyTrackingId.trim());
      setThirdPartyTrackingUrl(autoUrl);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!booking) return;

    setIsSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const bookingId = booking.id || booking.booking_number;

    try {
      const payload = {
        courier_code: courierCode,
        courier_name: courierName,
        third_party_tracking_id: thirdPartyTrackingId.trim(),
        third_party_tracking_url: thirdPartyTrackingUrl.trim(),
        manual_awb: manualAwb.trim(),
        awb_date: awbDate.trim(),
        status: status,
      };

      const res = await fetch(`/api/admin/bookings/${bookingId}/tracking`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update carrier tracking details");
      }

      setSuccessMsg("Tracking information successfully saved and synced with public portal!");

      if (onSuccess) {
        const updatedBooking = {
          ...booking,
          shipment: data.shipment || {
            ...booking.shipment,
            awb: manualAwb.trim() || thirdPartyTrackingId.trim() || booking.shipment?.awb,
            courier_partner: { name: courierName, code: courierCode },
            label_url: thirdPartyTrackingUrl.trim(),
            status: status,
          },
          manual_awb: manualAwb.trim(),
          awb_date: awbDate.trim(),
          third_party_tracking_id: thirdPartyTrackingId.trim(),
          third_party_tracking_url: thirdPartyTrackingUrl.trim(),
          courier_name: courierName,
        };
        onSuccess(updatedBooking);
      }

      setTimeout(() => {
        onClose();
      }, 900);
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred while saving tracking details.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!booking) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Third-Party Carrier Tracking & AWB Assignment"
      description={`Update third-party parcel company tracking number and pre-printed AWB sticker for #${booking.booking_number}`}
      maxWidth="lg"
    >
      {isLoading ? (
        <div className="py-12 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-7 h-7 animate-spin text-[#030164]" />
          <p className="text-xs text-text-muted">Loading current tracking details...</p>
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-5 pt-1">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Consignment Snapshot */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono">
            <div>
              <span className="text-text-muted block text-[10px] uppercase font-sans">Booking Ref:</span>
              <span className="font-bold text-[#030164]">{booking.booking_number}</span>
            </div>
            <div>
              <span className="text-text-muted block text-[10px] uppercase font-sans">Customer / Sender:</span>
              <span className="font-medium text-text-primary truncate block">
                {booking.customer?.name || booking.sender_name}
              </span>
            </div>
            <div>
              <span className="text-text-muted block text-[10px] uppercase font-sans">Route:</span>
              <span className="font-medium text-text-primary truncate block">
                {booking.sender_city} → {booking.receiver_city}
              </span>
            </div>
            <div>
              <span className="text-text-muted block text-[10px] uppercase font-sans">Payment:</span>
              <span className="text-emerald-700 font-bold">Prepaid</span>
            </div>
          </div>

          {/* Pre-Printed Sticker Barcode & Date Section */}
          <div className="space-y-4 bg-emerald-50/40 p-4 rounded-xl border border-emerald-100">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                <Barcode className="w-4 h-4 text-emerald-700" /> Pre-Printed AWB Sticker & Dispatch Date
              </h4>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded-full border border-emerald-300">
                Registered Business Tag Support
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Input
                  label="Physical Sticker AWB / Barcode Tag"
                  value={manualAwb}
                  onChange={(e) => setManualAwb(e.target.value.toUpperCase())}
                  placeholder="e.g. AWB-98214012"
                  helperText="Pre-printed barcode number on the parcel sticker"
                />
              </div>

              <div>
                <Input
                  label="Sticker Dispatch Date"
                  type="date"
                  value={awbDate}
                  onChange={(e) => setAwbDate(e.target.value)}
                  helperText="Date tag was applied / dispatched"
                />
              </div>
            </div>
          </div>

          {/* Carrier Selection & Tracking ID Input */}
          <div className="space-y-4 bg-blue-50/40 p-4 rounded-xl border border-blue-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#030164] flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-[#2563EB]" /> Third-Party Courier Company Details
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-text-primary">
                  Select Parcel / Courier Company <span className="text-status-danger">*</span>
                </label>
                <select
                  value={courierCode}
                  onChange={(e) => handleCourierChange(e.target.value)}
                  className="w-full h-10 px-3 text-xs bg-white border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-[#030164] font-medium"
                  required
                >
                  <optgroup label="Domestic Couriers (India)">
                    {COURIER_COMPANIES_CATALOG.filter((c) => c.country === "India").map((c) => (
                      <option key={c.id} value={c.code}>
                        {c.name} ({c.badge})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="International / US Couriers">
                    {COURIER_COMPANIES_CATALOG.filter((c) => c.country === "International / USA").map((c) => (
                      <option key={c.id} value={c.code}>
                        {c.name} ({c.badge})
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <div>
                <Input
                  label="Carrier Tracking ID / AWB Number"
                  value={thirdPartyTrackingId}
                  onChange={(e) => handleTrackingIdChange(e.target.value)}
                  placeholder="e.g. 78219401293 or DEL9812401"
                  helperText="Tracking code assigned by the courier company"
                  required
                />
              </div>
            </div>

            {/* Auto-generated Third-Party Tracking URL */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-text-primary flex items-center gap-1">
                  <LinkIcon className="w-3.5 h-3.5 text-[#2563EB]" />
                  Carrier Website Official Tracking URL
                </label>
                {thirdPartyTrackingUrl && (
                  <button
                    type="button"
                    onClick={() => window.open(thirdPartyTrackingUrl, "_blank")}
                    className="text-[11px] font-semibold text-[#2563EB] hover:underline flex items-center gap-1"
                  >
                    Test Link <ExternalLink className="w-3 h-3" />
                  </button>
                )}
              </div>
              <input
                type="url"
                value={thirdPartyTrackingUrl}
                onChange={(e) => setThirdPartyTrackingUrl(e.target.value)}
                placeholder="Auto-generated courier tracking page link"
                className="w-full h-10 px-3 text-xs font-mono bg-white border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-[#030164] text-slate-700"
              />
              <p className="text-[10px] text-text-muted">
                Auto-generated for <strong>{courierName}</strong>. Customers will be able to click this tracking ID directly or tap a redirect button to track live on the courier's official portal.
              </p>
            </div>
          </div>

          {/* Shipment Status Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-text-primary">
                Consignment Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full h-10 px-3 text-xs bg-surface-base border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-[#030164] font-medium"
              >
                <option value="AWB_GENERATED">AWB Allocated & Ready</option>
                <option value="IN_TRANSIT">In Transit (Dispatched to Linehaul)</option>
                <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                <option value="DELIVERED">Delivered</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2.5 pt-3 border-t border-border-default">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSaving}
              className="bg-[#030164] hover:bg-[#120e7a] text-white"
            >
              Save Carrier Tracking & AWB
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
