"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/Card";
import { ReceiptLabelModal } from "@/components/ui/ReceiptLabelModal";
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
  Loader2,
  AlertCircle,
} from "lucide-react";

export default function AdminBookingReviewPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = (params?.id as string) || "";

  const [booking, setBooking] = useState<any | null>(null);
  const [couriers, setCouriers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Admin Verification Form State
  const [verifiedWeightGrams, setVerifiedWeightGrams] = useState("1000");
  const [verifiedLengthCm, setVerifiedLengthCm] = useState("20");
  const [verifiedWidthCm, setVerifiedWidthCm] = useState("15");
  const [verifiedHeightCm, setVerifiedHeightCm] = useState("10");

  // Manual Shipping Charge State
  const [shippingChargeRupees, setShippingChargeRupees] = useState("150");
  const [additionalChargeRupees, setAdditionalChargeRupees] = useState("0");
  const [discountRupees, setDiscountRupees] = useState("0");
  const [taxRupees, setTaxRupees] = useState("27");
  const [selectedCourier, setSelectedCourier] = useState("");

  const [isProcessing, setIsProcessing] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [isLabelModalOpen, setIsLabelModalOpen] = useState(false);

  // Rejection modal
  const [showRejectBox, setShowRejectBox] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  // Fetch real booking and couriers
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      setErrorMsg(null);
      try {
        const [bookingRes, couriersRes] = await Promise.all([
          fetch(`/api/admin/bookings/${bookingId}/review`),
          fetch("/api/admin/couriers"),
        ]);

        if (!bookingRes.ok) {
          throw new Error("Booking not found or access denied");
        }

        const bData = await bookingRes.json();
        const cData = couriersRes.ok ? await couriersRes.json() : { couriers: [] };

        const b = bData.booking;
        setBooking(b);
        setIsApproved(b.status === "APPROVED");

        const parcel = b.parcels && b.parcels[0];
        if (parcel) {
          setVerifiedWeightGrams(
            (parcel.verified_weight_grams || parcel.submitted_weight_grams || 1000).toString()
          );
          setVerifiedLengthCm(
            (parcel.verified_length_cm || parcel.submitted_length_cm || 20).toString()
          );
          setVerifiedWidthCm(
            (parcel.verified_width_cm || parcel.submitted_width_cm || 15).toString()
          );
          setVerifiedHeightCm(
            (parcel.verified_height_cm || parcel.submitted_height_cm || 10).toString()
          );
        }

        if (b.charges) {
          setShippingChargeRupees((b.charges.shipping_charge / 100).toString());
          setAdditionalChargeRupees((b.charges.additional_charge / 100).toString());
          setDiscountRupees((b.charges.discount / 100).toString());
          setTaxRupees((b.charges.tax / 100).toString());
        }

        const courierList = cData.couriers || [];
        setCouriers(courierList);
        if (b.shipment?.courier_partner_id) {
          setSelectedCourier(b.shipment.courier_partner_id);
        } else if (courierList.length > 0) {
          setSelectedCourier(courierList[0].id);
        }
      } catch (err: any) {
        setErrorMsg(err.message || "Failed to load booking details");
      } finally {
        setIsLoading(false);
      }
    }

    if (bookingId) {
      loadData();
    }
  }, [bookingId]);

  // Calculate total in Rupees & Paise
  const numShipping = parseFloat(shippingChargeRupees) || 0;
  const numAdd = parseFloat(additionalChargeRupees) || 0;
  const numDisc = parseFloat(discountRupees) || 0;
  const numTax = parseFloat(taxRupees) || 0;
  const totalRupees = numShipping + numAdd + numTax - numDisc;
  const totalPaise = Math.round(totalRupees * 100);

  const handleApproveAndDispatch = async () => {
    if (!booking) return;
    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const payload = {
        action: "APPROVE",
        verified_weight_grams: Math.round(parseFloat(verifiedWeightGrams || "1000")),
        verified_length_cm: Math.round(parseFloat(verifiedLengthCm || "20")),
        verified_width_cm: Math.round(parseFloat(verifiedWidthCm || "15")),
        verified_height_cm: Math.round(parseFloat(verifiedHeightCm || "10")),
        shipping_charge_paise: Math.round(numShipping * 100),
        additional_charge_paise: Math.round(numAdd * 100),
        discount_paise: Math.round(numDisc * 100),
        tax_paise: Math.round(numTax * 100),
        courier_partner_id: selectedCourier || undefined,
      };

      const res = await fetch(`/api/admin/bookings/${booking.id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Approval transaction failed");
      }

      setBooking(data.result.booking);
      setIsApproved(true);
      setIsLabelModalOpen(true);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to approve booking");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectBooking = async () => {
    if (!booking || !rejectionReason.trim()) return;
    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`/api/admin/bookings/${booking.id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "REJECT",
          rejection_reason: rejectionReason.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to reject booking");
      }

      router.push("/admin/bookings");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to reject booking");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center space-y-3">
        <Loader2 className="w-8 h-8 text-brand-primary animate-spin mx-auto" />
        <p className="text-xs text-text-secondary">Loading booking consignment details...</p>
      </div>
    );
  }

  if (errorMsg || !booking) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-text-primary">Booking Not Found</h2>
        <p className="text-xs text-text-secondary">{errorMsg || "Unable to locate booking record in the database."}</p>
        <Link href="/admin/bookings">
          <Button variant="primary" size="sm">
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Bookings
          </Button>
        </Link>
      </div>
    );
  }

  const parcel = booking.parcels && booking.parcels[0];

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
                {couriers.map((c) => (
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
