"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { ShipmentTimeline } from "@/components/ui/ShipmentTimeline";
import { ReceiptLabelModal } from "@/components/ui/ReceiptLabelModal";
import { formatPaiseToRupees, formatGramsToKg } from "@/lib/utils";
import { formatDateTimeIST } from "@/lib/datetime";
import {
  ArrowLeft,
  Printer,
  Package,
  MapPin,
  Truck,
  User,
  RefreshCw,
  Clock,
  ExternalLink,
} from "lucide-react";

export default function CustomerBookingDetailPage() {
  const params = useParams();
  const bookingId = (params?.id as string) || "";

  const [booking, setBooking] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLabelModalOpen, setIsLabelModalOpen] = useState(false);

  const fetchBooking = useCallback(async () => {
    if (!bookingId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/bookings?id=${encodeURIComponent(bookingId)}`);
      if (!res.ok) throw new Error("Failed to load booking details");
      const data = await res.json();
      const found = data.bookings?.[0];
      if (!found) {
        setError("Booking not found");
      } else {
        setBooking(found);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load booking");
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    fetchBooking();
  }, [fetchBooking]);

  if (loading) {
    return (
      <div className="py-24 text-center text-xs text-text-muted">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-primary" />
        Loading consignment details…
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="py-24 text-center max-w-md mx-auto space-y-4">
        <Package className="w-12 h-12 mx-auto text-text-muted/60" />
        <div>
          <h2 className="text-base font-bold text-text-primary">Consignment Not Found</h2>
          <p className="text-xs text-text-secondary mt-1">
            Could not find any parcel booking matching &ldquo;{bookingId}&rdquo;.
          </p>
        </div>
        <Link href="/customer/bookings">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to All Bookings
          </Button>
        </Link>
      </div>
    );
  }

  const parcel = booking.parcels?.[0];
  const weightGrams = parcel?.verified_weight_grams ?? parcel?.submitted_weight_grams ?? 0;
  const lengthCm = parcel?.verified_length_cm ?? parcel?.submitted_length_cm ?? 0;
  const widthCm = parcel?.verified_width_cm ?? parcel?.submitted_width_cm ?? 0;
  const heightCm = parcel?.verified_height_cm ?? parcel?.submitted_height_cm ?? 0;
  const trackingToken = booking.shipment?.tracking_token || booking.shipment?.awb || booking.booking_number;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border-default pb-4">
        <div className="space-y-1">
          <Link
            href="/customer/bookings"
            className="text-xs text-text-secondary hover:text-brand-primary flex items-center gap-1 font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to All Bookings
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold font-mono text-text-primary">
              #{booking.booking_number}
            </h1>
            <StatusBadge status={booking.shipment?.status || booking.status} />
          </div>
          <div className="text-xs text-text-muted">
            Booked on {formatDateTimeIST(booking.created_at)}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsLabelModalOpen(true)}
          >
            <Printer className="w-4 h-4 mr-1.5" /> Print Label / Receipt
          </Button>
          <Link href={`/track/${trackingToken}`}>
            <Button variant="primary" size="sm">
              <Truck className="w-4 h-4 mr-1.5" /> Live Tracking <ExternalLink className="w-3 h-3 ml-1" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Snapshot Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sender Snapshot */}
        <Card>
          <CardHeader className="py-3 bg-surface-subtle">
            <CardTitle className="text-xs uppercase tracking-wider text-text-muted flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-brand-primary" /> Sender (Pickup)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-1.5 text-xs">
            <div className="font-bold text-sm text-text-primary">{booking.sender_name}</div>
            <div className="text-text-secondary">{booking.sender_address}</div>
            {booking.sender_landmark && (
              <div className="text-[11px] text-text-muted">
                <span className="font-semibold">Landmark:</span> {booking.sender_landmark}
              </div>
            )}
            <div className="font-semibold text-text-primary">
              {booking.sender_city}
              {booking.sender_district ? `, ${booking.sender_district}` : ""}
              {booking.sender_state ? `, ${booking.sender_state}` : ""} - {booking.sender_pincode}
            </div>
            <div className="font-mono text-text-muted pt-1 border-t border-border-default/60">
              Ph: {booking.sender_mobile}
              {booking.sender_email && (
                <div className="font-sans text-[11px] text-text-muted truncate">
                  {booking.sender_email}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Receiver Snapshot */}
        <Card>
          <CardHeader className="py-3 bg-surface-subtle">
            <CardTitle className="text-xs uppercase tracking-wider text-text-muted flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-brand-accent" /> Receiver (Delivery)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-1.5 text-xs">
            <div className="font-bold text-sm text-text-primary">{booking.receiver_name}</div>
            <div className="text-text-secondary">{booking.receiver_address}</div>
            {booking.receiver_landmark && (
              <div className="text-[11px] text-text-muted">
                <span className="font-semibold">Landmark:</span> {booking.receiver_landmark}
              </div>
            )}
            <div className="font-semibold text-text-primary">
              {booking.receiver_city}
              {booking.receiver_district ? `, ${booking.receiver_district}` : ""}
              {booking.receiver_state ? `, ${booking.receiver_state}` : ""} - {booking.receiver_pincode}
            </div>
            <div className="font-mono text-text-muted pt-1 border-t border-border-default/60">
              Ph: {booking.receiver_mobile}
              {booking.receiver_email && (
                <div className="font-sans text-[11px] text-text-muted truncate">
                  {booking.receiver_email}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Parcel & Payment Snapshot */}
        <Card>
          <CardHeader className="py-3 bg-surface-subtle">
            <CardTitle className="text-xs uppercase tracking-wider text-text-muted flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-emerald-600" /> Parcel & Charges
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-text-muted">Category:</span>
              <span className="font-medium text-text-primary">{parcel?.parcel_type || "Standard"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Weight:</span>
              <span className="font-mono font-bold text-text-primary">
                {weightGrams > 0 ? formatGramsToKg(weightGrams) : "—"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Dimensions:</span>
              <span className="font-mono text-text-secondary">
                {lengthCm && widthCm && heightCm ? `${lengthCm} × ${widthCm} × ${heightCm} cm` : "—"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Payment Type:</span>
              <span className="font-semibold text-text-primary">{booking.payment_type || "PREPAID"}</span>
            </div>
            {booking.payment_type === "COD" && (
              <div className="flex justify-between text-amber-700 font-semibold">
                <span>COD Amount:</span>
                <span className="font-mono">{formatPaiseToRupees(booking.cod_amount)}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-border-default font-bold text-text-primary">
              <span>Shipping Charge:</span>
              <span className="font-mono text-brand-primary">
                {booking.charges ? formatPaiseToRupees(booking.charges.total) : "Pending Review"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Shipment & Live Tracking Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="space-y-0.5">
            <CardTitle className="text-base">Shipment & Delivery Timeline</CardTitle>
            <p className="text-xs text-text-muted">
              Handled via {booking.shipment?.courier_partner?.name || "SS Courier Fleet"} • AWB:{" "}
              <span className="font-mono font-semibold text-text-primary">
                {booking.shipment?.awb || "Pending Assignment"}
              </span>
            </p>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {booking.shipment?.tracking_events && booking.shipment.tracking_events.length > 0 ? (
            <ShipmentTimeline
              currentStatus={booking.shipment.status || booking.status}
              events={booking.shipment.tracking_events}
            />
          ) : (
            <div className="py-8 text-center text-xs text-text-muted">
              <Clock className="w-8 h-8 mx-auto mb-2 text-text-muted/60" />
              <p className="font-semibold text-text-primary">Consignment Under Review</p>
              <p className="mt-0.5">
                Our operations team is currently reviewing your booking. Transit milestones will appear here as soon as an AWB is generated.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Label Modal */}
      <ReceiptLabelModal
        isOpen={isLabelModalOpen}
        onClose={() => setIsLabelModalOpen(false)}
        booking={booking}
      />
    </div>
  );
}
