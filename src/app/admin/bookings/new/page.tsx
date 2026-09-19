"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { INDIAN_STATES_AND_UTS } from "@/lib/geo";
import {
  Package,
  User,
  MapPin,
  Truck,
  CheckCircle2,
  ArrowLeft,
  UserPlus,
  AlertCircle,
  Loader2,
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

  // Track if staff manually modified sender fields (§8)
  const [senderNameEdited, setSenderNameEdited] = useState(false);
  const [senderMobileEdited, setSenderMobileEdited] = useState(false);

  // Form State — Clean and empty per requirements (§7, §8, §10, §11)
  const [formData, setFormData] = useState({
    customer_name: "",
    customer_mobile: "",
    sender_name: "",
    sender_mobile: "",
    sender_address: "",
    sender_landmark: "",
    sender_city: "",
    sender_district: "",
    sender_state: "",
    sender_pincode: "",
    receiver_name: "",
    receiver_mobile: "",
    receiver_address: "",
    receiver_landmark: "",
    receiver_city: "",
    receiver_district: "",
    receiver_state: "",
    receiver_pincode: "",
    description: "",
    weight_kg: "",
    length_cm: "",
    width_cm: "",
    height_cm: "",
    declared_value_rupees: "",
    courier_partner_id: "",
    shipping_charge_rupees: "",
    cod_amount_rupees: "",
  });

  useEffect(() => {
    async function loadCouriers() {
      try {
        const res = await fetch("/api/admin/couriers");
        if (res.ok) {
          const data = await res.json();
          if (data.couriers && data.couriers.length > 0) {
            setCouriers(data.couriers);
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

      // Auto-fill sender from customer if staff hasn't manually altered sender (§8)
      if (name === "customer_name" && !senderNameEdited) {
        next.sender_name = value;
      }
      if (name === "customer_mobile" && !senderMobileEdited) {
        next.sender_mobile = value;
      }

      // If user directly edits sender fields, detach auto-sync
      if (name === "sender_name") {
        setSenderNameEdited(true);
      }
      if (name === "sender_mobile") {
        setSenderMobileEdited(true);
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
      if (!formData.sender_state) {
        throw new Error("Please select a Sender State / UT.");
      }
      if (!formData.receiver_state) {
        throw new Error("Please select a Receiver State / UT.");
      }

      const codPaise = Math.round(parseFloat(formData.cod_amount_rupees || "0") * 100);
      const isCod = codPaise > 0;

      const createPayload = {
        customer_name: formData.customer_name.trim(),
        customer_mobile: formData.customer_mobile.trim(),
        sender_name: (formData.sender_name || formData.customer_name).trim(),
        sender_mobile: (formData.sender_mobile || formData.customer_mobile).trim(),
        sender_email: "",
        sender_address: formData.sender_address.trim(),
        sender_landmark: formData.sender_landmark.trim() || undefined,
        sender_city: formData.sender_city.trim(),
        sender_district: formData.sender_district.trim() || undefined,
        sender_state: formData.sender_state.trim(),
        sender_pincode: formData.sender_pincode.trim(),

        receiver_name: formData.receiver_name.trim(),
        receiver_mobile: formData.receiver_mobile.trim(),
        receiver_email: "",
        receiver_address: formData.receiver_address.trim(),
        receiver_landmark: formData.receiver_landmark.trim() || undefined,
        receiver_city: formData.receiver_city.trim(),
        receiver_district: formData.receiver_district.trim() || undefined,
        receiver_state: formData.receiver_state.trim(),
        receiver_pincode: formData.receiver_pincode.trim(),

        parcel_type: "Standard Parcel",
        description: formData.description.trim(),
        submitted_weight_grams: Math.round(parseFloat(formData.weight_kg || "1") * 1000),
        submitted_length_cm: Math.round(parseFloat(formData.length_cm || "10")),
        submitted_width_cm: Math.round(parseFloat(formData.width_cm || "10")),
        submitted_height_cm: Math.round(parseFloat(formData.height_cm || "10")),
        declared_value_paise: Math.round(parseFloat(formData.declared_value_rupees || "100") * 100),
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
          verified_length_cm: Math.round(parseFloat(formData.length_cm || "10")),
          verified_width_cm: Math.round(parseFloat(formData.width_cm || "10")),
          verified_height_cm: Math.round(parseFloat(formData.height_cm || "10")),
          shipping_charge_paise: shippingPaise,
          additional_charge_paise: 0,
          discount_paise: 0,
          tax_paise: 0,
          courier_partner_id: formData.courier_partner_id,
        };

        const reviewRes = await fetch(`/api/admin/bookings/${newBooking.id}/review`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(reviewPayload),
        });

        if (reviewRes.ok) {
          const reviewData = await reviewRes.json();
          if (reviewData.shipment?.awb) {
            setCreatedAwb(reviewData.shipment.awb);
          }
        }
      }

      setIsSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to create booking.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="max-w-md mx-auto py-12 text-center space-y-4">
        <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-text-primary">Booking Created Successfully!</h2>
        <div className="font-mono text-lg font-black text-brand-primary bg-surface-subtle p-3 rounded-lg border border-border-default">
          Booking #{createdBookingId}
        </div>
        {createdAwb && (
          <div className="text-xs font-mono text-text-secondary">
            AWB: <strong>{createdAwb}</strong>
          </div>
        )}
        <p className="text-xs text-text-secondary">
          Direct staff intake registered and linked to customer profile. Consignment is ready for dispatch.
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
              setSenderNameEdited(false);
              setSenderMobileEdited(false);
              setFormData({
                customer_name: "",
                customer_mobile: "",
                sender_name: "",
                sender_mobile: "",
                sender_address: "",
                sender_landmark: "",
                sender_city: "",
                sender_district: "",
                sender_state: "",
                sender_pincode: "",
                receiver_name: "",
                receiver_mobile: "",
                receiver_address: "",
                receiver_landmark: "",
                receiver_city: "",
                receiver_district: "",
                receiver_state: "",
                receiver_pincode: "",
                description: "",
                weight_kg: "",
                length_cm: "",
                width_cm: "",
                height_cm: "",
                declared_value_rupees: "",
                courier_partner_id: "",
                shipping_charge_rupees: "",
                cod_amount_rupees: "",
              });
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
          <h1 className="text-xl font-bold text-text-primary">Create Direct Booking (Staff Intake)</h1>
          <p className="text-xs text-text-secondary">
            Manual counter intake with auto customer-to-sender synchronization and instant courier assignment
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
            <UserPlus className="w-4 h-4" /> Customer Association (§8, §9)
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
          <p className="text-[11px] text-text-muted">
            Entering customer name & mobile will automatically populate sender details below, while keeping sender fields fully editable.
          </p>
        </Card>

        {/* Sender & Receiver Split */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* SENDER CARD */}
          <Card className="p-4 space-y-3">
            <div className="font-bold text-xs uppercase tracking-wider text-text-muted flex items-center gap-1.5">
              <User className="w-4 h-4 text-brand-primary" /> Sender Details (Pickup)
            </div>
            <Input
              name="sender_name"
              label="Sender Name"
              placeholder="Sender name"
              value={formData.sender_name}
              onChange={handleChange}
              required
            />
            <Input
              name="sender_mobile"
              label="Sender Mobile"
              type="tel"
              maxLength={10}
              placeholder="10-digit mobile"
              value={formData.sender_mobile}
              onChange={handleChange}
              required
            />
            <Input
              name="sender_address"
              label="Pickup Address"
              placeholder="Street / Unit address"
              value={formData.sender_address}
              onChange={handleChange}
              required
            />
            <Input
              name="sender_landmark"
              label="Landmark (Optional)"
              placeholder="Nearby landmark"
              value={formData.sender_landmark}
              onChange={handleChange}
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                name="sender_city"
                label="City"
                placeholder="City"
                value={formData.sender_city}
                onChange={handleChange}
                required
              />
              <Input
                name="sender_district"
                label="District"
                placeholder="District"
                value={formData.sender_district}
                onChange={handleChange}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1">
                  State / UT
                </label>
                <select
                  name="sender_state"
                  value={formData.sender_state}
                  onChange={handleChange}
                  className="w-full h-9 px-2 text-xs bg-surface-subtle border border-border-default rounded-lg focus:border-brand-primary focus:outline-none"
                  required
                >
                  <option value="">Select State / UT</option>
                  {INDIAN_STATES_AND_UTS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
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

          {/* RECEIVER CARD */}
          <Card className="p-4 space-y-3">
            <div className="font-bold text-xs uppercase tracking-wider text-text-muted flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-brand-accent" /> Receiver Details (Consignee)
            </div>
            <Input
              name="receiver_name"
              label="Receiver Name"
              placeholder="Consignee full name"
              value={formData.receiver_name}
              onChange={handleChange}
              required
            />
            <Input
              name="receiver_mobile"
              label="Receiver Mobile"
              type="tel"
              maxLength={10}
              placeholder="10-digit mobile"
              value={formData.receiver_mobile}
              onChange={handleChange}
              required
            />
            <Input
              name="receiver_address"
              label="Delivery Address"
              placeholder="Full destination address"
              value={formData.receiver_address}
              onChange={handleChange}
              required
            />
            <Input
              name="receiver_landmark"
              label="Landmark (Optional)"
              placeholder="Nearby landmark"
              value={formData.receiver_landmark}
              onChange={handleChange}
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                name="receiver_city"
                label="City"
                placeholder="City"
                value={formData.receiver_city}
                onChange={handleChange}
                required
              />
              <Input
                name="receiver_district"
                label="District"
                placeholder="District"
                value={formData.receiver_district}
                onChange={handleChange}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1">
                  State / UT
                </label>
                <select
                  name="receiver_state"
                  value={formData.receiver_state}
                  onChange={handleChange}
                  className="w-full h-9 px-2 text-xs bg-surface-subtle border border-border-default rounded-lg focus:border-brand-primary focus:outline-none"
                  required
                >
                  <option value="">Select State / UT</option>
                  {INDIAN_STATES_AND_UTS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
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
            <Package className="w-4 h-4 text-emerald-600" /> Parcel Details & Physical Metrics
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            <div className="sm:col-span-2">
              <Input
                name="description"
                label="Contents Description"
                placeholder="e.g. Documents, Garments"
                value={formData.description}
                onChange={handleChange}
                required
              />
            </div>
            <Input
              name="weight_kg"
              label="Weight (kg)"
              type="number"
              step="0.05"
              placeholder="Weight"
              value={formData.weight_kg}
              onChange={handleChange}
              required
            />
            <Input
              name="length_cm"
              label="Length (cm)"
              type="number"
              placeholder="Length"
              value={formData.length_cm}
              onChange={handleChange}
              required
            />
            <Input
              name="declared_value_rupees"
              label="Declared Value (₹)"
              type="number"
              placeholder="Value"
              value={formData.declared_value_rupees}
              onChange={handleChange}
              required
            />
          </div>
        </Card>

        {/* Courier & Charges Direct Configuration */}
        <Card className="p-4 space-y-3">
          <div className="font-bold text-xs uppercase tracking-wider text-text-muted flex items-center gap-1.5">
            <Truck className="w-4 h-4 text-brand-primary" /> Courier Allocation & Counter Charge
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-text-primary mb-1">
                Assigned Courier Partner
              </label>
              <select
                name="courier_partner_id"
                value={formData.courier_partner_id}
                onChange={handleChange}
                className="w-full h-9 px-3 text-xs bg-surface-subtle border border-border-default rounded-lg focus:border-brand-primary focus:outline-none"
                required
              >
                <option value="">Select Courier Partner</option>
                {couriers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>
            <Input
              name="shipping_charge_rupees"
              label="Freight Charge (₹)"
              type="number"
              placeholder="Freight fee"
              value={formData.shipping_charge_rupees}
              onChange={handleChange}
              required
            />
            <Input
              name="cod_amount_rupees"
              label="COD Collectible Amount (₹)"
              type="number"
              placeholder="0 for Prepaid"
              value={formData.cod_amount_rupees}
              onChange={handleChange}
            />
          </div>
        </Card>

        {/* Live Booking Review Summary */}
        <Card className="p-4 bg-slate-50 border border-slate-200 space-y-3 text-xs">
          <div className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Verify Consignment Before Allocation
            </span>
            <span className="text-[11px] text-slate-500 font-normal">Check sender and receiver coordinates</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
              <span className="font-bold text-slate-800 text-[11px] block">Sender (Pickup):</span>
              <div className="font-semibold text-slate-900">{formData.sender_name || "—"} (+91 {formData.sender_mobile || "—"})</div>
              <div className="text-slate-600 leading-relaxed">{formData.sender_address || "—"}</div>
              {formData.sender_landmark && (
                <div className="text-[11px] text-slate-500"><span className="font-medium">Landmark:</span> {formData.sender_landmark}</div>
              )}
              <div className="text-slate-800 font-medium">
                {formData.sender_city}{formData.sender_district ? `, ${formData.sender_district}` : ""}, {formData.sender_state} - {formData.sender_pincode}
              </div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
              <span className="font-bold text-slate-800 text-[11px] block">Receiver (Delivery):</span>
              <div className="font-semibold text-slate-900">{formData.receiver_name || "—"} (+91 {formData.receiver_mobile || "—"})</div>
              <div className="text-slate-600 leading-relaxed">{formData.receiver_address || "—"}</div>
              {formData.receiver_landmark && (
                <div className="text-[11px] text-slate-500"><span className="font-medium">Landmark:</span> {formData.receiver_landmark}</div>
              )}
              <div className="text-slate-800 font-medium">
                {formData.receiver_city}{formData.receiver_district ? `, ${formData.receiver_district}` : ""}, {formData.receiver_state} - {formData.receiver_pincode}
              </div>
            </div>
          </div>
        </Card>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Link href="/admin/bookings">
            <Button variant="outline" size="sm" type="button">
              Cancel
            </Button>
          </Link>
          <Button variant="primary" size="sm" type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Registering Consignment…
              </>
            ) : (
              <>Create & Allocate Shipment</>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
