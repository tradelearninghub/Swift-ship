"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardFooter } from "@/components/ui/Card";
import {
  Package,
  User,
  MapPin,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

export default function BookParcelPage() {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [generatedBookingId, setGeneratedBookingId] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);

  // Form State — Starts clean and empty per user requirements
  const [formData, setFormData] = useState({
    // Sender
    sender_name: "",
    sender_mobile: "",
    sender_email: "",
    sender_address: "",
    sender_city: "",
    sender_state: "",
    sender_pincode: "",

    // Receiver
    receiver_name: "",
    receiver_mobile: "",
    receiver_email: "",
    receiver_address: "",
    receiver_city: "",
    receiver_state: "",
    receiver_pincode: "",

    // Parcel
    parcel_type: "Documents / Legal Files",
    description: "",
    weight_kg: "",
    length_cm: "",
    width_cm: "",
    height_cm: "",
    declared_value_rupees: "",

    // Payment
    payment_type: "PREPAID",
    cod_amount_rupees: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.sender_name.trim()) {
        newErrors.sender_name = "Sender name is required";
      } else if (formData.sender_name.trim().length < 2) {
        newErrors.sender_name = "Please enter a valid sender name (min 2 characters)";
      }

      const mobileClean = formData.sender_mobile.replace(/\D/g, "");
      if (!mobileClean) {
        newErrors.sender_mobile = "Sender mobile number is required";
      } else if (!/^[6-9]\d{9}$/.test(mobileClean)) {
        newErrors.sender_mobile = "Enter a valid 10-digit Indian mobile number (starts with 6-9)";
      }

      if (formData.sender_email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.sender_email.trim())) {
        newErrors.sender_email = "Please enter a valid email address";
      }

      if (!formData.sender_address.trim()) {
        newErrors.sender_address = "Pickup address is required";
      } else if (formData.sender_address.trim().length < 5) {
        newErrors.sender_address = "Please enter a complete street address (min 5 characters)";
      }

      if (!formData.sender_city.trim()) {
        newErrors.sender_city = "City is required";
      }

      if (!formData.sender_state.trim()) {
        newErrors.sender_state = "State is required";
      }

      const pinClean = formData.sender_pincode.replace(/\D/g, "");
      if (!pinClean) {
        newErrors.sender_pincode = "Pincode is required";
      } else if (!/^\d{6}$/.test(pinClean)) {
        newErrors.sender_pincode = "Enter a valid 6-digit Indian pincode";
      }
    }

    if (step === 2) {
      if (!formData.receiver_name.trim()) {
        newErrors.receiver_name = "Receiver name is required";
      } else if (formData.receiver_name.trim().length < 2) {
        newErrors.receiver_name = "Please enter a valid receiver name (min 2 characters)";
      }

      const mobileClean = formData.receiver_mobile.replace(/\D/g, "");
      if (!mobileClean) {
        newErrors.receiver_mobile = "Receiver mobile number is required";
      } else if (!/^[6-9]\d{9}$/.test(mobileClean)) {
        newErrors.receiver_mobile = "Enter a valid 10-digit Indian mobile number (starts with 6-9)";
      }

      if (formData.receiver_email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.receiver_email.trim())) {
        newErrors.receiver_email = "Please enter a valid email address";
      }

      if (!formData.receiver_address.trim()) {
        newErrors.receiver_address = "Delivery address is required";
      } else if (formData.receiver_address.trim().length < 5) {
        newErrors.receiver_address = "Please enter a complete delivery address (min 5 characters)";
      }

      if (!formData.receiver_city.trim()) {
        newErrors.receiver_city = "City is required";
      }

      if (!formData.receiver_state.trim()) {
        newErrors.receiver_state = "State is required";
      }

      const pinClean = formData.receiver_pincode.replace(/\D/g, "");
      if (!pinClean) {
        newErrors.receiver_pincode = "Pincode is required";
      } else if (!/^\d{6}$/.test(pinClean)) {
        newErrors.receiver_pincode = "Enter a valid 6-digit Indian pincode";
      }
    }

    if (step === 3) {
      if (!formData.description.trim()) {
        newErrors.description = "Package description is required";
      } else if (formData.description.trim().length < 3) {
        newErrors.description = "Please enter a brief description (min 3 characters)";
      }

      const wt = parseFloat(formData.weight_kg);
      if (!formData.weight_kg || isNaN(wt) || wt <= 0) {
        newErrors.weight_kg = "Enter a valid parcel weight in kg (e.g. 0.5)";
      }

      const val = parseFloat(formData.declared_value_rupees);
      if (!formData.declared_value_rupees || isNaN(val) || val < 100) {
        newErrors.declared_value_rupees = "Declared value must be at least ₹100";
      }

      const l = parseFloat(formData.length_cm);
      if (!formData.length_cm || isNaN(l) || l <= 0) {
        newErrors.length_cm = "Enter length in cm";
      }

      const w = parseFloat(formData.width_cm);
      if (!formData.width_cm || isNaN(w) || w <= 0) {
        newErrors.width_cm = "Enter width in cm";
      }

      const h = parseFloat(formData.height_cm);
      if (!formData.height_cm || isNaN(h) || h <= 0) {
        newErrors.height_cm = "Enter height in cm";
      }
    }

    if (step === 4) {
      if (formData.payment_type === "COD") {
        const cod = parseFloat(formData.cod_amount_rupees);
        if (!formData.cod_amount_rupees || isNaN(cod) || cod < 50) {
          newErrors.cod_amount_rupees = "Enter valid COD amount (minimum ₹50)";
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(4)) return;

    setIsSubmitting(true);
    setApiError(null);

    try {
      const payload = {
        sender_name: formData.sender_name.trim(),
        sender_mobile: formData.sender_mobile.trim(),
        sender_email: formData.sender_email.trim() || undefined,
        sender_address: formData.sender_address.trim(),
        sender_city: formData.sender_city.trim(),
        sender_state: formData.sender_state.trim(),
        sender_pincode: formData.sender_pincode.trim(),
        receiver_name: formData.receiver_name.trim(),
        receiver_mobile: formData.receiver_mobile.trim(),
        receiver_email: formData.receiver_email.trim() || undefined,
        receiver_address: formData.receiver_address.trim(),
        receiver_city: formData.receiver_city.trim(),
        receiver_state: formData.receiver_state.trim(),
        receiver_pincode: formData.receiver_pincode.trim(),
        parcel_type: formData.parcel_type || "Standard Parcel",
        description: formData.description.trim(),
        submitted_weight_grams: Math.round(parseFloat(formData.weight_kg) * 1000),
        submitted_length_cm: Math.round(parseFloat(formData.length_cm)),
        submitted_width_cm: Math.round(parseFloat(formData.width_cm)),
        submitted_height_cm: Math.round(parseFloat(formData.height_cm)),
        declared_value_paise: Math.round(parseFloat(formData.declared_value_rupees) * 100),
        payment_type: formData.payment_type as "PREPAID" | "COD",
        cod_amount_paise:
          formData.payment_type === "COD"
            ? Math.round(parseFloat(formData.cod_amount_rupees || "0") * 100)
            : 0,
      };

      const res = await fetch("/api/bookings/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit booking. Please check your details.");
      }

      setGeneratedBookingId(data.booking.booking_number);
      setIsSuccess(true);
    } catch (err: any) {
      setApiError(err.message || "An unexpected error occurred while placing your booking.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6 animate-in fade-in-50">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Booking Request Created
          </span>
          <h1 className="text-3xl font-extrabold text-text-primary">
            Booking #{generatedBookingId}
          </h1>
          <p className="text-sm text-text-secondary max-w-md mx-auto">
            Your parcel booking request has been submitted successfully and is queued for staff review.
          </p>
        </div>

        {/* Pricing notice card per §10 */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-900 text-left space-y-1">
          <div className="font-bold flex items-center gap-1.5 text-brand-primary">
            <AlertCircle className="w-4 h-4" /> Next Steps:
          </div>
          <p>
            1. Our staff will verify package dimensions and confirm the final shipping charge.
          </p>
          <p>
            2. You will receive an SMS/WhatsApp notification once approved with courier pickup details.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-4 pt-4">
          <Link href={`/track?booking_id=${generatedBookingId}`}>
            <Button variant="primary" size="md">
              Track This Booking
            </Button>
          </Link>
          <Button
            variant="outline"
            size="md"
            onClick={() => {
              setIsSuccess(false);
              setCurrentStep(1);
              setErrors({});
            }}
          >
            Book Another Parcel
          </Button>
          <Link href="/customer">
            <Button variant="ghost" size="md">
              Go to Customer Portal
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-brand-primary bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
          Parcel Dispatch Request
        </span>
        <h1 className="text-h1">Book a Parcel Shipment</h1>
        <p className="text-body text-sm">
          Fill in the sender, recipient, and parcel details. Rates are confirmed upon review.
        </p>
      </div>

      {/* Stepper Header */}
      <div className="grid grid-cols-4 gap-2 text-center text-xs font-semibold">
        {[
          { step: 1, label: "Sender" },
          { step: 2, label: "Receiver" },
          { step: 3, label: "Parcel" },
          { step: 4, label: "Payment & Review" },
        ].map((s) => (
          <div
            key={s.step}
            className={`py-2 px-1 rounded-lg border transition-all ${
              currentStep === s.step
                ? "bg-brand-primary text-white border-brand-primary shadow-sm font-bold"
                : currentStep > s.step
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-surface-subtle text-text-muted border-border-default"
            }`}
          >
            <span className="hidden sm:inline">Step {s.step}: </span>
            {s.label}
          </div>
        ))}
      </div>

      {/* Main Wizard Form */}
      <Card className="shadow-md">
        <form onSubmit={handleSubmit} noValidate>
          {/* STEP 1: SENDER DETAILS */}
          {currentStep === 1 && (
            <div className="p-6 sm:p-8 space-y-6">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-brand-primary" />
                <h3 className="text-lg font-bold text-text-primary">Sender Information</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Sender Full Name"
                  name="sender_name"
                  value={formData.sender_name}
                  onChange={handleChange}
                  placeholder="e.g. Full Name"
                  error={errors.sender_name}
                  required
                />
                <Input
                  label="Sender Mobile Number"
                  name="sender_mobile"
                  type="tel"
                  maxLength={10}
                  value={formData.sender_mobile}
                  onChange={handleChange}
                  placeholder="10-digit mobile number"
                  helperText="10-digit Indian mobile number"
                  error={errors.sender_mobile}
                  required
                />
                <div className="sm:col-span-2">
                  <Input
                    label="Sender Email (Optional)"
                    name="sender_email"
                    type="email"
                    value={formData.sender_email}
                    onChange={handleChange}
                    placeholder="email@example.com"
                    error={errors.sender_email}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Input
                    label="Pickup Full Address"
                    name="sender_address"
                    value={formData.sender_address}
                    onChange={handleChange}
                    placeholder="Complete pickup street address / flat / building"
                    error={errors.sender_address}
                    required
                  />
                </div>
                <Input
                  label="City"
                  name="sender_city"
                  value={formData.sender_city}
                  onChange={handleChange}
                  placeholder="City"
                  error={errors.sender_city}
                  required
                />
                <Input
                  label="State"
                  name="sender_state"
                  value={formData.sender_state}
                  onChange={handleChange}
                  placeholder="State"
                  error={errors.sender_state}
                  required
                />
                <Input
                  label="Pincode"
                  name="sender_pincode"
                  maxLength={6}
                  value={formData.sender_pincode}
                  onChange={handleChange}
                  placeholder="6-digit pincode"
                  error={errors.sender_pincode}
                  required
                />
              </div>
            </div>
          )}

          {/* STEP 2: RECEIVER DETAILS */}
          {currentStep === 2 && (
            <div className="p-6 sm:p-8 space-y-6">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-brand-accent" />
                <h3 className="text-lg font-bold text-text-primary">Receiver / Destination Information</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Receiver Full Name"
                  name="receiver_name"
                  value={formData.receiver_name}
                  onChange={handleChange}
                  placeholder="Recipient full name"
                  error={errors.receiver_name}
                  required
                />
                <Input
                  label="Receiver Mobile Number"
                  name="receiver_mobile"
                  type="tel"
                  maxLength={10}
                  value={formData.receiver_mobile}
                  onChange={handleChange}
                  placeholder="10-digit recipient mobile"
                  helperText="Recipient will receive delivery OTP and alerts"
                  error={errors.receiver_mobile}
                  required
                />
                <div className="sm:col-span-2">
                  <Input
                    label="Receiver Email (Optional)"
                    name="receiver_email"
                    type="email"
                    value={formData.receiver_email}
                    onChange={handleChange}
                    placeholder="recipient@example.com"
                    error={errors.receiver_email}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Input
                    label="Delivery Street Address"
                    name="receiver_address"
                    value={formData.receiver_address}
                    onChange={handleChange}
                    placeholder="Complete delivery address"
                    error={errors.receiver_address}
                    required
                  />
                </div>
                <Input
                  label="City"
                  name="receiver_city"
                  value={formData.receiver_city}
                  onChange={handleChange}
                  placeholder="City"
                  error={errors.receiver_city}
                  required
                />
                <Input
                  label="State"
                  name="receiver_state"
                  value={formData.receiver_state}
                  onChange={handleChange}
                  placeholder="State"
                  error={errors.receiver_state}
                  required
                />
                <Input
                  label="Pincode"
                  name="receiver_pincode"
                  maxLength={6}
                  value={formData.receiver_pincode}
                  onChange={handleChange}
                  placeholder="6-digit pincode"
                  error={errors.receiver_pincode}
                  required
                />
              </div>
            </div>
          )}

          {/* STEP 3: PARCEL DETAILS */}
          {currentStep === 3 && (
            <div className="p-6 sm:p-8 space-y-6">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-brand-primary" />
                <h3 className="text-lg font-bold text-text-primary">Parcel & Dimension Details</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="block text-sm font-medium text-text-primary">
                    Parcel Category <span className="text-status-danger">*</span>
                  </label>
                  <select
                    name="parcel_type"
                    value={formData.parcel_type}
                    onChange={handleChange}
                    className="w-full h-10 px-3 py-2 text-sm bg-surface-base border border-border-default rounded-lg focus:ring-1 focus:ring-brand-primary"
                  >
                    <option value="Documents / Legal Files">Documents / Legal Files</option>
                    <option value="Electronics / Accessories">Electronics / Accessories</option>
                    <option value="Apparel / Textiles">Apparel / Textiles</option>
                    <option value="Books & Stationeries">Books & Stationeries</option>
                    <option value="Jewellery Samples / Imitation">Jewellery Samples / Imitation</option>
                    <option value="General Merchandise">General Merchandise</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <Input
                    label="Package Description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Brief description of items inside"
                    error={errors.description}
                    required
                  />
                </div>

                <Input
                  label="Estimated Weight (kg)"
                  name="weight_kg"
                  type="number"
                  step="0.05"
                  min="0.05"
                  value={formData.weight_kg}
                  onChange={handleChange}
                  placeholder="e.g. 1.5"
                  helperText="Weight will be verified during branch intake"
                  error={errors.weight_kg}
                  required
                />

                <Input
                  label="Declared Value (₹)"
                  name="declared_value_rupees"
                  type="number"
                  min="100"
                  value={formData.declared_value_rupees}
                  onChange={handleChange}
                  placeholder="e.g. 2000"
                  helperText="Required for transit insurance and valuation"
                  error={errors.declared_value_rupees}
                  required
                />

                <div className="sm:col-span-2 space-y-2 pt-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-muted">
                    Dimensions (Length x Width x Height in CM) <span className="text-status-danger">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <Input
                      label="Length (cm)"
                      name="length_cm"
                      type="number"
                      value={formData.length_cm}
                      onChange={handleChange}
                      placeholder="L cm"
                      error={errors.length_cm}
                      required
                    />
                    <Input
                      label="Width (cm)"
                      name="width_cm"
                      type="number"
                      value={formData.width_cm}
                      onChange={handleChange}
                      placeholder="W cm"
                      error={errors.width_cm}
                      required
                    />
                    <Input
                      label="Height (cm)"
                      name="height_cm"
                      type="number"
                      value={formData.height_cm}
                      onChange={handleChange}
                      placeholder="H cm"
                      error={errors.height_cm}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: PAYMENT TYPE & REVIEW */}
          {currentStep === 4 && (
            <div className="p-6 sm:p-8 space-y-6">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                <h3 className="text-lg font-bold text-text-primary">Payment Type & Summary</h3>
              </div>

              {/* Payment Type Choice */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-text-primary">
                  Select Payment Type:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label
                    className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      formData.payment_type === "PREPAID"
                        ? "border-brand-primary bg-blue-50/50"
                        : "border-border-default hover:bg-surface-subtle"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment_type"
                      value="PREPAID"
                      checked={formData.payment_type === "PREPAID"}
                      onChange={handleChange}
                      className="mt-1 text-brand-primary focus:ring-brand-primary"
                    />
                    <div>
                      <div className="font-bold text-sm text-text-primary">Prepaid Shipment</div>
                      <div className="text-xs text-text-secondary mt-0.5">
                        Shipper pays shipping charges directly. No cash collection from receiver.
                      </div>
                    </div>
                  </label>

                  <label
                    className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      formData.payment_type === "COD"
                        ? "border-brand-primary bg-blue-50/50"
                        : "border-border-default hover:bg-surface-subtle"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment_type"
                      value="COD"
                      checked={formData.payment_type === "COD"}
                      onChange={handleChange}
                      className="mt-1 text-brand-primary focus:ring-brand-primary"
                    />
                    <div>
                      <div className="font-bold text-sm text-text-primary">Cash on Delivery (COD)</div>
                      <div className="text-xs text-text-secondary mt-0.5">
                        Receiver pays the product value to courier at the time of delivery.
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* COD Amount Input if COD selected */}
              {formData.payment_type === "COD" && (
                <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-xl space-y-2">
                  <Input
                    label="COD Amount to Collect from Receiver (₹)"
                    name="cod_amount_rupees"
                    type="number"
                    min="50"
                    value={formData.cod_amount_rupees}
                    onChange={handleChange}
                    placeholder="e.g. 1500"
                    helperText="This amount will be collected in cash by courier and settled back to your account."
                    error={errors.cod_amount_rupees}
                    required
                  />
                </div>
              )}

              {/* Booking Summary Card */}
              <div className="bg-surface-subtle p-4 rounded-xl border border-border-default space-y-3 text-xs">
                <div className="font-bold text-sm text-text-primary">
                  Summary Review
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-text-muted">Sender:</span>
                    <div className="font-semibold text-text-primary">
                      {formData.sender_name || "—"} ({formData.sender_city || "—"})
                    </div>
                  </div>
                  <div>
                    <span className="text-text-muted">Receiver:</span>
                    <div className="font-semibold text-text-primary">
                      {formData.receiver_name || "—"} ({formData.receiver_city || "—"})
                    </div>
                  </div>
                  <div>
                    <span className="text-text-muted">Parcel Weight / Size:</span>
                    <div className="font-semibold text-text-primary">
                      {formData.weight_kg ? `${formData.weight_kg} kg` : "—"} (
                      {formData.length_cm && formData.width_cm && formData.height_cm
                        ? `${formData.length_cm}x${formData.width_cm}x${formData.height_cm} cm`
                        : "—"}
                      )
                    </div>
                  </div>
                  <div>
                    <span className="text-text-muted">Payment Mode:</span>
                    <div className="font-semibold text-text-primary">
                      {formData.payment_type === "COD"
                        ? `COD (₹${formData.cod_amount_rupees || 0})`
                        : "Prepaid"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Policy Banner per §10 */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-brand-primary shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-brand-primary">Shipping Charge Notice:</div>
                  <p className="mt-0.5">
                    Shipping charge will be confirmed after admin review and verified physical measurement.
                  </p>
                </div>
              </div>

              {/* API Error Alert */}
              {apiError && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-rose-900">Submission Error</div>
                    <p className="mt-0.5">{apiError}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Navigation Controls */}
          <CardFooter className="flex justify-between py-4">
            {currentStep > 1 ? (
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => {
                  setErrors({});
                  setCurrentStep((prev) => prev - 1);
                }}
              >
                <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
              </Button>
            ) : (
              <div />
            )}

            {currentStep < 4 ? (
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={handleNextStep}
              >
                Next Step <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            ) : (
              <Button
                type="submit"
                variant="accent"
                size="lg"
                isLoading={isSubmitting}
                className="shadow-md"
              >
                Submit Booking Request
              </Button>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
