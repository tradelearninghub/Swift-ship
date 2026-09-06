"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/Card";
import {
  Package,
  User,
  MapPin,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Truck,
  ShieldAlert,
} from "lucide-react";

export default function BookParcelPage() {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [generatedBookingId, setGeneratedBookingId] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    // Sender
    sender_name: "Rahul Sharma",
    sender_mobile: "9876543210",
    sender_email: "rahul@example.com",
    sender_address: "Flat 402, Royal Palms, Tonk Road",
    sender_city: "Jaipur",
    sender_state: "Rajasthan",
    sender_pincode: "302022",

    // Receiver
    receiver_name: "Pooja Verma",
    receiver_mobile: "9823412345",
    receiver_email: "pooja@example.com",
    receiver_address: "12, Civil Lines",
    receiver_city: "New Delhi",
    receiver_state: "Delhi",
    receiver_pincode: "110001",

    // Parcel
    parcel_type: "Documents / Legal Files",
    description: "Property deeds and signed agreements",
    weight_kg: "1.5",
    length_cm: "25",
    width_cm: "20",
    height_cm: "10",
    declared_value_rupees: "5000",

    // Payment
    payment_type: "PREPAID",
    cod_amount_rupees: "0",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      const newId = `BK-${Math.floor(1000 + Math.random() * 9000)}`;
      setGeneratedBookingId(newId);
      setIsSuccess(true);
    }, 600);
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
          <Link href={`/track?q=${generatedBookingId}`}>
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
                ? "bg-brand-primary text-white border-brand-primary shadow-sm"
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
        <form onSubmit={handleSubmit}>
          {/* STEP 1: SENDER DETAILS */}
          {currentStep === 1 && (
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-2 border-b border-border-default pb-3">
                <User className="w-5 h-5 text-brand-primary" />
                <h3 className="text-lg font-bold text-text-primary">Sender Information</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Sender Full Name"
                  name="sender_name"
                  value={formData.sender_name}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Sender Mobile Number"
                  name="sender_mobile"
                  type="tel"
                  maxLength={10}
                  value={formData.sender_mobile}
                  onChange={handleChange}
                  helperText="10-digit Indian mobile number"
                  required
                />
                <div className="sm:col-span-2">
                  <Input
                    label="Sender Email (Optional)"
                    name="sender_email"
                    type="email"
                    value={formData.sender_email}
                    onChange={handleChange}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Input
                    label="Pickup Full Address"
                    name="sender_address"
                    value={formData.sender_address}
                    onChange={handleChange}
                    required
                  />
                </div>
                <Input
                  label="City"
                  name="sender_city"
                  value={formData.sender_city}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="State"
                  name="sender_state"
                  value={formData.sender_state}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Pincode"
                  name="sender_pincode"
                  maxLength={6}
                  value={formData.sender_pincode}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          )}

          {/* STEP 2: RECEIVER DETAILS */}
          {currentStep === 2 && (
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-2 border-b border-border-default pb-3">
                <MapPin className="w-5 h-5 text-brand-accent" />
                <h3 className="text-lg font-bold text-text-primary">Receiver / Destination Information</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Receiver Full Name"
                  name="receiver_name"
                  value={formData.receiver_name}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Receiver Mobile Number"
                  name="receiver_mobile"
                  type="tel"
                  maxLength={10}
                  value={formData.receiver_mobile}
                  onChange={handleChange}
                  helperText="Recipient will receive delivery OTP and alerts"
                  required
                />
                <div className="sm:col-span-2">
                  <Input
                    label="Receiver Email (Optional)"
                    name="receiver_email"
                    type="email"
                    value={formData.receiver_email}
                    onChange={handleChange}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Input
                    label="Delivery Street Address"
                    name="receiver_address"
                    value={formData.receiver_address}
                    onChange={handleChange}
                    required
                  />
                </div>
                <Input
                  label="City"
                  name="receiver_city"
                  value={formData.receiver_city}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="State"
                  name="receiver_state"
                  value={formData.receiver_state}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Pincode"
                  name="receiver_pincode"
                  maxLength={6}
                  value={formData.receiver_pincode}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          )}

          {/* STEP 3: PARCEL DETAILS */}
          {currentStep === 3 && (
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-2 border-b border-border-default pb-3">
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
                    required
                  />
                </div>

                <Input
                  label="Estimated Weight (kg)"
                  name="weight_kg"
                  type="number"
                  step="0.05"
                  min="0.1"
                  value={formData.weight_kg}
                  onChange={handleChange}
                  helperText="e.g. 1.5 kg (will be verified during intake)"
                  required
                />

                <Input
                  label="Declared Value (₹)"
                  name="declared_value_rupees"
                  type="number"
                  min="100"
                  value={formData.declared_value_rupees}
                  onChange={handleChange}
                  helperText="Required for insurance and transit liability"
                  required
                />

                <div className="sm:col-span-2 space-y-2 pt-2 border-t border-border-default">
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-muted">
                    Dimensions (Length x Width x Height in CM)
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <Input
                      label="Length (cm)"
                      name="length_cm"
                      type="number"
                      value={formData.length_cm}
                      onChange={handleChange}
                      required
                    />
                    <Input
                      label="Width (cm)"
                      name="width_cm"
                      type="number"
                      value={formData.width_cm}
                      onChange={handleChange}
                      required
                    />
                    <Input
                      label="Height (cm)"
                      name="height_cm"
                      type="number"
                      value={formData.height_cm}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: PAYMENT TYPE & REVIEW */}
          {currentStep === 4 && (
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-2 border-b border-border-default pb-3">
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
                    helperText="This amount will be collected in cash by courier and settled back to your account."
                    required
                  />
                </div>
              )}

              {/* Booking Summary Card */}
              <div className="bg-surface-subtle p-4 rounded-xl border border-border-default space-y-3 text-xs">
                <div className="font-bold text-sm text-text-primary border-b border-border-default pb-2">
                  Summary Review
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-text-muted">Sender:</span>
                    <div className="font-semibold text-text-primary">
                      {formData.sender_name} ({formData.sender_city})
                    </div>
                  </div>
                  <div>
                    <span className="text-text-muted">Receiver:</span>
                    <div className="font-semibold text-text-primary">
                      {formData.receiver_name} ({formData.receiver_city})
                    </div>
                  </div>
                  <div>
                    <span className="text-text-muted">Parcel Weight / Size:</span>
                    <div className="font-semibold text-text-primary">
                      {formData.weight_kg} kg ({formData.length_cm}x{formData.width_cm}x{formData.height_cm} cm)
                    </div>
                  </div>
                  <div>
                    <span className="text-text-muted">Payment Mode:</span>
                    <div className="font-semibold text-text-primary">
                      {formData.payment_type === "COD"
                        ? `COD (₹${formData.cod_amount_rupees})`
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
            </div>
          )}

          {/* Navigation Controls */}
          <CardFooter className="flex justify-between py-4">
            {currentStep > 1 ? (
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => setCurrentStep((prev) => prev - 1)}
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
                onClick={() => setCurrentStep((prev) => prev + 1)}
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
