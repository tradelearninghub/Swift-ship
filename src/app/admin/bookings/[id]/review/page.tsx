"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/Card";
import { ReceiptLabelModal } from "@/components/ui/ReceiptLabelModal";
import { MOCK_BOOKINGS, MOCK_COURIER_PARTNERS, MockBooking } from "@/lib/mockData";
import { formatPaiseToRupees, formatGramsToKg } from "@/lib/utils";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Scale,
  Calculator,
  Truck,
  History,
  ShieldCheck,
  Printer,
  AlertTriangle,
} from "lucide-react";

export default function AdminBookingReviewPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = (params?.id as string) || "BK-1031";

  // Find booking
  const booking =
    MOCK_BOOKINGS.find(
      (b) =>
        b.booking_number.toUpperCase() === bookingId.toUpperCase() ||
        b.id === bookingId
    ) || MOCK_BOOKINGS[0];

  const parcel = booking.parcels[0];

  // Admin Verification Form State (§15 - stored separately)
  const [verifiedWeightGrams, setVerifiedWeightGrams] = useState(
    parcel?.verified_weight_grams?.toString() ||
      parcel?.submitted_weight_grams?.toString() ||
      "2500"
  );
  const [verifiedLengthCm, setVerifiedLengthCm] = useState(
    parcel?.verified_length_cm?.toString() ||
      parcel?.submitted_length_cm?.toString() ||
      "25"
  );
  const [verifiedWidthCm, setVerifiedWidthCm] = useState(
    parcel?.verified_width_cm?.toString() ||
      parcel?.submitted_width_cm?.toString() ||
      "20"
  );
  const [verifiedHeightCm, setVerifiedHeightCm] = useState(
    parcel?.verified_height_cm?.toString() ||
      parcel?.submitted_height_cm?.toString() ||
      "15"
  );

  // Manual Shipping Charge State (§16)
  const [shippingChargeRupees, setShippingChargeRupees] = useState(
    booking.charges ? (booking.charges.shipping_charge / 100).toString() : "150"
  );
  const [additionalChargeRupees, setAdditionalChargeRupees] = useState(
    booking.charges ? (booking.charges.additional_charge / 100).toString() : "20"
  );
  const [discountRupees, setDiscountRupees] = useState(
    booking.charges ? (booking.charges.discount / 100).toString() : "0"
  );
  const [taxRupees, setTaxRupees] = useState(
    booking.charges ? (booking.charges.tax / 100).toString() : "30"
  );

  const [selectedCourier, setSelectedCourier] = useState(
    booking.shipment?.courier_partner_id || "courier-1"
  );

  const [isProcessing, setIsProcessing] = useState(false);
  const [isApproved, setIsApproved] = useState(booking.status === "APPROVED");
  const [isLabelModalOpen, setIsLabelModalOpen] = useState(false);

  // Rejection modal
  const [showRejectBox, setShowRejectBox] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  // Calculate total in Rupees & Paise
  const numShipping = parseFloat(shippingChargeRupees) || 0;
  const numAdd = parseFloat(additionalChargeRupees) || 0;
  const numDisc = parseFloat(discountRupees) || 0;
  const numTax = parseFloat(taxRupees) || 0;
  const totalRupees = numShipping + numAdd + numTax - numDisc;
  const totalPaise = Math.round(totalRupees * 100);

  const handleApproveAndDispatch = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsApproved(true);
    }, 700);
  };

  const handleRejectBooking = () => {
    if (!rejectionReason.trim()) return;
    alert(`Booking rejected: ${rejectionReason}`);
    router.push("/admin/bookings");
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border-default pb-4">
        <div className="space-y-1">
          <Link
            href="/admin/bookings"
            className="text-xs text-text-secondary hover:text-brand-primary flex items-center gap-1 font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Review Queue
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold font-mono text-text-primary">
              Review Consignment #{booking.booking_number}
            </h1>
            <StatusBadge status={isApproved ? "APPROVED" : booking.status} />
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isApproved && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsLabelModalOpen(true)}
            >
              <Printer className="w-4 h-4 mr-1.5" /> Print Thermal Label
            </Button>
          )}
          <Button
            variant="danger"
            size="sm"
            onClick={() => setShowRejectBox(!showRejectBox)}
          >
            <XCircle className="w-4 h-4 mr-1.5" /> Reject Request
          </Button>
          <Button
            variant="accent"
            size="sm"
            onClick={handleApproveAndDispatch}
            isLoading={isProcessing}
          >
            <CheckCircle2 className="w-4 h-4 mr-1.5" /> Approve & Assign Courier
          </Button>
        </div>
      </div>

      {/* Rejection Prompt Box */}
      {showRejectBox && (
        <Card className="border-rose-300 bg-rose-50/50 p-4 space-y-3">
          <div className="font-bold text-xs text-rose-900 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-rose-600" /> Specify Rejection Reason
          </div>
          <textarea
            rows={2}
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="e.g. Incomplete address, unserviceable remote pincode, or restricted item category..."
            className="w-full text-xs p-2 bg-surface-base border border-rose-200 rounded-lg focus:outline-none"
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowRejectBox(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleRejectBooking}
            >
              Confirm Rejection
            </Button>
          </div>
        </Card>
      )}

      {/* Main Review Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Sender, Receiver, Weight Calibration, Charges */}
        <div className="lg:col-span-8 space-y-6">
          {/* Sender & Receiver Snapshots */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="p-4 space-y-2 text-xs">
              <div className="font-bold text-xs uppercase tracking-wider text-brand-primary border-b border-border-default pb-1">
                Sender Snapshot (Origin)
              </div>
              <div className="font-bold text-sm text-text-primary">{booking.sender_name}</div>
              <div className="text-text-secondary">{booking.sender_address}</div>
              <div className="font-semibold text-text-primary">
                {booking.sender_city}, {booking.sender_state} - {booking.sender_pincode}
              </div>
              <div className="font-mono text-text-muted">Ph: {booking.sender_mobile}</div>
            </Card>

            <Card className="p-4 space-y-2 text-xs">
              <div className="font-bold text-xs uppercase tracking-wider text-brand-accent border-b border-border-default pb-1">
                Receiver Snapshot (Destination)
              </div>
              <div className="font-bold text-sm text-text-primary">{booking.receiver_name}</div>
              <div className="text-text-secondary">{booking.receiver_address}</div>
              <div className="font-semibold text-text-primary">
                {booking.receiver_city}, {booking.receiver_state} - {booking.receiver_pincode}
              </div>
              <div className="font-mono text-text-muted">Ph: {booking.receiver_mobile}</div>
            </Card>
          </div>

          {/* Weight & Dimension Verification (§15) */}
          <Card>
            <CardHeader className="py-3 bg-surface-subtle flex flex-row items-center justify-between">
              <CardTitle className="text-xs uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-brand-primary" /> Weight & Dimension Verification (§15)
              </CardTitle>
              <span className="text-[11px] font-semibold text-text-secondary bg-slate-200 px-2 py-0.5 rounded">
                Separate Stored Metrics
              </span>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Submitted by Customer */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                  <div className="font-bold text-text-muted uppercase text-[10px]">
                    Customer Submitted
                  </div>
                  <div className="flex justify-between font-mono">
                    <span>Weight:</span>
                    <span className="font-bold text-text-primary">
                      {formatGramsToKg(parcel?.submitted_weight_grams || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span>Dimensions:</span>
                    <span className="text-text-primary">
                      {parcel?.submitted_length_cm} x {parcel?.submitted_width_cm} x{" "}
                      {parcel?.submitted_height_cm} cm
                    </span>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span>Declared Value:</span>
                    <span className="font-bold text-text-primary">
                      {formatPaiseToRupees(parcel?.declared_value || 0)}
                    </span>
                  </div>
                </div>

                {/* Admin Verified Inputs */}
                <div className="p-3 bg-blue-50/50 border border-blue-200 rounded-xl space-y-3 text-xs">
                  <div className="font-bold text-brand-primary uppercase text-[10px] flex items-center justify-between">
                    <span>Admin Verified Metrics</span>
                    <span className="text-[10px] text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded font-mono">
                      Editable
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      label="Weight (Grams)"
                      type="number"
                      value={verifiedWeightGrams}
                      onChange={(e) => setVerifiedWeightGrams(e.target.value)}
                    />
                    <Input
                      label="Length (cm)"
                      type="number"
                      value={verifiedLengthCm}
                      onChange={(e) => setVerifiedLengthCm(e.target.value)}
                    />
                    <Input
                      label="Width (cm)"
                      type="number"
                      value={verifiedWidthCm}
                      onChange={(e) => setVerifiedWidthCm(e.target.value)}
                    />
                    <Input
                      label="Height (cm)"
                      type="number"
                      value={verifiedHeightCm}
                      onChange={(e) => setVerifiedHeightCm(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Manual Shipping Charge Calculation (§16) */}
          <Card>
            <CardHeader className="py-3 bg-surface-subtle flex flex-row items-center justify-between">
              <CardTitle className="text-xs uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                <Calculator className="w-4 h-4 text-emerald-600" /> Manual Shipping Charge Breakdown (§16)
              </CardTitle>
              <span className="text-xs font-mono font-bold text-brand-primary">
                Total: {formatPaiseToRupees(totalPaise)}
              </span>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Input
                  label="Shipping Charge (₹)"
                  type="number"
                  value={shippingChargeRupees}
                  onChange={(e) => setShippingChargeRupees(e.target.value)}
                />
                <Input
                  label="Additional Charge (₹)"
                  type="number"
                  value={additionalChargeRupees}
                  onChange={(e) => setAdditionalChargeRupees(e.target.value)}
                />
                <Input
                  label="Discount (₹)"
                  type="number"
                  value={discountRupees}
                  onChange={(e) => setDiscountRupees(e.target.value)}
                />
                <Input
                  label="GST / Tax (₹)"
                  type="number"
                  value={taxRupees}
                  onChange={(e) => setTaxRupees(e.target.value)}
                />
              </div>

              {/* Charge Formula Summary */}
              <div className="mt-4 p-3 bg-surface-subtle border border-border-default rounded-xl flex items-center justify-between text-xs font-mono">
                <span className="text-text-muted">
                  ₹{numShipping} + ₹{numAdd} + ₹{numTax} - ₹{numDisc}
                </span>
                <span className="font-bold text-sm text-text-primary">
                  Calculated Total: ₹{totalRupees.toFixed(2)} ({totalPaise} paise)
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (4 cols): Courier Assignment & Activity Timeline */}
        <div className="lg:col-span-4 space-y-6">
          {/* Courier Selection Card */}
          <Card>
            <CardHeader className="py-3 bg-surface-subtle">
              <CardTitle className="text-xs uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-brand-primary" /> Courier Partner Selection
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs">
              <label className="block font-semibold text-text-primary">
                Assign Line-Haul Partner:
              </label>
              <select
                value={selectedCourier}
                onChange={(e) => setSelectedCourier(e.target.value)}
                className="w-full h-10 px-3 text-xs bg-surface-base border border-border-default rounded-lg focus:ring-1 focus:ring-brand-primary"
              >
                {MOCK_COURIER_PARTNERS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.status === "ACTIVE" ? "(API Online)" : "(Manual Fallback)"}
                  </option>
                ))}
              </select>

              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1 text-[11px] text-text-secondary">
                <div className="font-semibold text-text-primary">Selected Partner Capabilities:</div>
                <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" /> Automated AWB Generation
                </div>
                <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" /> Real-time Polling & Webhooks
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activity Timeline Audit Trail (§46) */}
          <Card>
            <CardHeader className="py-3 bg-surface-subtle">
              <CardTitle className="text-xs uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                <History className="w-4 h-4 text-slate-600" /> Activity Audit Trail (§46)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3 relative pl-4 border-l-2 border-slate-200 text-xs">
                <div className="relative">
                  <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-slate-400" />
                  <div className="font-semibold text-text-primary">Booking created by Customer</div>
                  <div className="text-[10px] text-text-muted font-mono">
                    {new Date(booking.created_at).toLocaleTimeString("en-IN")} • Web Portal
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-brand-primary" />
                  <div className="font-semibold text-text-primary">Admin opened review session</div>
                  <div className="text-[10px] text-text-muted font-mono">Just now • Super Admin</div>
                </div>

                {isApproved && (
                  <div className="relative">
                    <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-600" />
                    <div className="font-semibold text-emerald-700">
                      Booking approved & AWB generated
                    </div>
                    <div className="text-[10px] text-emerald-600 font-mono">
                      Just now • Auto-dispatched
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Thermal Label Modal */}
      <ReceiptLabelModal
        isOpen={isLabelModalOpen}
        onClose={() => setIsLabelModalOpen(false)}
        booking={booking}
      />
    </div>
  );
}
