"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/Card";
import { MOCK_COURIER_PARTNERS } from "@/lib/mockData";
import {
  ArrowLeft,
  UserPlus,
  User,
  MapPin,
  Package,
  CreditCard,
  Truck,
  CheckCircle2,
} from "lucide-react";

export default function AdminNewBookingPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      alert("Direct staff booking created and dispatched!");
      router.push("/admin/bookings");
    }, 600);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between border-b border-border-default pb-4">
        <div className="space-y-1">
          <Link
            href="/admin/bookings"
            className="text-xs text-text-secondary hover:text-brand-primary flex items-center gap-1 font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Bookings
          </Link>
          <h1 className="text-xl font-bold text-text-primary">
            Create Direct Booking (Staff Intake §12)
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Select / Quick Entry */}
        <Card className="p-4 space-y-3">
          <div className="font-bold text-xs uppercase tracking-wider text-brand-primary flex items-center gap-1.5">
            <UserPlus className="w-4 h-4" /> Customer Association
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="Customer Name" defaultValue="Rahul Sharma" required />
            <Input label="Customer Mobile" defaultValue="9876543210" required />
          </div>
        </Card>

        {/* Sender & Receiver Split */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="p-4 space-y-3">
            <div className="font-bold text-xs uppercase tracking-wider text-text-muted flex items-center gap-1.5">
              <User className="w-4 h-4 text-brand-primary" /> Sender Details
            </div>
            <Input label="Sender Name" defaultValue="Rahul Sharma" required />
            <Input label="Sender Mobile" defaultValue="9876543210" required />
            <Input label="Pickup Address" defaultValue="Flat 402, Royal Palms, Tonk Road" required />
            <div className="grid grid-cols-2 gap-2">
              <Input label="City" defaultValue="Jaipur" required />
              <Input label="Pincode" defaultValue="302022" required />
            </div>
          </Card>

          <Card className="p-4 space-y-3">
            <div className="font-bold text-xs uppercase tracking-wider text-text-muted flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-brand-accent" /> Receiver Details
            </div>
            <Input label="Receiver Name" defaultValue="Anand Gupta" required />
            <Input label="Receiver Mobile" defaultValue="9812345678" required />
            <Input label="Delivery Address" defaultValue="Villa 12, Palm Meadows, Whitefield" required />
            <div className="grid grid-cols-2 gap-2">
              <Input label="City" defaultValue="Bengaluru" required />
              <Input label="Pincode" defaultValue="560066" required />
            </div>
          </Card>
        </div>

        {/* Parcel Metrics */}
        <Card className="p-4 space-y-3">
          <div className="font-bold text-xs uppercase tracking-wider text-text-muted flex items-center gap-1.5">
            <Package className="w-4 h-4 text-emerald-600" /> Parcel Details & Physical Weight
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input label="Weight (kg)" type="number" step="0.1" defaultValue="2.5" required />
            <Input label="Dimensions (L x W x H cm)" defaultValue="25 x 20 x 15" required />
            <Input label="Declared Value (₹)" type="number" defaultValue="3500" required />
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

            <Input label="Customer Shipping Charge (₹)" type="number" defaultValue="200" required />
            <Input label="COD Amount to Collect (₹, 0 if Prepaid)" type="number" defaultValue="0" />
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
