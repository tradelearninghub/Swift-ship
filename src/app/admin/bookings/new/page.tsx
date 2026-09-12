"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import {
  Package,
  User,
  MapPin,
  Truck,
  CheckCircle2,
  ArrowLeft,
  UserPlus,
  AlertCircle,
} from "lucide-react";

interface CourierOption {
  id: string;
  name: string;
  code: string;
}

export default function AdminNewBookingPage() {
  const router = useRouter();
  const [couriers, setCouriers] = useState<CourierOption[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdBookingId, setCreatedBookingId] = useState("");
  const [createdAwb, setCreatedAwb] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    customer_name: "",
    customer_mobile: "",
    sender_name: "",
    sender_mobile: "",
    sender_address: "",
    sender_city: "Jaipur",
    sender_state: "Rajasthan",
    sender_pincode: "302003",
    receiver_name: "",
    receiver_mobile: "",
    receiver_address: "",
    receiver_city: "",
    receiver_state: "",
    receiver_pincode: "",
    description: "General Cargo / Documents",
    weight_kg: "1.0",
    length_cm: "20",
    width_cm: "15",
    height_cm: "10",
    declared_value_rupees: "500",
    courier_partner_id: "",
    shipping_charge_rupees: "150",
    cod_amount_rupees: "0",
  });

  useEffect(() => {
    async function loadCouriers() {
      try {
        const res = await fetch("/api/admin/couriers");
        if (res.ok) {
          const data = await res.json();
          if (data.couriers && data.couriers.length > 0) {
            setCouriers(data.couriers);
            setFormData((prev) => ({
              ...prev,
              courier_partner_id: data.couriers[0].id,
            }));
          }
        }
      } catch (e) {
        console.error("Failed to load couriers", e);
      }
    }
    loadCouriers();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      // Auto-fill sender if customer changes and sender is blank
      if (name === "customer_name" && !prev.sender_name) {
        next.sender_name = value;
      }
      if (name === "customer_mobile" && !prev.sender_mobile) {
        next.sender_mobile = value;
      }
      return next;
    });
    if (errorMsg) setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      // 1. Create real booking via POST /api/bookings/create
      const codPaise = Math.round(parseFloat(formData.cod_amount_rupees || "0") * 100);
      const isCod = codPaise > 0;

      const createPayload = {
        sender_name: (formData.sender_name || formData.customer_name).trim(),
        sender_mobile: (formData.sender_mobile || formData.customer_mobile).trim(),
        sender_email: "",
        sender_address: formData.sender_address.trim(),
        sender_city: formData.sender_city.trim(),
        sender_state: formData.sender_state.trim(),
        sender_pincode: formData.sender_pincode.trim(),
        receiver_name: formData.receiver_name.trim(),
        receiver_mobile: formData.receiver_mobile.trim(),
        receiver_email: "",
        receiver_address: formData.receiver_address.trim(),
        receiver_city: formData.receiver_city.trim(),
        receiver_state: formData.receiver_state.trim(),
        receiver_pincode: formData.receiver_pincode.trim(),
        parcel_type: "Standard Parcel",
        description: formData.description.trim(),
        submitted_weight_grams: Math.round(parseFloat(formData.weight_kg || "1") * 1000),
        submitted_length_cm: Math.round(parseFloat(formData.length_cm || "20")),
        submitted_width_cm: Math.round(parseFloat(formData.width_cm || "15")),
        submitted_height_cm: Math.round(parseFloat(formData.height_cm || "10")),
        declared_value_paise: Math.round(parseFloat(formData.declared_value_rupees || "500") * 100),
        payment_type: isCod ? "COD" : "PREPAID",
        cod_amount_paise: codPaise,
      };

      const createRes = await fetch("/api/bookings/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createPayload),
      });

      const createData = await createRes.json();
      if (!createRes.ok) {
        throw new Error(createData.error || "Failed to create staff booking record");
      }

      const newBooking = createData.booking;
      setCreatedBookingId(newBooking.booking_number);

      // 2. Immediately approve and allocate courier if partner is selected
      if (formData.courier_partner_id) {
        const shippingPaise = Math.round(parseFloat(formData.shipping_charge_rupees || "0") * 100);
        const reviewPayload = {
          action: "APPROVE",
          verified_weight_grams: Math.round(parseFloat(formData.weight_kg || "1") * 1000),
          verified_length_cm: Math.round(parseFloat(formData.length_cm || "20")),
          verified_width_cm: Math.round(parseFloat(formData.width_cm || "15")),
          verified_height_cm: Math.round(parseFloat(formData.height_cm || "10")),
          shipping_charge_paise: shippingPaise,
          additional_charge_paise: 0,
          discount_paise: 0,
          tax_paise: Math.round(shippingPaise * 0.18),
          courier_partner_id: formData.courier_partner_id,
        };

        const reviewRes = await fetch(`/api/admin/bookings/${newBooking.id}/review`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(reviewPayload),
        });

        if (reviewRes.ok) {
          const reviewData = await reviewRes.json();
          if (reviewData.result?.shipment?.awb) {
            setCreatedAwb(reviewData.result.shipment.awb);
          }
        }
      }

      setIsSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to create booking");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-text-primary">
          Booking #{createdBookingId} Created Successfully
        </h2>
        {createdAwb && (
          <div className="text-xs font-mono font-bold bg-slate-100 text-brand-primary py-1.5 px-3 rounded-md inline-block">
            AWB: {createdAwb}
          </div>
        )}
        <p className="text-xs text-text-secondary">
          Direct staff intake registered in the database. The consignment is queued for dispatch.
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <Link href="/admin/bookings">
            <Button variant="outline" size="sm">
              All Bookings
            </Button>
          </Link>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setIsSuccess(false);
              setCreatedBookingId("");
              setCreatedAwb(null);
            }}
          >
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

      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Select / Quick Entry */}
        <Card className="p-4 space-y-3">
          <div className="font-bold text-xs uppercase tracking-wider text-brand-primary flex items-center gap-1.5">
            <UserPlus className="w-4 h-4" /> Customer Association
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              name="customer_name"
              label="Customer Name"
              placeholder="Customer full name"
              value={formData.customer_name}
              onChange={handleChange}
              required
            />
            <Input
              name="customer_mobile"
              label="Customer Mobile"
              type="tel"
              maxLength={10}
              placeholder="10-digit mobile number"
              value={formData.customer_mobile}
              onChange={handleChange}
              required
            />
          </div>
        </Card>

        {/* Sender & Receiver Split */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="p-4 space-y-3">
            <div className="font-bold text-xs uppercase tracking-wider text-text-muted flex items-center gap-1.5">
              <User className="w-4 h-4 text-brand-primary" /> Sender Details
            </div>
            <Input
              name="sender_name"
              label="Sender Name"
              placeholder="Sender full name"
              value={formData.sender_name}
              onChange={handleChange}
              required
            />
            <Input
              name="sender_mobile"
              label="Sender Mobile"
              type="tel"
              maxLength={10}
              placeholder="10-digit mobile number"
              value={formData.sender_mobile}
              onChange={handleChange}
              required
            />
            <Input
              name="sender_address"
              label="Pickup Address"
              placeholder="Address line"
              value={formData.sender_address}
              onChange={handleChange}
              required
            />
            <div className="grid grid-cols-3 gap-2">
              <Input
                name="sender_city"
                label="City"
                placeholder="City"
                value={formData.sender_city}
                onChange={handleChange}
                required
              />
              <Input
                name="sender_state"
                label="State"
                placeholder="State"
                value={formData.sender_state}
                onChange={handleChange}
                required
              />
              <Input
                name="sender_pincode"
                label="Pincode"
                placeholder="6-digit pincode"
                maxLength={6}
                value={formData.sender_pincode}
                onChange={handleChange}
                required
              />
            </div>
          </Card>

          <Card className="p-4 space-y-3">
            <div className="font-bold text-xs uppercase tracking-wider text-text-muted flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-brand-accent" /> Receiver Details
            </div>
            <Input
              name="receiver_name"
              label="Receiver Name"
              placeholder="Receiver full name"
              value={formData.receiver_name}
              onChange={handleChange}
              required
            />
            <Input
              name="receiver_mobile"
              label="Receiver Mobile"
              type="tel"
              maxLength={10}
              placeholder="10-digit mobile number"
              value={formData.receiver_mobile}
              onChange={handleChange}
              required
            />
            <Input
              name="receiver_address"
              label="Delivery Address"
              placeholder="Address line"
              value={formData.receiver_address}
              onChange={handleChange}
              required
            />
            <div className="grid grid-cols-3 gap-2">
              <Input
                name="receiver_city"
                label="City"
                placeholder="City"
                value={formData.receiver_city}
                onChange={handleChange}
                required
              />
              <Input
                name="receiver_state"
                label="State"
                placeholder="State"
                value={formData.receiver_state}
                onChange={handleChange}
                required
              />
              <Input
                name="receiver_pincode"
                label="Pincode"
                placeholder="6-digit pincode"
                maxLength={6}
                value={formData.receiver_pincode}
                onChange={handleChange}
                required
              />
            </div>
          </Card>
        </div>

        {/* Parcel Metrics */}
        <Card className="p-4 space-y-3">
          <div className="font-bold text-xs uppercase tracking-wider text-text-muted flex items-center gap-1.5">
            <Package className="w-4 h-4 text-emerald-600" /> Parcel Details & Physical Weight
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            <div className="sm:col-span-2">
              <Input
                name="description"
                label="Contents Description"
                placeholder="e.g. Garments, Electronics"
                value={formData.description}
                onChange={handleChange}
                required
              />
            </div>
            <Input
              name="weight_kg"
              label="Weight (kg)"
              type="number"
              step="0.1"
              placeholder="e.g. 2.5"
              value={formData.weight_kg}
              onChange={handleChange}
              required
            />
            <Input
              name="length_cm"
              label="Length (cm)"
              type="number"
              placeholder="cm"
              value={formData.length_cm}
              onChange={handleChange}
              required
            />
            <Input
              name="declared_value_rupees"
              label="Declared Value (₹)"
              type="number"
              placeholder="₹ value"
              value={formData.declared_value_rupees}
              onChange={handleChange}
              required
            />
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
              <select
                name="courier_partner_id"
                value={formData.courier_partner_id}
                onChange={handleChange}
                className="w-full h-10 px-3 text-xs bg-surface-base border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
              >
                {couriers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <Input
              name="shipping_charge_rupees"
              label="Customer Shipping Charge (₹)"
              type="number"
              placeholder="₹ charge"
              value={formData.shipping_charge_rupees}
              onChange={handleChange}
              required
            />
            <Input
              name="cod_amount_rupees"
              label="COD Amount to Collect (₹, 0 if Prepaid)"
              type="number"
              placeholder="0 if prepaid"
              value={formData.cod_amount_rupees}
              onChange={handleChange}
            />
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

