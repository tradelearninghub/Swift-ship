"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { MOCK_COURIER_PARTNERS } from "@/lib/mockData";
import {
  Package,
  User,
  MapPin,
  Truck,
  CheckCircle2,
  ArrowLeft,
  UserPlus,
} from "lucide-react";

export default function AdminNewBookingPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdBookingId, setCreatedBookingId] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setCreatedBookingId(`BK-${Math.floor(1000 + Math.random() * 9000)}`);
      setIsSuccess(true);
    }, 600);
  };

  if (isSuccess) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-text-primary">
          Booking #{createdBookingId} Created
        </h2>
        <p className="text-xs text-text-secondary">
          Direct staff booking confirmed. The shipment is created and queued for courier pickup.
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <Link href="/admin/bookings">
            <Button variant="outline" size="sm">
              All Bookings
            </Button>
          </Link>
          <Button variant="primary" size="sm" onClick={() => setIsSuccess(false)}>
            Create Another
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Create Direct Booking</h1>
          <p className="text-xs text-text-secondary">
            Manual counter / staff intake with instant courier assignment and rate setting
          </p>
        </div>
        <Link href="/admin/bookings">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Bookings
          </Button>
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Select / Quick Entry */}
        <Card className="p-4 space-y-3">
          <div className="font-bold text-xs uppercase tracking-wider text-brand-primary flex items-center gap-1.5">
            <UserPlus className="w-4 h-4" /> Customer Association
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="Customer Name" placeholder="Customer full name" required />
            <Input label="Customer Mobile" type="tel" maxLength={10} placeholder="10-digit mobile number" required />
          </div>
        </Card>

        {/* Sender & Receiver Split */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="p-4 space-y-3">
            <div className="font-bold text-xs uppercase tracking-wider text-text-muted flex items-center gap-1.5">
              <User className="w-4 h-4 text-brand-primary" /> Sender Details
            </div>
            <Input label="Sender Name" placeholder="Sender full name" required />
            <Input label="Sender Mobile" type="tel" maxLength={10} placeholder="10-digit mobile number" required />
            <Input label="Pickup Address" placeholder="Address line" required />
            <div className="grid grid-cols-2 gap-2">
              <Input label="City" placeholder="City" required />
              <Input label="Pincode" placeholder="6-digit pincode" maxLength={6} required />
            </div>
          </Card>

          <Card className="p-4 space-y-3">
            <div className="font-bold text-xs uppercase tracking-wider text-text-muted flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-brand-accent" /> Receiver Details
            </div>
            <Input label="Receiver Name" placeholder="Receiver full name" required />
            <Input label="Receiver Mobile" type="tel" maxLength={10} placeholder="10-digit mobile number" required />
            <Input label="Delivery Address" placeholder="Address line" required />
            <div className="grid grid-cols-2 gap-2">
              <Input label="City" placeholder="City" required />
              <Input label="Pincode" placeholder="6-digit pincode" maxLength={6} required />
            </div>
          </Card>
        </div>

        {/* Parcel Metrics */}
        <Card className="p-4 space-y-3">
          <div className="font-bold text-xs uppercase tracking-wider text-text-muted flex items-center gap-1.5">
            <Package className="w-4 h-4 text-emerald-600" /> Parcel Details & Physical Weight
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input label="Weight (kg)" type="number" step="0.1" placeholder="e.g. 2.5" required />
            <Input label="Dimensions (L x W x H cm)" placeholder="e.g. 25 x 20 x 15" required />
            <Input label="Declared Value (₹)" type="number" placeholder="Declared item value" required />
          </div>
        </Card>

        {/* Courier & Charges Direct Configuration */}
        <Card className="p-4 space-y-3">
          <div className="font-bold text-xs uppercase tracking-wider text-text-muted flex items-center gap-1.5">
            <Truck className="w-4 h-4 text-brand-primary" /> Immediate Rate & Courier Allocation
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-text-primary mb-1.5">
                Courier Partner
              </label>
              <select className="w-full h-10 px-3 text-xs bg-surface-base border border-border-default rounded-lg">
                {MOCK_COURIER_PARTNERS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <Input label="Customer Shipping Charge (₹)" type="number" placeholder="₹ charge" required />
            <Input label="COD Amount to Collect (₹, 0 if Prepaid)" type="number" placeholder="0 if prepaid" />
          </div>
        </Card>

        <div className="flex justify-end gap-3">
          <Link href="/admin/bookings">
            <Button variant="outline" size="md">
              Cancel
            </Button>
          </Link>
          <Button type="submit" variant="primary" size="md" isLoading={isSubmitting}>
            <CheckCircle2 className="w-4 h-4 mr-1.5" /> Create & Generate Dispatch AWB
          </Button>
        </div>
      </form>
    </div>
  );
}
