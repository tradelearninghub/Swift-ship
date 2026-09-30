"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardFooter } from "@/components/ui/Card";
import { COUNTRIES, getStatesForCountry } from "@/lib/countries";
import { INDIAN_STATES_AND_UTS } from "@/lib/geo";
import {
  Globe,
  MapPin,
  Package,
  FileText,
  DollarSign,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Truck,
  ArrowRight,
  ArrowLeft,
  BookMarked,
  BookmarkCheck,
  User,
  CreditCard,
  Loader2,
} from "lucide-react";

export interface LineItem {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  unit_price: number; // in selected currency
  hsn_code: string;
  tax_rate: number;
  total: number;
}

export interface InternationalBookingFormProps {
  isAdminMode?: boolean;
  customerId?: string;
  customerName?: string;
  customerMobile?: string;
  customerEmail?: string;
  savedAddresses?: any[];
  adminCouriers?: { id: string; name: string; code: string }[];
  onSuccess?: (booking: any, awb?: string | null) => void;
}

export function InternationalBookingForm({
  isAdminMode = false,
  customerId,
  customerName = "",
  customerMobile = "",
  customerEmail = "",
  savedAddresses = [],
  adminCouriers = [],
  onSuccess,
}: InternationalBookingFormProps) {
  // 1. Wizard Step State: 1 = Sender, 2 = Receiver, 3 = Parcel & Items, 4 = Review & Confirm
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Currency State (INR / USD) - attached inline to price fields
  const [currency, setCurrency] = useState<"INR" | "USD">("USD");
  const [exchangeRate, setExchangeRate] = useState<number>(84.0);

  // Form submission & state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdBooking, setCreatedBooking] = useState<any | null>(null);
  const [createdAwb, setCreatedAwb] = useState<string | null>(null);

  // Address Selection
  const [selectedSenderAddrId, setSelectedSenderAddrId] = useState("");
  const [selectedReceiverAddrId, setSelectedReceiverAddrId] = useState("");
  const [saveSenderAddress, setSaveSenderAddress] = useState(false);
  const [senderAddressLabel, setSenderAddressLabel] = useState("");
  const [saveReceiverAddress, setSaveReceiverAddress] = useState(false);
  const [receiverAddressLabel, setReceiverAddressLabel] = useState("");

  // Sender State (Origin = India)
  const [senderName, setSenderName] = useState(customerName || "");
  const [senderMobile, setSenderMobile] = useState(customerMobile || "");
  const [senderEmail, setSenderEmail] = useState(customerEmail || "");
  const [senderCountry, setSenderCountry] = useState("India");
  const [senderAddress1, setSenderAddress1] = useState("");
  const [senderAddress2, setSenderAddress2] = useState("");
  const [senderLandmark, setSenderLandmark] = useState("");
  const [senderCity, setSenderCity] = useState("");
  const [senderDistrict, setSenderDistrict] = useState("");
  const [senderState, setSenderState] = useState("");
  const [senderPincode, setSenderPincode] = useState("");

  // Receiver State (International Destination)
  const [receiverName, setReceiverName] = useState("");
  const [receiverMobile, setReceiverMobile] = useState("");
  const [receiverEmail, setReceiverEmail] = useState("");
  const [receiverPincode, setReceiverPincode] = useState("");
  const [receiverCountry, setReceiverCountry] = useState("United States");
  const [receiverState, setReceiverState] = useState("");
  const [receiverCity, setReceiverCity] = useState("");
  const [receiverAddress1, setReceiverAddress1] = useState("");
  const [receiverAddress2, setReceiverAddress2] = useState("");

  // Commercial Customs & Line Items
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceDate, setInvoiceDate] = useState("");
  const [serviceType, setServiceType] = useState("Express Worldwide (3-5 Days)");
  const [iossNumber, setIossNumber] = useState("");

  // Line Items
  const [lineItems, setLineItems] = useState<LineItem[]>([
    {
      id: "1",
      name: "",
      sku: "",
      quantity: 1,
      unit_price: 0,
      hsn_code: "",
      tax_rate: 0,
      total: 0,
    },
  ]);

  // Parcel Physical Details
  const [parcelType, setParcelType] = useState("Commercial Merchandise");
  const [description, setDescription] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [lengthCm, setLengthCm] = useState("");
  const [widthCm, setWidthCm] = useState("");
  const [heightCm, setHeightCm] = useState("");

  // Admin Specific Fields
  const [adminCourierId, setAdminCourierId] = useState("");
  const [adminShippingCharge, setAdminShippingCharge] = useState("");

  // Sync customer details when passed from admin picker
  useEffect(() => {
    if (customerName && !senderName) setSenderName(customerName);
    if (customerMobile && !senderMobile) setSenderMobile(customerMobile);
    if (customerEmail && !senderEmail) setSenderEmail(customerEmail);
  }, [customerName, customerMobile, customerEmail]);

  // Fetch configured exchange rate from settings
  useEffect(() => {
    async function loadRate() {
      try {
        const res = await fetch("/api/admin/settings?group=currency");
        if (res.ok) {
          const data = await res.json();
          if (data.settings) {
            const found = data.settings.find((s: any) => s.key === "usd_to_inr_rate");
            if (found && found.value) {
              const val = parseFloat(found.value);
              if (!isNaN(val) && val > 0) setExchangeRate(val);
            }
          }
        }
      } catch (e) {
        // Fallback default 84.0
      }
    }
    loadRate();
  }, []);

  // Filtered state options for selected receiver country
  const validReceiverStates = useMemo(() => {
    return getStatesForCountry(receiverCountry);
  }, [receiverCountry]);

  // Reset receiver state if country changes and state is no longer valid
  const handleCountryChange = (countryName: string) => {
    setReceiverCountry(countryName);
    clearError("receiverCountry");
    const states = getStatesForCountry(countryName);
    if (states && states.length > 0) {
      setReceiverState(states[0]);
    } else {
      setReceiverState("");
    }
  };

  // Helper to clear error for a specific field
  const clearError = (field: string) => {
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  // Sender address book selection
  const handleSelectSenderAddress = (addrId: string) => {
    setSelectedSenderAddrId(addrId);
    if (!addrId) return;
    const addr = savedAddresses.find((a) => a.id === addrId);
    if (addr) {
      if (addr.contact_name) setSenderName(addr.contact_name);
      if (addr.contact_mobile) setSenderMobile(addr.contact_mobile);
      if (addr.contact_email) setSenderEmail(addr.contact_email);
      setSenderAddress1(addr.address || "");
      setSenderAddress2(addr.address_line_2 || "");
      setSenderLandmark(addr.landmark || "");
      setSenderCity(addr.city || "");
      setSenderDistrict(addr.district || "");
      setSenderState(addr.state || "");
      setSenderPincode(addr.pincode || "");
      if (addr.country) setSenderCountry(addr.country);

      setErrors((prev) => {
        const next = { ...prev };
        delete next.senderName;
        delete next.senderMobile;
        delete next.senderAddress1;
        delete next.senderCity;
        delete next.senderState;
        delete next.senderPincode;
        return next;
      });
    }
  };

  // Receiver address book selection
  const handleSelectReceiverAddress = (addrId: string) => {
    setSelectedReceiverAddrId(addrId);
    if (!addrId) return;
    const addr = savedAddresses.find((a) => a.id === addrId);
    if (addr) {
      if (addr.contact_name) setReceiverName(addr.contact_name);
      if (addr.contact_mobile) setReceiverMobile(addr.contact_mobile);
      if (addr.contact_email) setReceiverEmail(addr.contact_email);
      setReceiverPincode(addr.pincode || "");
      if (addr.country) {
        setReceiverCountry(addr.country);
      }
      setReceiverState(addr.state || "");
      setReceiverCity(addr.city || "");
      setReceiverAddress1(addr.address || "");
      setReceiverAddress2(addr.address_line_2 || "");

      setErrors((prev) => {
        const next = { ...prev };
        delete next.receiverName;
        delete next.receiverMobile;
        delete next.receiverPincode;
        delete next.receiverCountry;
        delete next.receiverState;
        delete next.receiverCity;
        delete next.receiverAddress1;
        return next;
      });
    }
  };

  // Line item manipulation
  const handleLineItemChange = (index: number, field: keyof LineItem, value: any) => {
    setLineItems((prev) => {
      const updated = [...prev];
      const item = { ...updated[index], [field]: value };
      const qty = field === "quantity" ? Number(value) : item.quantity;
      const price = field === "unit_price" ? Number(value) : item.unit_price;
      item.total = Math.round(qty * price * 100) / 100;
      updated[index] = item;
      return updated;
    });
    clearError("lineItems");
  };

  const addLineItem = () => {
    setLineItems((prev) => [
      ...prev,
      {
        id: Math.random().toString(),
        name: "",
        sku: "",
        quantity: 1,
        unit_price: 0,
        hsn_code: "",
        tax_rate: 0,
        total: 0,
      },
    ]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length <= 1) return;
    setLineItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Total declared value calculated across line items
  const totalDeclaredValue = useMemo(() => {
    return lineItems.reduce((acc, item) => acc + (item.total || 0), 0);
  }, [lineItems]);

  const totalDeclaredInrEquivalent = useMemo(() => {
    if (currency === "USD") {
      return Math.round(totalDeclaredValue * exchangeRate);
    }
    return Math.round(totalDeclaredValue);
  }, [totalDeclaredValue, currency, exchangeRate]);

  // Volumetric weight
  const volumetricWeightKg = useMemo(() => {
    const l = parseFloat(lengthCm) || 0;
    const w = parseFloat(widthCm) || 0;
    const h = parseFloat(heightCm) || 0;
    if (l > 0 && w > 0 && h > 0) {
      return ((l * w * h) / 5000).toFixed(2);
    }
    return null;
  }, [lengthCm, widthCm, heightCm]);

  // ----------------------------------------------------
  // STEP VALIDATION LOGIC (Strict - Matches Domestic rule)
  // ----------------------------------------------------
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    // STEP 1: SENDER DETAILS VALIDATION
    if (step === 1) {
      if (!senderName.trim()) {
        newErrors.senderName = "Sender name is required";
      } else if (senderName.trim().length < 2) {
        newErrors.senderName = "Please enter a valid sender name (min 2 characters)";
      }

      const mobileClean = senderMobile.replace(/\D/g, "");
      if (!mobileClean) {
        newErrors.senderMobile = "Sender mobile number is required";
      } else if (!/^[6-9]\d{9}$/.test(mobileClean)) {
        newErrors.senderMobile = "Enter a valid 10-digit Indian mobile number (starts with 6-9)";
      }

      if (senderEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(senderEmail.trim())) {
        newErrors.senderEmail = "Please enter a valid email address";
      }

      if (!senderAddress1.trim()) {
        newErrors.senderAddress1 = "Pickup street address is required";
      } else if (senderAddress1.trim().length < 5) {
        newErrors.senderAddress1 = "Please enter a complete street address (min 5 characters)";
      }

      if (!senderCity.trim()) {
        newErrors.senderCity = "City is required";
      }

      if (!senderState.trim()) {
        newErrors.senderState = "Please select a State / UT";
      }

      const pinClean = senderPincode.replace(/\D/g, "");
      if (!pinClean) {
        newErrors.senderPincode = "Pincode is required";
      } else if (!/^\d{6}$/.test(pinClean)) {
        newErrors.senderPincode = "Enter a valid 6-digit Indian pincode";
      }
    }

    // STEP 2: RECEIVER DETAILS VALIDATION (Field Order: Pincode -> Country -> State -> City -> Address1 -> Address2)
    if (step === 2) {
      if (!receiverName.trim()) {
        newErrors.receiverName = "Recipient contact name is required";
      } else if (receiverName.trim().length < 2) {
        newErrors.receiverName = "Please enter a valid recipient name (min 2 characters)";
      }

      const phoneClean = receiverMobile.replace(/[^\d+]/g, "");
      if (!phoneClean || phoneClean.length < 5) {
        newErrors.receiverMobile = "Enter a valid recipient phone number with country code";
      }

      if (receiverEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(receiverEmail.trim())) {
        newErrors.receiverEmail = "Please enter a valid email address";
      }

      // 1. Pincode / Postal Code
      if (!receiverPincode.trim()) {
        newErrors.receiverPincode = "Postal / ZIP Code is required";
      } else if (receiverPincode.trim().length < 3) {
        newErrors.receiverPincode = "Enter a valid postal / ZIP code";
      }

      // 2. Country
      if (!receiverCountry.trim()) {
        newErrors.receiverCountry = "Destination country is required";
      }

      // 3. State
      if (!receiverState.trim()) {
        newErrors.receiverState = "State / Province / Region is required";
      }

      // 4. City
      if (!receiverCity.trim()) {
        newErrors.receiverCity = "City is required";
      }

      // 5. Address Line 1
      if (!receiverAddress1.trim()) {
        newErrors.receiverAddress1 = "Address Line 1 is required";
      } else if (receiverAddress1.trim().length < 5) {
        newErrors.receiverAddress1 = "Please enter a complete destination street address (min 5 characters)";
      }
    }

    // STEP 3: PARCEL & CUSTOMS ITEMS VALIDATION
    if (step === 3) {
      if (!description.trim()) {
        newErrors.description = "Package description is required";
      } else if (description.trim().length < 3) {
        newErrors.description = "Please enter a brief description (min 3 characters)";
      }

      const wt = parseFloat(weightKg);
      if (!weightKg || isNaN(wt) || wt <= 0) {
        newErrors.weightKg = "Enter a valid package weight in kg (e.g. 1.5)";
      }

      const l = parseFloat(lengthCm);
      if (!lengthCm || isNaN(l) || l <= 0) {
        newErrors.lengthCm = "Enter length in cm";
      }

      const w = parseFloat(widthCm);
      if (!widthCm || isNaN(w) || w <= 0) {
        newErrors.widthCm = "Enter width in cm";
      }

      const h = parseFloat(heightCm);
      if (!heightCm || isNaN(h) || h <= 0) {
        newErrors.heightCm = "Enter height in cm";
      }

      const validItems = lineItems.filter(
        (i) => i.name.trim().length > 0 && i.quantity > 0 && i.unit_price > 0
      );
      if (validItems.length === 0) {
        newErrors.lineItems =
          "Please enter at least one line item with description, quantity, and unit price greater than 0.";
      }
    }

    // STEP 4: REVIEW STEP VALIDATION
    if (step === 4) {
      if (isAdminMode && adminShippingCharge) {
        const chargeNum = parseFloat(adminShippingCharge);
        if (isNaN(chargeNum) || chargeNum < 0) {
          newErrors.adminShippingCharge = "Enter a valid non-negative shipping charge";
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (currentStep !== 4) {
      handleNextStep();
      return;
    }

    if (!validateStep(1) || !validateStep(2) || !validateStep(3) || !validateStep(4)) {
      return;
    }

    setIsSubmitting(true);
    setApiError(null);

    try {
      const validItems = lineItems.filter((i) => i.name.trim().length > 0);
      const declaredSmallestUnit = Math.round(totalDeclaredValue * 100);

      const payload = {
        shipment_mode: "INTERNATIONAL",
        currency: currency,
        exchange_rate: exchangeRate,
        customer_name: customerName || senderName,
        customer_mobile: customerMobile || senderMobile,

        sender_name: senderName.trim(),
        sender_mobile: senderMobile.trim(),
        sender_email: senderEmail.trim() || undefined,
        sender_country: senderCountry.trim(),
        sender_address: senderAddress1.trim(),
        sender_address_2: senderAddress2.trim() || undefined,
        sender_landmark: senderLandmark.trim() || undefined,
        sender_city: senderCity.trim(),
        sender_district: senderDistrict.trim() || undefined,
        sender_state: senderState.trim(),
        sender_pincode: senderPincode.trim(),

        receiver_name: receiverName.trim(),
        receiver_mobile: receiverMobile.trim(),
        receiver_email: receiverEmail.trim() || undefined,
        receiver_country: receiverCountry.trim(),
        receiver_address: receiverAddress1.trim(),
        receiver_address_2: receiverAddress2.trim() || undefined,
        receiver_city: receiverCity.trim(),
        receiver_state: receiverState.trim(),
        receiver_pincode: receiverPincode.trim(),

        invoice_number: invoiceNumber.trim() || undefined,
        invoice_date: invoiceDate.trim() || undefined,
        service_type: serviceType,
        ioss_number: iossNumber.trim() || undefined,
        line_items: validItems,

        parcel_type: parcelType,
        description: description.trim(),
        submitted_weight_grams: Math.round(parseFloat(weightKg) * 1000),
        submitted_length_cm: Math.round(parseFloat(lengthCm || "15")),
        submitted_width_cm: Math.round(parseFloat(widthCm || "15")),
        submitted_height_cm: Math.round(parseFloat(heightCm || "15")),
        declared_value_paise: declaredSmallestUnit,

        payment_type: "PREPAID",
        cod_amount_paise: 0,

        save_sender_address: saveSenderAddress,
        sender_address_label: senderAddressLabel.trim() || `${senderCity} Pickup`,
        save_receiver_address: saveReceiverAddress,
        receiver_address_label: receiverAddressLabel.trim() || `${receiverName} (${receiverCountry})`,
      };

      const res = await fetch("/api/bookings/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || "Failed to create international booking.");
      }

      const booking = resData.booking;
      setCreatedBooking(booking);

      // If in admin mode and a courier is selected with shipping charge, approve immediately
      if (isAdminMode && adminCourierId) {
        const chargeNum = parseFloat(adminShippingCharge || "0");
        const chargeSmallestUnit = Math.round(chargeNum * 100);

        const reviewPayload = {
          action: "APPROVE",
          verified_weight_grams: Math.round(parseFloat(weightKg) * 1000),
          verified_length_cm: Math.round(parseFloat(lengthCm || "15")),
          verified_width_cm: Math.round(parseFloat(widthCm || "15")),
          verified_height_cm: Math.round(parseFloat(heightCm || "15")),
          shipping_charge_paise: chargeSmallestUnit,
          additional_charge_paise: 0,
          discount_paise: 0,
          tax_paise: 0,
          courier_partner_id: adminCourierId,
        };

        const reviewRes = await fetch(`/api/admin/bookings/${booking.id}/review`, {
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
      if (onSuccess) {
        onSuccess(booking, createdAwb);
      }
    } catch (err: any) {
      setApiError(err.message || "An unexpected error occurred while placing international booking.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess && createdBooking) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6 animate-in fade-in-50">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            International Booking Request Created
          </span>
          <h1 className="text-3xl font-extrabold text-text-primary">
            Booking #{createdBooking.booking_number}
          </h1>
          {createdAwb && (
            <p className="font-mono text-sm font-bold text-brand-accent">
              AWB: {createdAwb}
            </p>
          )}
          <p className="text-sm text-text-secondary max-w-md mx-auto">
            Your international consignment to <strong>{receiverCountry}</strong> has been registered.
            Customs documentation and export dispatch are queued for processing.
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-900 text-left space-y-1">
          <div className="font-bold flex items-center gap-1.5 text-brand-primary">
            <AlertCircle className="w-4 h-4" /> Next Steps:
          </div>
          <p>1. Our customs desk will verify international documentation and invoice values.</p>
          <p>2. You will receive an SMS/WhatsApp notification with courier pickup & flight tracking details.</p>
        </div>

        <div className="flex flex-wrap justify-center gap-4 pt-4">
          {isAdminMode ? (
            <>
              <Link href="/admin/bookings">
                <Button variant="outline" size="md">
                  All Bookings
                </Button>
              </Link>
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  setIsSuccess(false);
                  setCurrentStep(1);
                  setErrors({});
                  setCreatedBooking(null);
                  setCreatedAwb(null);
                }}
              >
                Create Another Booking
              </Button>
            </>
          ) : (
            <>
              <Link href={`/track?booking_id=${createdBooking.booking_number}`}>
                <Button variant="primary" size="md">
                  Track Consignment
                </Button>
              </Link>
              <Button
                variant="outline"
                size="md"
                onClick={() => {
                  setIsSuccess(false);
                  setCurrentStep(1);
                  setErrors({});
                  setCreatedBooking(null);
                  setCreatedAwb(null);
                }}
              >
                Book Another Parcel
              </Button>
              <Link href="/customer">
                <Button variant="ghost" size="md">
                  Go to Customer Portal
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. STEPPER PROGRESS UI — MATCHES DOMESTIC EXACTLY */}
      <div className="grid grid-cols-4 gap-2 text-center text-xs font-semibold">
        {[
          { step: 1, label: "Sender" },
          { step: 2, label: "Receiver" },
          { step: 3, label: "Customs & Items" },
          { step: 4, label: "Review & Submit" },
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

      {/* 2. MAIN WIZARD CARD CONTAINER — ONLY ONE STEP VISIBLE AT A TIME */}
      <Card className="shadow-md">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (currentStep === 4) {
              handleSubmit(e);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.target as HTMLElement).tagName !== "TEXTAREA") {
              e.preventDefault();
              if (currentStep < 4) {
                handleNextStep();
              }
            }
          }}
          noValidate
        >
          {/* ============================================================== */}
          {/* STEP 1: SENDER DETAILS (Origin = India) */}
          {/* ============================================================== */}
          {currentStep === 1 && (
            <div className="p-6 sm:p-8 space-y-6 animate-in fade-in duration-150">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-brand-primary" />
                  <h3 className="text-lg font-bold text-text-primary">Sender Information (Origin: India)</h3>
                </div>
                {savedAddresses.length > 0 && (
                  <span className="text-xs text-brand-primary font-semibold flex items-center gap-1 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                    <BookMarked className="w-3.5 h-3.5" /> Address Book Enabled
                  </span>
                )}
              </div>

              {/* Saved Address Book Dropdown if available */}
              {savedAddresses.length > 0 && (
                <div className="bg-gradient-to-r from-blue-50/90 to-indigo-50/50 border border-blue-200 rounded-xl p-3.5 space-y-2 shadow-sm">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-brand-primary flex items-center gap-1.5">
                      <BookMarked className="w-4 h-4 text-brand-accent" />
                      Choose from Saved Addresses ({savedAddresses.length})
                    </label>
                  </div>
                  <select
                    value={selectedSenderAddrId}
                    onChange={(e) => handleSelectSenderAddress(e.target.value)}
                    className="w-full h-10 px-3 py-1.5 text-xs bg-white border border-blue-300 rounded-lg text-text-primary focus:ring-2 focus:ring-brand-primary/30 font-medium"
                  >
                    <option value="">-- Click to select an address and auto-populate --</option>
                    {savedAddresses.map((addr) => (
                      <option key={addr.id} value={addr.id}>
                        {addr.label} {addr.is_default ? "★ (Default)" : ""}: {addr.address}, {addr.city} ({addr.pincode})
                        {addr.contact_name ? ` — ${addr.contact_name}` : ""}
                      </option>
                    ))}
                  </select>
                  {selectedSenderAddrId && (
                    <div className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1 animate-in fade-in">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Sender details auto-filled from Address Book
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Sender Full Name"
                  name="sender_name"
                  value={senderName}
                  onChange={(e) => {
                    setSenderName(e.target.value);
                    clearError("senderName");
                  }}
                  placeholder="e.g. Ramesh Kumar / Business Name"
                  error={errors.senderName}
                  required
                />
                <Input
                  label="Sender Mobile Number"
                  name="sender_mobile"
                  type="tel"
                  maxLength={10}
                  value={senderMobile}
                  onChange={(e) => {
                    setSenderMobile(e.target.value);
                    clearError("senderMobile");
                  }}
                  placeholder="10-digit mobile number"
                  helperText="10-digit Indian mobile number"
                  error={errors.senderMobile}
                  required
                />
                <div className="sm:col-span-2">
                  <Input
                    label="Sender Email (Optional)"
                    name="sender_email"
                    type="email"
                    value={senderEmail}
                    onChange={(e) => {
                      setSenderEmail(e.target.value);
                      clearError("senderEmail");
                    }}
                    placeholder="email@example.com"
                    error={errors.senderEmail}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Input
                    label="Pickup Full Address (Line 1)"
                    name="sender_address_1"
                    value={senderAddress1}
                    onChange={(e) => {
                      setSenderAddress1(e.target.value);
                      clearError("senderAddress1");
                    }}
                    placeholder="Complete pickup street address / flat / building"
                    error={errors.senderAddress1}
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <Input
                    label="Address Line 2 (Optional)"
                    name="sender_address_2"
                    value={senderAddress2}
                    onChange={(e) => setSenderAddress2(e.target.value)}
                    placeholder="Suite, Floor, Warehouse unit"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Input
                    label="Landmark (Optional)"
                    name="sender_landmark"
                    value={senderLandmark}
                    onChange={(e) => setSenderLandmark(e.target.value)}
                    placeholder="e.g. Near Metro Station, Behind City Hospital"
                  />
                </div>
                <Input
                  label="City"
                  name="sender_city"
                  value={senderCity}
                  onChange={(e) => {
                    setSenderCity(e.target.value);
                    clearError("senderCity");
                  }}
                  placeholder="City"
                  error={errors.senderCity}
                  required
                />
                <Input
                  label="District (Optional)"
                  name="sender_district"
                  value={senderDistrict}
                  onChange={(e) => setSenderDistrict(e.target.value)}
                  placeholder="District"
                />
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-text-primary">
                    State / Union Territory <span className="text-status-danger">*</span>
                  </label>
                  <select
                    name="sender_state"
                    value={senderState}
                    onChange={(e) => {
                      setSenderState(e.target.value);
                      clearError("senderState");
                    }}
                    className={`w-full h-10 px-3 py-2 text-sm bg-surface-base border rounded-lg focus:ring-1 focus:ring-brand-primary ${
                      errors.senderState ? "border-status-danger" : "border-border-default"
                    }`}
                  >
                    <option value="">Select State / UT</option>
                    {INDIAN_STATES_AND_UTS.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                  {errors.senderState && (
                    <p className="text-xs text-status-danger mt-1">{errors.senderState}</p>
                  )}
                </div>
                <Input
                  label="Postal PIN Code"
                  name="sender_pincode"
                  maxLength={6}
                  value={senderPincode}
                  onChange={(e) => {
                    setSenderPincode(e.target.value);
                    clearError("senderPincode");
                  }}
                  placeholder="6-digit pincode"
                  error={errors.senderPincode}
                  required
                />
              </div>

              {/* Option to Save Sender Address to Address Book */}
              <div className="pt-3 border-t border-border-default/60 space-y-2 bg-surface-subtle/50 p-3 rounded-xl">
                <label className="flex items-center gap-2 text-xs font-semibold text-text-primary cursor-pointer">
                  <input
                    type="checkbox"
                    checked={saveSenderAddress}
                    onChange={(e) => setSaveSenderAddress(e.target.checked)}
                    className="w-4 h-4 rounded text-brand-primary focus:ring-brand-primary border-border-default"
                  />
                  <span className="flex items-center gap-1.5">
                    <BookmarkCheck className="w-3.5 h-3.5 text-brand-primary" />
                    Save this pickup address to Address Book for future bookings
                  </span>
                </label>
                {saveSenderAddress && (
                  <div className="pl-6 pt-1 max-w-sm animate-in fade-in">
                    <Input
                      label="Address Label / Nickname"
                      value={senderAddressLabel}
                      onChange={(e) => setSenderAddressLabel(e.target.value)}
                      placeholder="e.g. Head Office, Jaipur Hub"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* STEP 2: RECEIVER DETAILS (Field Order per Round 12 §3) */}
          {/* Order: 1. Pincode -> 2. Country -> 3. State -> 4. City -> 5. Address 1 -> 6. Address 2 */}
          {/* ============================================================== */}
          {currentStep === 2 && (
            <div className="p-6 sm:p-8 space-y-6 animate-in fade-in duration-150">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-brand-accent" />
                  <h3 className="text-lg font-bold text-text-primary">Receiver / Destination Information</h3>
                </div>
                {savedAddresses.length > 0 && (
                  <span className="text-xs text-brand-primary font-semibold flex items-center gap-1 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                    <BookMarked className="w-3.5 h-3.5" /> Address Book Enabled
                  </span>
                )}
              </div>

              {/* Saved Address Book Dropdown for Receiver */}
              {savedAddresses.length > 0 && (
                <div className="bg-gradient-to-r from-orange-50/80 to-amber-50/50 border border-orange-200 rounded-xl p-3.5 space-y-2 shadow-sm">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-brand-accent flex items-center gap-1.5">
                      <BookMarked className="w-4 h-4 text-brand-primary" />
                      Choose from Saved Recipients ({savedAddresses.length})
                    </label>
                  </div>
                  <select
                    value={selectedReceiverAddrId}
                    onChange={(e) => handleSelectReceiverAddress(e.target.value)}
                    className="w-full h-10 px-3 py-1.5 text-xs bg-white border border-orange-300 rounded-lg text-text-primary focus:ring-2 focus:ring-brand-accent/30 font-medium"
                  >
                    <option value="">-- Click to select an address and auto-populate --</option>
                    {savedAddresses.map((addr) => (
                      <option key={addr.id} value={addr.id}>
                        {addr.label} {addr.is_default ? "★ (Default)" : ""}: {addr.address}, {addr.city} ({addr.country || "Abroad"})
                        {addr.contact_name ? ` — ${addr.contact_name}` : ""}
                      </option>
                    ))}
                  </select>
                  {selectedReceiverAddrId && (
                    <div className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1 animate-in fade-in">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Receiver details auto-filled from Address Book
                    </div>
                  )}
                </div>
              )}

              {/* Recipient Contact Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Recipient Contact Name"
                  name="receiver_name"
                  value={receiverName}
                  onChange={(e) => {
                    setReceiverName(e.target.value);
                    clearError("receiverName");
                  }}
                  placeholder="e.g. John Doe / Global Tech Inc."
                  error={errors.receiverName}
                  required
                />
                <Input
                  label="Phone / Mobile (with country prefix)"
                  name="receiver_mobile"
                  type="tel"
                  value={receiverMobile}
                  onChange={(e) => {
                    setReceiverMobile(e.target.value);
                    clearError("receiverMobile");
                  }}
                  placeholder="e.g. +1 415-555-2671"
                  helperText="Required for customs & delivery notification"
                  error={errors.receiverMobile}
                  required
                />
                <div className="sm:col-span-2">
                  <Input
                    label="Recipient Email (Optional)"
                    name="receiver_email"
                    type="email"
                    value={receiverEmail}
                    onChange={(e) => {
                      setReceiverEmail(e.target.value);
                      clearError("receiverEmail");
                    }}
                    placeholder="recipient@example.com"
                    error={errors.receiverEmail}
                  />
                </div>
              </div>

              {/* Section Divider: International Address in STRICT ORDER (§3) */}
              <div className="pt-2 border-t border-border-default/60">
                <span className="text-xs font-bold uppercase tracking-wider text-text-muted block mb-3">
                  Destination Address (Foreign Customs Location)
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* 1. Pincode / Postal Code */}
                  <div>
                    <Input
                      label="1. Pincode / Postal Code"
                      name="receiver_pincode"
                      value={receiverPincode}
                      onChange={(e) => {
                        setReceiverPincode(e.target.value);
                        clearError("receiverPincode");
                      }}
                      placeholder="e.g. 90210 / SW1A 1AA / M5V 2T6"
                      error={errors.receiverPincode}
                      required
                    />
                  </div>

                  {/* 2. Country — Select from dropdown */}
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-text-primary">
                      2. Destination Country <span className="text-status-danger">*</span>
                    </label>
                    <select
                      value={receiverCountry}
                      onChange={(e) => handleCountryChange(e.target.value)}
                      className={`w-full h-10 px-3 py-2 text-sm bg-surface-base border rounded-lg focus:ring-1 focus:ring-brand-primary ${
                        errors.receiverCountry ? "border-status-danger" : "border-border-default"
                      }`}
                      required
                    >
                      <option value="">Select Country</option>
                      {COUNTRIES.map((c) => (
                        <option key={c.code} value={c.name}>
                          {c.name} ({c.code})
                        </option>
                      ))}
                    </select>
                    {errors.receiverCountry && (
                      <p className="text-xs text-status-danger mt-1">{errors.receiverCountry}</p>
                    )}
                  </div>

                  {/* 3. State — Select from dropdown, filtered to valid states */}
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-text-primary">
                      3. State / Province / Region <span className="text-status-danger">*</span>
                    </label>
                    {validReceiverStates && validReceiverStates.length > 0 ? (
                      <select
                        value={receiverState}
                        onChange={(e) => {
                          setReceiverState(e.target.value);
                          clearError("receiverState");
                        }}
                        className={`w-full h-10 px-3 py-2 text-sm bg-surface-base border rounded-lg focus:ring-1 focus:ring-brand-primary ${
                          errors.receiverState ? "border-status-danger" : "border-border-default"
                        }`}
                        required
                      >
                        <option value="">Select State / Province</option>
                        {validReceiverStates.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <Input
                        value={receiverState}
                        onChange={(e) => {
                          setReceiverState(e.target.value);
                          clearError("receiverState");
                        }}
                        placeholder="State or Province Name"
                        error={errors.receiverState}
                        required
                      />
                    )}
                    {errors.receiverState && validReceiverStates && validReceiverStates.length > 0 && (
                      <p className="text-xs text-status-danger mt-1">{errors.receiverState}</p>
                    )}
                  </div>

                  {/* 4. City */}
                  <div>
                    <Input
                      label="4. City"
                      name="receiver_city"
                      value={receiverCity}
                      onChange={(e) => {
                        setReceiverCity(e.target.value);
                        clearError("receiverCity");
                      }}
                      placeholder="e.g. Los Angeles, London, Toronto"
                      error={errors.receiverCity}
                      required
                    />
                  </div>

                  {/* 5. Address Line 1 */}
                  <div className="sm:col-span-2">
                    <Input
                      label="5. Address Line 1 (Street Address / Building)"
                      name="receiver_address_1"
                      value={receiverAddress1}
                      onChange={(e) => {
                        setReceiverAddress1(e.target.value);
                        clearError("receiverAddress1");
                      }}
                      placeholder="House/Plot No., Street Name, Complex"
                      error={errors.receiverAddress1}
                      required
                    />
                  </div>

                  {/* 6. Address Line 2 (optional) */}
                  <div className="sm:col-span-2">
                    <Input
                      label="6. Address Line 2 (Optional - Suite, Apt, Unit)"
                      name="receiver_address_2"
                      value={receiverAddress2}
                      onChange={(e) => setReceiverAddress2(e.target.value)}
                      placeholder="e.g. Suite 400, Apt 2B"
                    />
                  </div>
                </div>
              </div>

              {/* Option to Save Receiver Address to Address Book */}
              <div className="pt-3 border-t border-border-default/60 space-y-2 bg-surface-subtle/50 p-3 rounded-xl">
                <label className="flex items-center gap-2 text-xs font-semibold text-text-primary cursor-pointer">
                  <input
                    type="checkbox"
                    checked={saveReceiverAddress}
                    onChange={(e) => setSaveReceiverAddress(e.target.checked)}
                    className="w-4 h-4 rounded text-brand-primary focus:ring-brand-primary border-border-default"
                  />
                  <span className="flex items-center gap-1.5">
                    <BookmarkCheck className="w-3.5 h-3.5 text-brand-accent" />
                    Save this international recipient to Address Book for future bookings
                  </span>
                </label>
                {saveReceiverAddress && (
                  <div className="pl-6 pt-1 max-w-sm animate-in fade-in">
                    <Input
                      label="Recipient Label / Nickname"
                      value={receiverAddressLabel}
                      onChange={(e) => setReceiverAddressLabel(e.target.value)}
                      placeholder="e.g. US Client Office, John Doe Home"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* STEP 3: PARCEL & CUSTOMS LINE ITEMS */}
          {/* Currency selector built inline attached to price fields (§2) */}
          {/* ============================================================== */}
          {currentStep === 3 && (
            <div className="p-6 sm:p-8 space-y-6 animate-in fade-in duration-150">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-brand-primary" />
                  <h3 className="text-lg font-bold text-text-primary">Parcel & Customs Line Items</h3>
                </div>
                <div className="text-xs font-semibold text-text-muted bg-surface-subtle px-3 py-1 rounded-full border border-border-default">
                  1 USD ≈ ₹{exchangeRate.toFixed(2)} INR
                </div>
              </div>

              {/* Package Dimensions & Specifications */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="block text-sm font-medium text-text-primary">
                    Package Classification <span className="text-status-danger">*</span>
                  </label>
                  <select
                    value={parcelType}
                    onChange={(e) => setParcelType(e.target.value)}
                    className="w-full h-10 px-3 py-2 text-sm bg-surface-base border border-border-default rounded-lg focus:ring-1 focus:ring-brand-primary"
                  >
                    <option value="Commercial Merchandise">Commercial Merchandise</option>
                    <option value="Document / Printed Material">Document / Printed Material</option>
                    <option value="Commercial Sample">Commercial Sample</option>
                    <option value="Gift Consignment">Gift Consignment</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <Input
                    label="Consignment Description"
                    name="description"
                    value={description}
                    onChange={(e) => {
                      setDescription(e.target.value);
                      clearError("description");
                    }}
                    placeholder="e.g. Export Cotton Garments Samples"
                    error={errors.description}
                    required
                  />
                </div>

                <Input
                  label="Estimated Actual Weight (kg)"
                  name="weight_kg"
                  type="number"
                  step="0.05"
                  min="0.1"
                  value={weightKg}
                  onChange={(e) => {
                    setWeightKg(e.target.value);
                    clearError("weightKg");
                  }}
                  placeholder="e.g. 2.5"
                  helperText="Physical weight in kg (verified during customs intake)"
                  error={errors.weightKg}
                  required
                />

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-text-primary">
                    Service Level <span className="text-status-danger">*</span>
                  </label>
                  <select
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value)}
                    className="w-full h-10 px-3 py-2 text-sm bg-surface-base border border-border-default rounded-lg focus:ring-1 focus:ring-brand-primary"
                  >
                    <option value="Express Worldwide (3-5 Days)">Express Worldwide (3-5 Days)</option>
                    <option value="Standard International (5-8 Days)">Standard International (5-8 Days)</option>
                    <option value="Economy Air Cargo (7-12 Days)">Economy Air Cargo (7-12 Days)</option>
                    <option value="International Document (2-4 Days)">International Document (2-4 Days)</option>
                  </select>
                </div>

                <div className="sm:col-span-2 space-y-2 pt-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-muted">
                    Dimensions (Length x Width x Height in CM) <span className="text-status-danger">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <Input
                      label="Length (cm)"
                      name="length_cm"
                      type="number"
                      value={lengthCm}
                      onChange={(e) => {
                        setLengthCm(e.target.value);
                        clearError("lengthCm");
                      }}
                      placeholder="L cm"
                      error={errors.lengthCm}
                      required
                    />
                    <Input
                      label="Width (cm)"
                      name="width_cm"
                      type="number"
                      value={widthCm}
                      onChange={(e) => {
                        setWidthCm(e.target.value);
                        clearError("widthCm");
                      }}
                      placeholder="W cm"
                      error={errors.widthCm}
                      required
                    />
                    <Input
                      label="Height (cm)"
                      name="height_cm"
                      type="number"
                      value={heightCm}
                      onChange={(e) => {
                        setHeightCm(e.target.value);
                        clearError("heightCm");
                      }}
                      placeholder="H cm"
                      error={errors.heightCm}
                      required
                    />
                  </div>
                </div>
              </div>

              {volumetricWeightKg && (
                <div className="p-3 rounded-xl bg-surface-subtle border border-border-default text-xs flex items-center justify-between text-text-secondary">
                  <span>
                    Volumetric Weight: <strong>{volumetricWeightKg} kg</strong> (L×W×H / 5000)
                  </span>
                  <span className="text-[11px] text-text-muted">
                    Billable weight is the greater of actual vs volumetric weight.
                  </span>
                </div>
              )}

              {/* Optional Commercial Invoice Metadata */}
              <div className="pt-2 border-t border-border-default/60">
                <span className="text-xs font-bold uppercase tracking-wider text-text-muted block mb-3">
                  Invoice & Export References (Optional)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input
                    label="Invoice Number"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    placeholder="e.g. INV-2026-089"
                  />
                  <Input
                    label="Invoice Date"
                    type="date"
                    value={invoiceDate}
                    onChange={(e) => setInvoiceDate(e.target.value)}
                  />
                  <Input
                    label="IOSS / Tax ID"
                    value={iossNumber}
                    onChange={(e) => setIossNumber(e.target.value)}
                    placeholder="e.g. IM1234567890"
                  />
                </div>
              </div>

              {/* Customs Line Items Table with Attached Currency Selectors (§2) */}
              <div className="pt-2 border-t border-border-default/60 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-text-primary flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-brand-primary" /> Customs Commercial Line Items
                    </h4>
                    <p className="text-xs text-text-secondary">
                      Itemized list required for international customs declaration and valuation
                    </p>
                  </div>

                  {/* Total Declared Value with Attached Currency Toggle (§2) */}
                  <div className="flex items-center gap-2 bg-surface-subtle border border-border-default px-3 py-1.5 rounded-xl">
                    <span className="text-xs font-bold text-text-secondary">Total Value:</span>
                    <div className="flex items-center rounded-lg border border-border-default overflow-hidden bg-white">
                      <button
                        type="button"
                        onClick={() => setCurrency("USD")}
                        className={`px-2 py-0.5 text-xs font-bold transition-colors ${
                          currency === "USD"
                            ? "bg-brand-primary text-white"
                            : "bg-surface-subtle text-text-secondary hover:text-text-primary"
                        }`}
                      >
                        USD ($)
                      </button>
                      <button
                        type="button"
                        onClick={() => setCurrency("INR")}
                        className={`px-2 py-0.5 text-xs font-bold transition-colors ${
                          currency === "INR"
                            ? "bg-brand-accent text-white"
                            : "bg-surface-subtle text-text-secondary hover:text-text-primary"
                        }`}
                      >
                        INR (₹)
                      </button>
                    </div>
                    <span className="font-mono font-bold text-sm text-text-primary">
                      {currency === "USD" ? `$${totalDeclaredValue.toFixed(2)}` : `₹${totalDeclaredValue.toLocaleString()}`}
                    </span>
                  </div>
                </div>

                {errors.lineItems && (
                  <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{errors.lineItems}</span>
                  </div>
                )}

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border border-border-default rounded-xl overflow-hidden">
                    <thead className="bg-surface-subtle text-text-primary uppercase tracking-wider font-bold">
                      <tr>
                        <th className="p-2.5">Item Description *</th>
                        <th className="p-2.5 w-24">SKU</th>
                        <th className="p-2.5 w-16 text-center">Qty *</th>
                        <th className="p-2.5 w-40">Unit Price *</th>
                        <th className="p-2.5 w-24">HSN Code</th>
                        <th className="p-2.5 w-16 text-center">Tax %</th>
                        <th className="p-2.5 w-28 text-right">Total ({currency})</th>
                        <th className="p-2.5 w-10 text-center"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-default">
                      {lineItems.map((item, idx) => (
                        <tr key={item.id} className="hover:bg-surface-subtle/50">
                          <td className="p-2">
                            <input
                              type="text"
                              value={item.name}
                              onChange={(e) => handleLineItemChange(idx, "name", e.target.value)}
                              placeholder="e.g. Cotton Handloom Shirt"
                              className="w-full text-xs p-1.5 rounded-lg border border-border-default focus:ring-1 focus:ring-brand-primary focus:outline-none"
                              required
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={item.sku}
                              onChange={(e) => handleLineItemChange(idx, "sku", e.target.value)}
                              placeholder="SKU-101"
                              className="w-full text-xs p-1.5 rounded-lg border border-border-default focus:ring-1 focus:ring-brand-primary focus:outline-none"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => handleLineItemChange(idx, "quantity", e.target.value)}
                              className="w-full text-xs p-1.5 rounded-lg border border-border-default text-center focus:ring-1 focus:ring-brand-primary focus:outline-none font-mono"
                              required
                            />
                          </td>
                          {/* Unit Price with Attached Currency Selector Inline (§2) */}
                          <td className="p-2">
                            <div className="flex items-center rounded-lg border border-border-default focus-within:ring-1 focus-within:ring-brand-primary focus-within:border-brand-primary overflow-hidden bg-white shadow-2xs">
                              <select
                                value={currency}
                                onChange={(e) => setCurrency(e.target.value as "USD" | "INR")}
                                className="h-7 px-1.5 text-[11px] font-bold bg-surface-subtle border-r border-border-default text-text-primary focus:outline-none cursor-pointer"
                                title="Change valuation currency"
                              >
                                <option value="USD">USD</option>
                                <option value="INR">INR</option>
                              </select>
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={item.unit_price || ""}
                                onChange={(e) => handleLineItemChange(idx, "unit_price", e.target.value)}
                                placeholder="0.00"
                                className="w-full h-7 px-2 text-xs font-mono text-text-primary bg-transparent focus:outline-none"
                                required
                              />
                            </div>
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={item.hsn_code}
                              onChange={(e) => handleLineItemChange(idx, "hsn_code", e.target.value)}
                              placeholder="620520"
                              className="w-full text-xs p-1.5 rounded-lg border border-border-default font-mono focus:ring-1 focus:ring-brand-primary focus:outline-none"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={item.tax_rate || ""}
                              onChange={(e) => handleLineItemChange(idx, "tax_rate", e.target.value)}
                              placeholder="0"
                              className="w-full text-xs p-1.5 rounded-lg border border-border-default text-center focus:ring-1 focus:ring-brand-primary focus:outline-none"
                            />
                          </td>
                          <td className="p-2 text-right font-mono font-bold text-text-primary">
                            {currency === "USD" ? `$${item.total.toFixed(2)}` : `₹${item.total.toLocaleString()}`}
                          </td>
                          <td className="p-2 text-center">
                            {lineItems.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeLineItem(idx)}
                                className="text-text-muted hover:text-status-danger p-1 transition-colors"
                                title="Remove item"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addLineItem}
                    className="flex items-center gap-1.5 text-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Another Line Item</span>
                  </Button>

                  <span className="text-xs text-text-muted">
                    Total Items: <strong>{lineItems.reduce((acc, i) => acc + (Number(i.quantity) || 0), 0)}</strong>
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* STEP 4: REVIEW & CONFIRM (Matches Domestic Step 4) */}
          {/* ============================================================== */}
          {currentStep === 4 && (
            <div className="p-6 sm:p-8 space-y-6 animate-in fade-in duration-150">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                <h3 className="text-lg font-bold text-text-primary">Review & Confirm International Booking</h3>
              </div>

              {/* Comprehensive Booking Verification Cards */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-sm text-text-primary flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-brand-primary" /> Review All International Details Before Submitting
                  </div>
                  <span className="text-[11px] text-text-muted">Verify foreign destination & customs entries</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Sender Summary Card */}
                  <div className="p-4 bg-surface-subtle rounded-xl border border-border-default space-y-2 text-xs">
                    <div className="flex items-center justify-between border-b border-border-default pb-2">
                      <span className="font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
                        <User className="w-3.5 h-3.5 text-brand-primary" /> 1. Sender (Origin: India)
                      </span>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(1)}
                        className="text-[11px] text-brand-primary font-semibold hover:underline"
                      >
                        Edit
                      </button>
                    </div>
                    <div className="font-bold text-sm text-text-primary">{senderName || "—"}</div>
                    <div className="text-text-secondary leading-relaxed">{senderAddress1 || "—"}</div>
                    {senderAddress2 && (
                      <div className="text-text-secondary">{senderAddress2}</div>
                    )}
                    {senderLandmark && (
                      <div className="text-[11px] text-text-muted">
                        <span className="font-semibold text-text-secondary">Landmark:</span> {senderLandmark}
                      </div>
                    )}
                    <div className="font-semibold text-text-primary">
                      {senderCity}
                      {senderDistrict ? `, ${senderDistrict}` : ""}
                      {senderState ? `, ${senderState}` : ""} - {senderPincode}, India
                    </div>
                    <div className="text-text-muted pt-1 border-t border-border-default/60 space-y-0.5">
                      <div><span className="font-medium text-text-secondary">Mobile:</span> +91 {senderMobile || "—"}</div>
                      {senderEmail && (
                        <div><span className="font-medium text-text-secondary">Email:</span> {senderEmail}</div>
                      )}
                    </div>
                    {saveSenderAddress && (
                      <div className="pt-1.5">
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                          <BookmarkCheck className="w-3 h-3 text-emerald-600" /> Will save to Address Book ({senderAddressLabel || "Pickup"})
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Receiver Summary Card (Ordered per Step 2) */}
                  <div className="p-4 bg-surface-subtle rounded-xl border border-border-default space-y-2 text-xs">
                    <div className="flex items-center justify-between border-b border-border-default pb-2">
                      <span className="font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
                        <Globe className="w-3.5 h-3.5 text-brand-accent" /> 2. Receiver (Destination: Abroad)
                      </span>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(2)}
                        className="text-[11px] text-brand-primary font-semibold hover:underline"
                      >
                        Edit
                      </button>
                    </div>
                    <div className="font-bold text-sm text-text-primary">{receiverName || "—"}</div>
                    <div className="text-text-secondary leading-relaxed">{receiverAddress1 || "—"}</div>
                    {receiverAddress2 && (
                      <div className="text-text-secondary">{receiverAddress2}</div>
                    )}
                    <div className="font-semibold text-text-primary">
                      {receiverCity}, {receiverState} ({receiverPincode})
                    </div>
                    <div className="font-bold text-brand-primary">
                      {receiverCountry}
                    </div>
                    <div className="text-text-muted pt-1 border-t border-border-default/60 space-y-0.5">
                      <div><span className="font-medium text-text-secondary">Phone:</span> {receiverMobile || "—"}</div>
                      {receiverEmail && (
                        <div><span className="font-medium text-text-secondary">Email:</span> {receiverEmail}</div>
                      )}
                    </div>
                    {saveReceiverAddress && (
                      <div className="pt-1.5">
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                          <BookmarkCheck className="w-3 h-3 text-emerald-600" /> Will save to Address Book ({receiverAddressLabel || "Delivery"})
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Parcel & Customs Declaration Summary */}
                <div className="p-4 bg-surface-subtle rounded-xl border border-border-default space-y-3 text-xs">
                  <div className="flex items-center justify-between border-b border-border-default pb-2">
                    <span className="font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
                      <Package className="w-3.5 h-3.5 text-emerald-600" /> 3. Parcel & Customs Valuation
                    </span>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="text-[11px] text-brand-primary font-semibold hover:underline"
                    >
                      Edit
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                    <div>
                      <span className="text-text-muted block">Classification:</span>
                      <span className="font-medium text-text-primary">{parcelType}</span>
                    </div>
                    <div>
                      <span className="text-text-muted block">Actual Weight:</span>
                      <span className="font-mono font-bold text-text-primary">{weightKg ? `${weightKg} kg` : "—"}</span>
                    </div>
                    <div>
                      <span className="text-text-muted block">Dimensions (L×W×H):</span>
                      <span className="font-mono text-text-primary">
                        {lengthCm && widthCm && heightCm
                          ? `${lengthCm} × ${widthCm} × ${heightCm} cm`
                          : "—"}
                      </span>
                    </div>
                    <div>
                      <span className="text-text-muted block">Total Customs Value:</span>
                      <span className="font-mono font-bold text-text-primary text-sm">
                        {currency === "USD" ? `$${totalDeclaredValue.toFixed(2)} USD` : `₹${totalDeclaredValue.toLocaleString()} INR`}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border-default/60 flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <span className="text-text-muted">Description: </span>
                      <span className="text-text-primary font-medium">{description}</span>
                    </div>
                    <div>
                      <span className="text-text-muted">Service Level: </span>
                      <span className="font-bold text-brand-primary">{serviceType}</span>
                    </div>
                  </div>

                  {/* Line Items Snapshot */}
                  <div className="pt-2 border-t border-border-default/60">
                    <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider block mb-1.5">
                      Itemized Line Items ({lineItems.filter((i) => i.name.trim().length > 0).length}):
                    </span>
                    <div className="space-y-1">
                      {lineItems
                        .filter((i) => i.name.trim().length > 0)
                        .map((item, idx) => (
                          <div key={item.id || idx} className="flex items-center justify-between text-xs py-1 border-b border-border-default/40 last:border-none">
                            <span className="text-text-primary">
                              {item.quantity}x {item.name} {item.sku ? `(${item.sku})` : ""}
                            </span>
                            <span className="font-mono font-bold text-text-primary">
                              {currency === "USD" ? `$${item.total.toFixed(2)}` : `₹${item.total.toLocaleString()}`}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Admin-only Allocation Controls (if in admin mode) */}
              {isAdminMode && (
                <div className="p-4 bg-slate-50 border border-brand-primary/20 rounded-xl space-y-3">
                  <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                    <Truck className="w-4 h-4 text-brand-primary" />
                    <h4 className="font-bold text-xs uppercase tracking-wider text-[#002B49]">
                      Admin Dispatch & Carrier Allocation
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">
                        Assign International Carrier (Optional)
                      </label>
                      <select
                        value={adminCourierId}
                        onChange={(e) => setAdminCourierId(e.target.value)}
                        className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#002B49]"
                      >
                        <option value="">Manual / Allocate Later</option>
                        {adminCouriers.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} ({c.code})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">
                        Shipping Charge ({currency})
                      </label>
                      <div className="flex rounded-lg border border-slate-300 focus-within:ring-1 focus-within:ring-[#002B49] overflow-hidden bg-white">
                        <select
                          value={currency}
                          onChange={(e) => setCurrency(e.target.value as "USD" | "INR")}
                          className="h-10 px-2.5 text-xs font-bold bg-slate-100 border-r border-slate-300 text-slate-700 focus:outline-none cursor-pointer"
                        >
                          <option value="USD">USD ($)</option>
                          <option value="INR">INR (₹)</option>
                        </select>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={adminShippingCharge}
                          onChange={(e) => setAdminShippingCharge(e.target.value)}
                          placeholder={currency === "USD" ? "e.g. 45.00" : "e.g. 3750"}
                          className="w-full h-10 px-3 text-xs text-slate-800 bg-transparent focus:outline-none font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* International Shipping Charge Notice Banner */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-brand-primary shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-brand-primary">International Customs & Freight Notice:</div>
                  <p className="mt-0.5">
                    Final freight charges and customs export clearances will be confirmed upon package inspection.
                    Destination customs duties (if applicable) are assessed by the destination country authority.
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

          {/* ============================================================== */}
          {/* STEPPER NAVIGATION CONTROLS — MATCHES DOMESTIC EXACTLY */}
          {/* ============================================================== */}
          <CardFooter className="flex justify-between py-4">
            {currentStep > 1 ? (
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => {
                  setErrors({});
                  setCurrentStep((prev) => Math.max(prev - 1, 1));
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
                type="button"
                variant="accent"
                size="lg"
                onClick={() => handleSubmit()}
                isLoading={isSubmitting}
                className="shadow-md font-bold px-8"
              >
                Confirm & Submit International Booking
              </Button>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
