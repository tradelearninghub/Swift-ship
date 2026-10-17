"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
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
  BookMarked,
  BookmarkCheck,
  User,
  CreditCard,
  Loader2,
  Plane,
  ShieldCheck,
  Search,
  Barcode,
  Tag,
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
  // Currency State (INR / USD)
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

  // Pre-Printed AWB Barcode Sticker State (§Business & Staff tags)
  const [manualAwb, setManualAwb] = useState("");
  const [awbDate, setAwbDate] = useState("");

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
        const res = await fetch("/api/admin/settings");
        if (res.ok) {
          const data = await res.json();
          if (data.settings?.pricing?.usd_to_inr_rate) {
            setExchangeRate(Number(data.settings.pricing.usd_to_inr_rate));
          }
        }
      } catch (e) {
        // Fallback default is 84.0
      }
    }
    loadRate();
  }, []);

  // Set today's date for invoice and AWB sticker by default
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setInvoiceDate(today);
    setAwbDate(today);
  }, []);

  // Available states for selected receiver country
  const receiverStatesList = useMemo(() => {
    return getStatesForCountry(receiverCountry) || [];
  }, [receiverCountry]);

  // Clear errors dynamically as user types
  const clearError = (field: string) => {
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  // Indian Pincode Auto-Lookup for Sender
  useEffect(() => {
    const pin = senderPincode.replace(/\D/g, "");
    if (pin.length === 6) {
      const lookupPin = async () => {
        try {
          const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
          if (res.ok) {
            const data = await res.json();
            if (data && data[0]?.Status === "Success" && data[0]?.PostOffice?.length > 0) {
              const po = data[0].PostOffice[0];
              if (!senderDistrict && po.District) setSenderDistrict(po.District);
              if (!senderCity && (po.Block || po.District || po.Name)) {
                setSenderCity(po.Block !== "NA" ? po.Block : po.District);
              }
              if (!senderState && po.State) {
                const matched = INDIAN_STATES_AND_UTS.find(
                  (s) => s.toLowerCase() === po.State.toLowerCase()
                );
                if (matched) setSenderState(matched);
                else setSenderState(po.State);
              }
            }
          }
        } catch (e) {
          // Non-blocking
        }
      };
      lookupPin();
    }
  }, [senderPincode]);

  // Auto-fill sender from address book selection
  const handleSelectSenderAddress = (addrId: string) => {
    setSelectedSenderAddrId(addrId);
    if (!addrId) return;
    const addr = savedAddresses.find((a) => a.id === addrId);
    if (addr) {
      if (addr.contact_name) setSenderName(addr.contact_name);
      if (addr.contact_mobile) setSenderMobile(addr.contact_mobile);
      if (addr.contact_email) setSenderEmail(addr.contact_email);
      setSenderAddress1(addr.address || "");
      if (addr.landmark) setSenderLandmark(addr.landmark);
      if (addr.city) setSenderCity(addr.city);
      if (addr.district) setSenderDistrict(addr.district);
      if (addr.state) setSenderState(addr.state);
      if (addr.pincode) setSenderPincode(addr.pincode);

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

  // Auto-fill receiver from address book selection
  const handleSelectReceiverAddress = (addrId: string) => {
    setSelectedReceiverAddrId(addrId);
    if (!addrId) return;
    const addr = savedAddresses.find((a) => a.id === addrId);
    if (addr) {
      if (addr.contact_name) setReceiverName(addr.contact_name);
      if (addr.contact_mobile) setReceiverMobile(addr.contact_mobile);
      if (addr.contact_email) setReceiverEmail(addr.contact_email);
      if (addr.country) setReceiverCountry(addr.country);
      setReceiverAddress1(addr.address || "");
      if (addr.city) setReceiverCity(addr.city);
      if (addr.state) setReceiverState(addr.state);
      if (addr.pincode) setReceiverPincode(addr.pincode);

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
  // UNIFIED 4-PART FORM VALIDATION LOGIC
  // ----------------------------------------------------
  const validateAll = (): boolean => {
    const newErrors: Record<string, string> = {};

    // PART 1: SENDER DETAILS VALIDATION
    if (!senderName.trim()) {
      newErrors.senderName = "Sender full name is required";
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

    // PART 2: RECEIVER DETAILS VALIDATION
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

    if (!receiverPincode.trim()) {
      newErrors.receiverPincode = "Postal / ZIP Code is required";
    } else if (receiverPincode.trim().length < 3) {
      newErrors.receiverPincode = "Enter a valid postal / ZIP code";
    }

    if (!receiverCountry.trim()) {
      newErrors.receiverCountry = "Destination country is required";
    }

    if (!receiverState.trim()) {
      newErrors.receiverState = "State / Province / Region is required";
    }

    if (!receiverCity.trim()) {
      newErrors.receiverCity = "City is required";
    }

    if (!receiverAddress1.trim()) {
      newErrors.receiverAddress1 = "Address Line 1 is required";
    } else if (receiverAddress1.trim().length < 5) {
      newErrors.receiverAddress1 = "Please enter a complete destination street address (min 5 characters)";
    }

    // PART 3: PARCEL & CUSTOMS ITEMS VALIDATION
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

    // PART 4: REVIEW / ADMIN STEP VALIDATION
    if (isAdminMode && adminShippingCharge) {
      const chargeNum = parseFloat(adminShippingCharge);
      if (isNaN(chargeNum) || chargeNum < 0) {
        newErrors.adminShippingCharge = "Enter a valid non-negative shipping charge";
      }
    }

    setErrors(newErrors);

    // Auto-scroll to first invalid input field if any
    const firstErrorKey = Object.keys(newErrors)[0];
    if (firstErrorKey) {
      const el = document.querySelector(`[name="${firstErrorKey}"], #${firstErrorKey}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        (el as HTMLElement).focus?.();
      }
    }

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!validateAll()) {
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

        // Pre-Printed AWB Sticker & Dispatch Date (§Business / Admin)
        manual_awb: manualAwb.trim() || undefined,
        awb_date: awbDate.trim() || undefined,

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

  // SUCCESS CONFIRMATION SCREEN
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
          <h1 className="text-3xl font-extrabold text-[#030164]">
            Booking #{createdBooking.booking_number}
          </h1>
          {createdAwb && (
            <p className="font-mono text-sm font-bold text-[#2563EB]">
              AWB: {createdAwb}
            </p>
          )}
          {manualAwb && (
            <div className="inline-flex items-center gap-2 font-mono text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg my-1">
              <Barcode className="w-3.5 h-3.5 text-emerald-700" />
              <span>Pre-Printed Tag AWB: {manualAwb} ({awbDate || "Today"})</span>
            </div>
          )}
          <p className="text-sm text-text-secondary max-w-md mx-auto">
            Your international consignment to <strong>{receiverCountry}</strong> has been registered.
            Customs documentation and export dispatch are queued for processing.
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-900 text-left space-y-1">
          <div className="font-bold flex items-center gap-1.5 text-[#030164]">
            <AlertCircle className="w-4 h-4 text-[#2563EB]" /> Next Steps:
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
                <Button variant="primary" size="md" className="bg-[#2563EB] hover:bg-[#1d4ed8] text-white">
                  Track Consignment
                </Button>
              </Link>
              <Button
                variant="outline"
                size="md"
                onClick={() => {
                  setIsSuccess(false);
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

  // ----------------------------------------------------
  // ONE LONG FORM — ALL 4 PARTS VERTICALLY ALIGNED
  // ----------------------------------------------------
  return (
    <div className="space-y-8">
      {/* 4-PART VERTICAL PROGRESS & SECTION JUMP NAVIGATOR */}
      <div className="bg-white/95 border border-slate-200 rounded-2xl p-3 shadow-xs sticky top-20 z-20 backdrop-blur-md">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-semibold">
          {[
            { id: "part-sender", num: "Part 1", label: "Sender Details", icon: User },
            { id: "part-receiver", num: "Part 2", label: "Receiver & Country", icon: Globe },
            { id: "part-customs", num: "Part 3", label: "Customs & Package", icon: Package },
            { id: "part-review", num: "Part 4", label: "Review & Dispatch", icon: CheckCircle2 },
          ].map((part) => {
            const Icon = part.icon;
            return (
              <a
                key={part.id}
                href={`#${part.id}`}
                className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200/80 hover:border-[#030164]/40 hover:bg-slate-50 transition-all text-slate-700 group"
              >
                <div className="w-6 h-6 rounded-lg bg-[#030164]/10 text-[#030164] flex items-center justify-center shrink-0 group-hover:bg-[#030164] group-hover:text-white transition-colors">
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="truncate">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block leading-none">
                    {part.num}
                  </span>
                  <span className="font-bold text-slate-800 text-xs truncate block mt-0.5">
                    {part.label}
                  </span>
                </div>
              </a>
            );
          })}
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-8">
        {/* ============================================================== */}
        {/* TOP OF FORM: PRE-PRINTED AWB STICKER & DISPATCH DATE */}
        {/* ============================================================== */}
        <Card id="part-awb-sticker" className="shadow-md overflow-hidden border-2 border-emerald-500/50 bg-gradient-to-br from-emerald-50/60 via-white to-blue-50/30">
          <div className="bg-gradient-to-r from-emerald-700 via-emerald-800 to-[#030164] text-white p-4 sm:p-5 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-white/10 text-white font-extrabold flex items-center justify-center text-xs border border-white/20">
                <Barcode className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Pre-Printed AWB Sticker & Dispatch Date</span>
                </h3>
                <p className="text-xs text-emerald-100">
                  Required for business & corporate accounts with pre-printed barcode stickers / tags
                </p>
              </div>
            </div>
            <span className="text-xs text-emerald-950 font-bold flex items-center gap-1.5 bg-emerald-200/90 px-3 py-1 rounded-full border border-emerald-300">
              <Tag className="w-3.5 h-3.5 text-emerald-900" /> Pre-Printed Tag
            </span>
          </div>

          <div className="p-5 sm:p-6 space-y-3">
            <p className="text-xs text-slate-600">
              If you have physical pre-printed AWB sticker tags, enter the barcode number and consignment date below to link directly with courier company tracking.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Input
                  label="Pre-Printed AWB Sticker / Barcode Number"
                  name="manualAwb"
                  id="manualAwb"
                  value={manualAwb}
                  onChange={(e) => setManualAwb(e.target.value.toUpperCase())}
                  placeholder="e.g. AWB-98214012 or sticker barcode"
                  helperText="Physical barcode sticker number affixed on parcel"
                />
              </div>

              <div>
                <Input
                  label="AWB Sticker / Dispatch Date"
                  name="awbDate"
                  id="awbDate"
                  type="date"
                  value={awbDate}
                  onChange={(e) => setAwbDate(e.target.value)}
                  helperText="Date of consignment dispatch"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* ============================================================== */}
        {/* PART 1: SENDER INFORMATION (Origin: India) */}
        {/* ============================================================== */}
        <Card id="part-sender" className="shadow-md overflow-hidden border border-slate-200">
          <div className="bg-gradient-to-r from-[#030164] to-[#120e7a] text-white p-4 sm:p-5 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-white/10 text-white font-extrabold flex items-center justify-center text-xs border border-white/20">
                1
              </span>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <User className="w-4 h-4 text-[#2563EB]" />
                  <span>Sender Information (Origin: India)</span>
                </h3>
                <p className="text-xs text-slate-300">
                  Registered Indian pickup hub & export consignor contact details
                </p>
              </div>
            </div>
            {savedAddresses.length > 0 && (
              <span className="text-xs text-white font-semibold flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full border border-white/20">
                <BookMarked className="w-3.5 h-3.5 text-[#2563EB]" /> Address Book Active
              </span>
            )}
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* Saved Address Book Dropdown if available */}
            {savedAddresses.length > 0 && (
              <div className="bg-gradient-to-r from-blue-50/90 to-indigo-50/50 border border-blue-200 rounded-xl p-3.5 space-y-2 shadow-xs">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#030164] flex items-center gap-1.5">
                    <BookMarked className="w-4 h-4 text-[#2563EB]" />
                    Choose from Saved Addresses ({savedAddresses.length})
                  </label>
                  {!isAdminMode && (
                    <Link
                      href="/customer/addresses"
                      target="_blank"
                      className="text-[11px] text-[#2563EB] hover:underline font-medium"
                    >
                      Manage Address Book ↗
                    </Link>
                  )}
                </div>
                <select
                  value={selectedSenderAddrId}
                  onChange={(e) => handleSelectSenderAddress(e.target.value)}
                  className="w-full h-10 px-3 py-1.5 text-xs bg-white border border-blue-300 rounded-lg text-text-primary focus:ring-2 focus:ring-[#030164]/30 font-medium"
                >
                  <option value="">-- Click to select a pickup address and auto-populate --</option>
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
                name="senderName"
                id="senderName"
                value={senderName}
                onChange={(e) => {
                  setSenderName(e.target.value);
                  clearError("senderName");
                }}
                placeholder="e.g. Ramesh Sharma"
                error={errors.senderName}
                required
              />
              <Input
                label="Sender Mobile Number"
                name="senderMobile"
                id="senderMobile"
                type="tel"
                maxLength={10}
                value={senderMobile}
                onChange={(e) => {
                  setSenderMobile(e.target.value);
                  clearError("senderMobile");
                }}
                placeholder="10-digit Indian mobile"
                helperText="Origin dispatch updates & pickup verification"
                error={errors.senderMobile}
                required
              />
              <div className="sm:col-span-2">
                <Input
                  label="Sender Email (Optional)"
                  name="senderEmail"
                  id="senderEmail"
                  type="email"
                  value={senderEmail}
                  onChange={(e) => {
                    setSenderEmail(e.target.value);
                    clearError("senderEmail");
                  }}
                  placeholder="sender@example.com"
                  error={errors.senderEmail}
                />
              </div>
              <div className="sm:col-span-2">
                <Input
                  label="Pickup Street Address Line 1"
                  name="senderAddress1"
                  id="senderAddress1"
                  value={senderAddress1}
                  onChange={(e) => {
                    setSenderAddress1(e.target.value);
                    clearError("senderAddress1");
                  }}
                  placeholder="Plot/Flat number, building, street address"
                  error={errors.senderAddress1}
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <Input
                  label="Address Line 2 (Optional)"
                  name="senderAddress2"
                  value={senderAddress2}
                  onChange={(e) => setSenderAddress2(e.target.value)}
                  placeholder="Suite, floor, area details"
                />
              </div>
              <div className="sm:col-span-2">
                <Input
                  label="Landmark (Optional)"
                  name="senderLandmark"
                  value={senderLandmark}
                  onChange={(e) => setSenderLandmark(e.target.value)}
                  placeholder="Near landmark / hub"
                />
              </div>

              <Input
                label="City"
                name="senderCity"
                id="senderCity"
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
                name="senderDistrict"
                value={senderDistrict}
                onChange={(e) => setSenderDistrict(e.target.value)}
                placeholder="District"
              />

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-text-primary">
                  State / Union Territory <span className="text-status-danger">*</span>
                </label>
                <select
                  name="senderState"
                  id="senderState"
                  value={senderState}
                  onChange={(e) => {
                    setSenderState(e.target.value);
                    clearError("senderState");
                  }}
                  className={`w-full h-11 px-3 py-2 text-sm bg-surface-base border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#030164] ${
                    errors.senderState ? "border-status-danger" : "border-border-default"
                  }`}
                >
                  <option value="">-- Select Indian State / UT --</option>
                  {INDIAN_STATES_AND_UTS.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
                {errors.senderState && (
                  <p className="text-xs text-status-danger">{errors.senderState}</p>
                )}
              </div>

              <Input
                label="Pincode"
                name="senderPincode"
                id="senderPincode"
                type="text"
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
                  className="w-4 h-4 rounded text-[#030164] focus:ring-[#030164] border-border-default"
                />
                <span className="flex items-center gap-1.5">
                  <BookmarkCheck className="w-3.5 h-3.5 text-[#2563EB]" />
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
        </Card>

        {/* ============================================================== */}
        {/* PART 2: RECEIVER / DESTINATION (International) */}
        {/* ============================================================== */}
        <Card id="part-receiver" className="shadow-md overflow-hidden border border-slate-200">
          <div className="bg-gradient-to-r from-[#030164] to-[#120e7a] text-white p-4 sm:p-5 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-white/10 text-white font-extrabold flex items-center justify-center text-xs border border-white/20">
                2
              </span>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[#2563EB]" />
                  <span>Receiver & Destination Information</span>
                </h3>
                <p className="text-xs text-slate-300">
                  Global recipient door delivery address and destination customs details
                </p>
              </div>
            </div>
            {savedAddresses.length > 0 && (
              <span className="text-xs text-white font-semibold flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full border border-white/20">
                <BookMarked className="w-3.5 h-3.5 text-[#2563EB]" /> Address Book Active
              </span>
            )}
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* Saved Address Book Dropdown for Receiver */}
            {savedAddresses.length > 0 && (
              <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/50 border border-blue-200 rounded-xl p-3.5 space-y-2 shadow-xs">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#030164] flex items-center gap-1.5">
                    <BookMarked className="w-4 h-4 text-[#2563EB]" />
                    Choose from Saved Recipients ({savedAddresses.length})
                  </label>
                </div>
                <select
                  value={selectedReceiverAddrId}
                  onChange={(e) => handleSelectReceiverAddress(e.target.value)}
                  className="w-full h-10 px-3 py-1.5 text-xs bg-white border border-blue-300 rounded-lg text-text-primary focus:ring-2 focus:ring-[#030164]/30 font-medium"
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
                name="receiverName"
                id="receiverName"
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
                label="Recipient Phone Number (with Country Dial Code)"
                name="receiverMobile"
                id="receiverMobile"
                type="tel"
                value={receiverMobile}
                onChange={(e) => {
                  setReceiverMobile(e.target.value);
                  clearError("receiverMobile");
                }}
                placeholder="e.g. +1 415 555 2671"
                helperText="Required by foreign courier for delivery alerts & OTP"
                error={errors.receiverMobile}
                required
              />
              <div className="sm:col-span-2">
                <Input
                  label="Recipient Email Address (Optional)"
                  name="receiverEmail"
                  id="receiverEmail"
                  type="email"
                  value={receiverEmail}
                  onChange={(e) => {
                    setReceiverEmail(e.target.value);
                    clearError("receiverEmail");
                  }}
                  placeholder="recipient@company.com"
                  helperText="Customs invoices & real-time tracking will be emailed to recipient"
                  error={errors.receiverEmail}
                />
              </div>

              {/* 1. Postal / ZIP Code */}
              <div>
                <Input
                  label="Postal / ZIP Code"
                  name="receiverPincode"
                  id="receiverPincode"
                  value={receiverPincode}
                  onChange={(e) => {
                    setReceiverPincode(e.target.value);
                    clearError("receiverPincode");
                  }}
                  placeholder="e.g. 94103, SW1A 1AA, 75008"
                  error={errors.receiverPincode}
                  required
                />
              </div>

              {/* 2. Destination Country Selector */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-text-primary">
                  Destination Country <span className="text-status-danger">*</span>
                </label>
                <select
                  name="receiverCountry"
                  id="receiverCountry"
                  value={receiverCountry}
                  onChange={(e) => {
                    setReceiverCountry(e.target.value);
                    setReceiverState("");
                    clearError("receiverCountry");
                  }}
                  className={`w-full h-11 px-3 py-2 text-sm bg-surface-base border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#030164] ${
                    errors.receiverCountry ? "border-status-danger" : "border-border-default"
                  }`}
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.name}>
                      {c.name} ({c.phoneCode})
                    </option>
                  ))}
                </select>
                {errors.receiverCountry && (
                  <p className="text-xs text-status-danger">{errors.receiverCountry}</p>
                )}
              </div>

              {/* 3. State / Province / Region */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-text-primary">
                  State / Province / Region <span className="text-status-danger">*</span>
                </label>
                {receiverStatesList.length > 0 ? (
                  <select
                    name="receiverState"
                    id="receiverState"
                    value={receiverState}
                    onChange={(e) => {
                      setReceiverState(e.target.value);
                      clearError("receiverState");
                    }}
                    className={`w-full h-11 px-3 py-2 text-sm bg-surface-base border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#030164] ${
                      errors.receiverState ? "border-status-danger" : "border-border-default"
                    }`}
                  >
                    <option value="">-- Select Province / State --</option>
                    {receiverStatesList.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                ) : (
                  <Input
                    name="receiverState"
                    id="receiverState"
                    value={receiverState}
                    onChange={(e) => {
                      setReceiverState(e.target.value);
                      clearError("receiverState");
                    }}
                    placeholder="e.g. California, Ontario, Bavaria"
                    error={errors.receiverState}
                    required
                  />
                )}
                {errors.receiverState && (
                  <p className="text-xs text-status-danger">{errors.receiverState}</p>
                )}
              </div>

              {/* 4. City */}
              <div>
                <Input
                  label="Destination City"
                  name="receiverCity"
                  id="receiverCity"
                  value={receiverCity}
                  onChange={(e) => {
                    setReceiverCity(e.target.value);
                    clearError("receiverCity");
                  }}
                  placeholder="e.g. San Francisco, London, Dubai"
                  error={errors.receiverCity}
                  required
                />
              </div>

              {/* 5. Address Line 1 */}
              <div className="sm:col-span-2">
                <Input
                  label="Street Address Line 1"
                  name="receiverAddress1"
                  id="receiverAddress1"
                  value={receiverAddress1}
                  onChange={(e) => {
                    setReceiverAddress1(e.target.value);
                    clearError("receiverAddress1");
                  }}
                  placeholder="Building/House number, Street name, Avenue"
                  error={errors.receiverAddress1}
                  required
                />
              </div>

              {/* 6. Address Line 2 */}
              <div className="sm:col-span-2">
                <Input
                  label="Address Line 2 (Optional)"
                  name="receiverAddress2"
                  value={receiverAddress2}
                  onChange={(e) => setReceiverAddress2(e.target.value)}
                  placeholder="Apartment, suite, unit, building, floor, etc."
                />
              </div>
            </div>

            {/* Option to Save Recipient Address */}
            <div className="pt-3 border-t border-border-default/60 space-y-2 bg-surface-subtle/50 p-3 rounded-xl">
              <label className="flex items-center gap-2 text-xs font-semibold text-text-primary cursor-pointer">
                <input
                  type="checkbox"
                  checked={saveReceiverAddress}
                  onChange={(e) => setSaveReceiverAddress(e.target.checked)}
                  className="w-4 h-4 rounded text-[#030164] focus:ring-[#030164] border-border-default"
                />
                <span className="flex items-center gap-1.5">
                  <BookmarkCheck className="w-3.5 h-3.5 text-[#2563EB]" />
                  Save this recipient address to Address Book
                </span>
              </label>
              {saveReceiverAddress && (
                <div className="pl-6 pt-1 max-w-sm animate-in fade-in">
                  <Input
                    label="Address Label / Nickname"
                    value={receiverAddressLabel}
                    onChange={(e) => setReceiverAddressLabel(e.target.value)}
                    placeholder="e.g. US Client, London Office"
                  />
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* ============================================================== */}
        {/* PART 3: PACKAGE, CUSTOMS & COMMERCIAL INVOICE */}
        {/* ============================================================== */}
        <Card id="part-customs" className="shadow-md overflow-hidden border border-slate-200">
          <div className="bg-gradient-to-r from-[#030164] to-[#120e7a] text-white p-4 sm:p-5 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-white/10 text-white font-extrabold flex items-center justify-center text-xs border border-white/20">
                3
              </span>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Package className="w-4 h-4 text-[#2563EB]" />
                  <span>Customs Declaration, Commercial Invoice & Parcel Specs</span>
                </h3>
                <p className="text-xs text-slate-300">
                  Itemized declaration for international clearance, multi-currency valuation & physical package dimensions
                </p>
              </div>
            </div>

            {/* Currency Selector Pill */}
            <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl border border-white/20">
              <DollarSign className="w-4 h-4 text-[#2563EB]" />
              <span className="text-xs font-semibold text-slate-200">Declared Currency:</span>
              <div className="inline-flex rounded-lg bg-white/20 p-0.5">
                <button
                  type="button"
                  onClick={() => setCurrency("USD")}
                  className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
                    currency === "USD"
                      ? "bg-white text-[#030164] shadow-xs"
                      : "text-white/80 hover:text-white"
                  }`}
                >
                  USD ($)
                </button>
                <button
                  type="button"
                  onClick={() => setCurrency("INR")}
                  className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
                    currency === "INR"
                      ? "bg-white text-[#030164] shadow-xs"
                      : "text-white/80 hover:text-white"
                  }`}
                >
                  INR (₹)
                </button>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* Live Exchange Rate & Conversion Banner */}
            <div className="flex items-center justify-between flex-wrap gap-2 p-3 bg-blue-50/80 border border-blue-200 rounded-xl text-xs text-blue-900">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#2563EB]" />
                <span>
                  Live Central Bank Exchange Rate: <strong>$1.00 USD = ₹{exchangeRate.toFixed(2)} INR</strong>
                </span>
              </div>
              <div className="font-semibold text-slate-700">
                Total Customs Value:{" "}
                <span className="font-mono font-bold text-[#030164] text-sm">
                  {currency === "USD"
                    ? `$${totalDeclaredValue.toFixed(2)} USD (≈ ₹${totalDeclaredInrEquivalent.toLocaleString()} INR)`
                    : `₹${totalDeclaredValue.toLocaleString()} INR (≈ $${(totalDeclaredValue / exchangeRate).toFixed(2)} USD)`}
                </span>
              </div>
            </div>

            {/* International Commercial Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-text-primary mb-1.5">
                  Service Level <span className="text-status-danger">*</span>
                </label>
                <select
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  className="w-full h-11 px-3 py-2 text-xs bg-surface-base border border-border-default rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-[#030164] font-medium"
                >
                  <option value="Express Worldwide (3-5 Days)">Express Worldwide (3-5 Days)</option>
                  <option value="Priority Air Freight (2-4 Days)">Priority Air Freight (2-4 Days)</option>
                  <option value="Economy Air Cargo (5-8 Days)">Economy Air Cargo (5-8 Days)</option>
                </select>
              </div>

              <div>
                <Input
                  label="Commercial Invoice No. (Optional)"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  placeholder="e.g. INV-2026-0891"
                  helperText="Leave empty to auto-generate"
                />
              </div>

              <div>
                <Input
                  label="Invoice Date"
                  type="date"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                />
              </div>

              <div>
                <Input
                  label="IOSS / VAT / Tax ID (Optional)"
                  value={iossNumber}
                  onChange={(e) => setIossNumber(e.target.value)}
                  placeholder="e.g. IM1234567890"
                  helperText="For EU / UK customs expedited tax clearance"
                />
              </div>
            </div>

            {/* Itemized Line Items Table */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h4 className="text-sm font-bold text-text-primary flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-[#2563EB]" />
                    Itemized Commercial Line Items (Customs Declaration)
                  </h4>
                  <p className="text-xs text-text-muted">
                    List every unique product in consignment with unit price in {currency}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addLineItem}
                  className="text-xs flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Product Item
                </Button>
              </div>

              {errors.lineItems && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errors.lineItems}</span>
                </div>
              )}

              <div className="overflow-x-auto border border-border-default rounded-xl bg-surface-base">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface-subtle border-b border-border-default text-text-secondary uppercase text-[10px] tracking-wider font-bold">
                    <tr>
                      <th className="p-3">#</th>
                      <th className="p-3 min-w-[160px]">Product Description *</th>
                      <th className="p-3 min-w-[100px]">SKU / Ref</th>
                      <th className="p-3 w-20">Qty *</th>
                      <th className="p-3 w-28">Unit Price ({currency}) *</th>
                      <th className="p-3 min-w-[100px]">HSN Code</th>
                      <th className="p-3 w-20">Tax %</th>
                      <th className="p-3 w-24 text-right">Subtotal</th>
                      <th className="p-3 w-10 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-default">
                    {lineItems.map((item, index) => (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-3 font-mono text-text-muted">{index + 1}</td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => handleLineItemChange(index, "name", e.target.value)}
                            placeholder="e.g. Cotton Garments, Circuit Board"
                            className="w-full h-9 px-2.5 rounded-lg border border-border-default text-xs focus:ring-1 focus:ring-[#030164] bg-white"
                            required
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={item.sku}
                            onChange={(e) => handleLineItemChange(index, "sku", e.target.value)}
                            placeholder="SKU-102"
                            className="w-full h-9 px-2.5 rounded-lg border border-border-default text-xs focus:ring-1 focus:ring-[#030164] bg-white font-mono"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                              handleLineItemChange(index, "quantity", Math.max(1, parseInt(e.target.value) || 1))
                            }
                            className="w-full h-9 px-2 rounded-lg border border-border-default text-xs focus:ring-1 focus:ring-[#030164] bg-white text-center font-bold"
                          />
                        </td>
                        <td className="p-2">
                          <div className="relative">
                            <span className="absolute left-2.5 top-2 text-[10px] text-text-muted font-bold">
                              {currency === "USD" ? "$" : "₹"}
                            </span>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.unit_price || ""}
                              onChange={(e) =>
                                handleLineItemChange(index, "unit_price", parseFloat(e.target.value) || 0)
                              }
                              placeholder="0.00"
                              className="w-full h-9 pl-6 pr-2 rounded-lg border border-border-default text-xs focus:ring-1 focus:ring-[#030164] bg-white font-mono text-right font-medium"
                            />
                          </div>
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={item.hsn_code}
                            onChange={(e) => handleLineItemChange(index, "hsn_code", e.target.value)}
                            placeholder="e.g. 6204"
                            className="w-full h-9 px-2.5 rounded-lg border border-border-default text-xs focus:ring-1 focus:ring-[#030164] bg-white font-mono"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={item.tax_rate || ""}
                            onChange={(e) =>
                              handleLineItemChange(index, "tax_rate", parseFloat(e.target.value) || 0)
                            }
                            placeholder="0"
                            className="w-full h-9 px-2 rounded-lg border border-border-default text-xs focus:ring-1 focus:ring-[#030164] bg-white text-center"
                          />
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-text-primary whitespace-nowrap">
                          {currency === "USD" ? `$${item.total.toFixed(2)}` : `₹${item.total.toLocaleString()}`}
                        </td>
                        <td className="p-2 text-center">
                          {lineItems.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeLineItem(index)}
                              className="text-text-muted hover:text-rose-600 p-1.5 rounded-lg transition-colors"
                              title="Delete line item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-surface-subtle font-bold border-t border-border-default">
                    <tr>
                      <td colSpan={7} className="p-3 text-right text-text-secondary uppercase text-[11px]">
                        Total Customs Valuation:
                      </td>
                      <td className="p-3 text-right font-mono text-sm text-[#030164] whitespace-nowrap">
                        {currency === "USD"
                          ? `$${totalDeclaredValue.toFixed(2)} USD`
                          : `₹${totalDeclaredValue.toLocaleString()} INR`}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Parcel Physical Details */}
            <div className="pt-4 border-t border-border-default space-y-4">
              <h4 className="text-sm font-bold text-text-primary flex items-center gap-1.5">
                <Package className="w-4 h-4 text-emerald-600" />
                Physical Package Dimensions & Specifications
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="block text-sm font-medium text-text-primary">
                    Consignment Category <span className="text-status-danger">*</span>
                  </label>
                  <select
                    value={parcelType}
                    onChange={(e) => setParcelType(e.target.value)}
                    className="w-full h-11 px-3 py-2 text-sm bg-surface-base border border-border-default rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-[#030164]"
                  >
                    <option value="Commercial Merchandise">Commercial Merchandise (Standard Export)</option>
                    <option value="Documents / Legal Files">Documents / Legal Files (Air Courier)</option>
                    <option value="Commercial Samples">Commercial Samples (No Commercial Value)</option>
                    <option value="Personal Effects">Personal Effects / Household Relocation</option>
                    <option value="Gift Consignment">Gift Consignment</option>
                  </select>
                </div>

                <div>
                  <Input
                    label="Actual Weight (KG)"
                    name="weightKg"
                    id="weightKg"
                    type="number"
                    step="0.01"
                    min="0.1"
                    value={weightKg}
                    onChange={(e) => {
                      setWeightKg(e.target.value);
                      clearError("weightKg");
                    }}
                    placeholder="e.g. 1.5"
                    helperText="Actual scale weight in kilograms"
                    error={errors.weightKg}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-text-primary">
                    Volumetric Weight (Estimated)
                  </label>
                  <div className="h-11 px-3 flex items-center bg-surface-subtle border border-border-default rounded-lg text-xs font-mono font-bold text-text-secondary">
                    {volumetricWeightKg ? `${volumetricWeightKg} kg (L×W×H / 5000)` : "Enter L, W, H below"}
                  </div>
                </div>
              </div>

              {/* Dimensions: Length, Width, Height */}
              <div className="grid grid-cols-3 gap-3">
                <Input
                  label="Length (cm)"
                  name="lengthCm"
                  id="lengthCm"
                  type="number"
                  min="1"
                  value={lengthCm}
                  onChange={(e) => {
                    setLengthCm(e.target.value);
                    clearError("lengthCm");
                  }}
                  placeholder="e.g. 25"
                  error={errors.lengthCm}
                  required
                />
                <Input
                  label="Width (cm)"
                  name="widthCm"
                  id="widthCm"
                  type="number"
                  min="1"
                  value={widthCm}
                  onChange={(e) => {
                    setWidthCm(e.target.value);
                    clearError("widthCm");
                  }}
                  placeholder="e.g. 15"
                  error={errors.widthCm}
                  required
                />
                <Input
                  label="Height (cm)"
                  name="heightCm"
                  id="heightCm"
                  type="number"
                  min="1"
                  value={heightCm}
                  onChange={(e) => {
                    setHeightCm(e.target.value);
                    clearError("heightCm");
                  }}
                  placeholder="e.g. 10"
                  error={errors.heightCm}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-text-primary">
                  Detailed Contents / Customs Description <span className="text-status-danger">*</span>
                </label>
                <textarea
                  name="description"
                  id="description"
                  rows={2}
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    clearError("description");
                  }}
                  placeholder="Provide an exact, non-generic description of contents for customs agents (e.g. 5x Cotton Men's T-Shirts, 2x Bluetooth Headphones)."
                  className={`w-full p-3 text-sm bg-surface-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#030164] transition-colors ${
                    errors.description ? "border-status-danger" : "border-border-default"
                  }`}
                  required
                />
                {errors.description && (
                  <p className="text-xs text-status-danger">{errors.description}</p>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* ============================================================== */}
        {/* PART 4: CONSIGNMENT SUMMARY, DISPATCH & SUBMISSION */}
        {/* ============================================================== */}
        <Card id="part-review" className="shadow-md overflow-hidden border border-slate-200">
          <div className="bg-gradient-to-r from-[#030164] to-[#120e7a] text-white p-4 sm:p-5 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-white/10 text-white font-extrabold flex items-center justify-center text-xs border border-white/20">
                4
              </span>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#2563EB]" />
                  <span>Consignment Summary & Final Dispatch Confirmation</span>
                </h3>
                <p className="text-xs text-slate-300">
                  Verify foreign destination, customs documentation & submit consignment booking
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* Live Verification Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Sender Summary Card */}
              <div className="p-4 bg-surface-subtle rounded-xl border border-border-default space-y-2 text-xs">
                <div className="flex items-center justify-between border-b border-border-default pb-2">
                  <span className="font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
                    <User className="w-3.5 h-3.5 text-[#030164]" /> 1. Sender (Origin: India)
                  </span>
                  <a href="#part-sender" className="text-[11px] text-[#2563EB] font-semibold hover:underline">
                    Edit
                  </a>
                </div>
                <div className="font-bold text-sm text-text-primary">{senderName || "— (Name required)"}</div>
                <div className="text-text-secondary leading-relaxed">{senderAddress1 || "—"}</div>
                {senderAddress2 && <div className="text-text-secondary">{senderAddress2}</div>}
                {senderLandmark && (
                  <div className="text-[11px] text-text-muted">
                    <span className="font-semibold text-text-secondary">Landmark:</span> {senderLandmark}
                  </div>
                )}
                <div className="font-semibold text-text-primary">
                  {senderCity || "City"}
                  {senderDistrict ? `, ${senderDistrict}` : ""}
                  {senderState ? `, ${senderState}` : ""} - {senderPincode || "Pincode"}, India
                </div>
                <div className="text-text-muted pt-1 border-t border-border-default/60 space-y-0.5">
                  <div>
                    <span className="font-medium text-text-secondary">Mobile:</span> +91 {senderMobile || "—"}
                  </div>
                  {senderEmail && (
                    <div>
                      <span className="font-medium text-text-secondary">Email:</span> {senderEmail}
                    </div>
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

              {/* Receiver Summary Card */}
              <div className="p-4 bg-surface-subtle rounded-xl border border-border-default space-y-2 text-xs">
                <div className="flex items-center justify-between border-b border-border-default pb-2">
                  <span className="font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
                    <Globe className="w-3.5 h-3.5 text-[#2563EB]" /> 2. Receiver (Destination: Abroad)
                  </span>
                  <a href="#part-receiver" className="text-[11px] text-[#2563EB] font-semibold hover:underline">
                    Edit
                  </a>
                </div>
                <div className="font-bold text-sm text-text-primary">{receiverName || "— (Name required)"}</div>
                <div className="text-text-secondary leading-relaxed">{receiverAddress1 || "—"}</div>
                {receiverAddress2 && <div className="text-text-secondary">{receiverAddress2}</div>}
                <div className="font-semibold text-text-primary">
                  {receiverCity || "City"}, {receiverState || "State"} ({receiverPincode || "Postal Code"})
                </div>
                <div className="font-bold text-[#030164]">{receiverCountry}</div>
                <div className="text-text-muted pt-1 border-t border-border-default/60 space-y-0.5">
                  <div>
                    <span className="font-medium text-text-secondary">Phone:</span> {receiverMobile || "—"}
                  </div>
                  {receiverEmail && (
                    <div>
                      <span className="font-medium text-text-secondary">Email:</span> {receiverEmail}
                    </div>
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
                <a href="#part-customs" className="text-[11px] text-[#2563EB] font-semibold hover:underline">
                  Edit
                </a>
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
                    {lengthCm && widthCm && heightCm ? `${lengthCm} × ${widthCm} × ${heightCm} cm` : "—"}
                  </span>
                </div>
                <div>
                  <span className="text-text-muted block">Total Customs Value:</span>
                  <span className="font-mono font-bold text-[#030164] text-sm">
                    {currency === "USD" ? `$${totalDeclaredValue.toFixed(2)} USD` : `₹${totalDeclaredValue.toLocaleString()} INR`}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-border-default/60 flex items-center justify-between flex-wrap gap-2">
                <div>
                  <span className="text-text-muted">Description: </span>
                  <span className="text-text-primary font-medium">{description || "—"}</span>
                </div>
                <div>
                  <span className="text-text-muted">Service Level: </span>
                  <span className="font-bold text-[#030164]">{serviceType}</span>
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

              {/* Pre-Printed Sticker Tag in Summary */}
              {manualAwb && (
                <div className="pt-2 border-t border-border-default/60 flex items-center justify-between flex-wrap gap-2 bg-emerald-50/70 p-2.5 rounded-lg border border-emerald-200">
                  <div className="flex items-center gap-2">
                    <Barcode className="w-4 h-4 text-emerald-700" />
                    <span className="font-semibold text-emerald-900">Pre-Printed Tag AWB:</span>
                    <span className="font-mono font-bold text-emerald-800">{manualAwb}</span>
                  </div>
                  <span className="text-[11px] text-emerald-700 font-medium">Sticker Date: {awbDate || "Today"}</span>
                </div>
              )}
            </div>

            {/* Admin-only Allocation Controls (if in admin mode) */}
            {isAdminMode && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                  <Truck className="w-4 h-4 text-[#030164]" />
                  <h4 className="font-bold text-xs uppercase tracking-wider text-[#030164]">
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
                      className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#030164]"
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
                    <div className="flex rounded-lg border border-slate-300 focus-within:ring-1 focus-within:ring-[#030164] overflow-hidden bg-white">
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

            {/* International Customs Notice Banner */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-[#2563EB] shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-[#030164]">International Customs & Freight Notice:</div>
                <p className="mt-0.5 leading-relaxed">
                  Final freight charges and customs export clearances will be confirmed upon package physical intake & weighing.
                  Destination customs duties (if assessed) are subject to destination country import tariffs.
                </p>
              </div>
            </div>

            {/* Global Validation & Submission Error Alert */}
            {Object.keys(errors).length > 0 && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-3 animate-in fade-in">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-rose-900">Please complete all required fields:</div>
                  <ul className="list-disc list-inside mt-1 space-y-0.5 text-rose-700">
                    {Object.entries(errors).slice(0, 4).map(([field, msg]) => (
                      <li key={field}>{msg}</li>
                    ))}
                    {Object.keys(errors).length > 4 && (
                      <li>...and {Object.keys(errors).length - 4} other field(s)</li>
                    )}
                  </ul>
                </div>
              </div>
            )}

            {apiError && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-3 animate-in fade-in">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-rose-900">Submission Error</div>
                  <p className="mt-0.5">{apiError}</p>
                </div>
              </div>
            )}

            {/* Final Action Button */}
            <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-500">
                <span>By submitting, you agree to our </span>
                <Link href="/terms" target="_blank" className="text-[#2563EB] hover:underline font-semibold">
                  International Carriage Terms
                </Link>
                <span> and Customs Regulations.</span>
              </div>

              <Button
                type="submit"
                variant="accent"
                size="lg"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-[#030164] to-[#2563EB] hover:from-[#02004a] hover:to-[#1d4ed8] text-white font-extrabold text-sm rounded-xl shadow-lg shadow-[#030164]/20 hover:shadow-xl transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing Consignment...</span>
                  </>
                ) : (
                  <>
                    <Plane className="w-4 h-4" />
                    <span>
                      {isAdminMode
                        ? "Confirm & Dispatch International Shipment"
                        : "Confirm & Submit International Booking"}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>
      </form>
    </div>
  );
}
