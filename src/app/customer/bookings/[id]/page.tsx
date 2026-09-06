"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { ShipmentTimeline } from "@/components/ui/ShipmentTimeline";
import { ReceiptLabelModal } from "@/components/ui/ReceiptLabelModal";
import { MOCK_BOOKINGS } from "@/lib/mockData";
import { formatPaiseToRupees, formatGramsToKg } from "@/lib/utils";
import {
  ArrowLeft,
  Printer,
  Package,
  MapPin,
  CreditCard,
  Truck,
  ShieldCheck,
  Calendar,
  User,
} from "lucide-react";

export default function CustomerBookingDetailPage() {
  const params = useParams();
  const bookingId = (params?.id as string) || "BK-1025";

  const [isLabelModalOpen, setIsLabelModalOpen] = useState(false);

  // Find booking in mock data or fallback to first
  const booking =
    MOCK_BOOKINGS.find(
      (b) =>
        b.booking_number.toUpperCase() === bookingId.toUpperCase() ||
        b.id === bookingId
    ) || MOCK_BOOKINGS[0];

  const parcel = booking.parcels[0];
  const weightGrams =
    parcel?.verified_weight_grams ?? parcel?.submitted_weight_grams ?? 0;
  const lengthCm =
    parcel?.verified_length_cm ?? parcel?.submitted_length_cm ?? 0;
  const widthCm = parcel?.verified_width_cm ?? parcel?.submitted_width_cm ?? 0;
  const heightCm =
    parcel?.verified_height_cm ?? parcel?.submitted_height_cm ?? 0;

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
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsLabelModalOpen(true)}
          >
            <Printer className="w-4 h-4 mr-1.5" /> Print Label / Receipt
          </Button>
          <Link href={`/track?q=${booking.booking_number}`}>
            <Button variant="primary" size="sm">
              <Truck className="w-4 h-4 mr-1.5" /> Live Tracking
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
          <CardContent className="p-4 space-y-2 text-xs">
            <div className="font-bold text-sm text-text-primary">{booking.sender_name}</div>
            <div className="text-text-secondary">{booking.sender_address}</div>
            <div className="font-semibold text-text-primary">
              {booking.sender_city}, {booking.sender_state} - {booking.sender_pincode}
            </div>
            <div className="font-mono text-text-muted">Ph: {booking.sender_mobile}</div>
          </CardContent>
        </Card>

        {/* Receiver Snapshot */}
        <Card>
          <CardHeader className="py-3 bg-surface-subtle">
            <CardTitle className="text-xs uppercase tracking-wider text-text-muted flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-brand-accent" /> Receiver (Delivery)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-2 text-xs">
            <div className="font-bold text-sm text-text-primary">{booking.receiver_name}</div>
            <div className="text-text-secondary">{booking.receiver_address}</div>
            <div className="font-semibold text-text-primary">
              {booking.receiver_city}, {booking.receiver_state} - {booking.receiver_pincode}
            </div>
            <div className="font-mono text-text-muted">Ph: {booking.receiver_mobile}</div>
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
              <span className="text-text-muted">Weight:</span>
              <span className="font-mono font-bold text-text-primary">
                {formatGramsToKg(weightGrams)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Dimensions:</span>
              <span className="font-mono text-text-secondary">
                {lengthCm} x {widthCm} x {heightCm} cm
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Payment Type:</span>
              <span className="font-semibold text-text-primary">{booking.payment_type}</span>
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
              Handled via {booking.shipment?.courier_name || "Courier Partner"} • AWB:{" "}
              <span className="font-mono font-semibold text-text-primary">
                {booking.shipment?.awb || "Pending Assignment"}
              </span>
            </p>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <ShipmentTimeline
            currentStatus={booking.shipment?.status || booking.status}
            events={booking.shipment?.tracking_events || []}
          />
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
