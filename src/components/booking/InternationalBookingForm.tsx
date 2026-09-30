"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { COUNTRIES, getCountry, getStatesForCountry, CountryInfo } from "@/lib/countries";
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
  Info,
  Loader2,
} from "lucide-react";

export interface LineItem {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  unit_price: number; // In selected currency (Rupees or Dollars)
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
  const [currency, setCurrency] = useState<"INR" | "USD">("USD");
  const [exchangeRate, setExchangeRate] = useState<number>(84.0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
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
  const [receiverCountry, setReceiverCountry] = useState("United States");
  const [receiverAddress1, setReceiverAddress1] = useState("");
  const [receiverAddress2, setReceiverAddress2] = useState("");
  const [receiverAddress3, setReceiverAddress3] = useState("");
  const [receiverCity, setReceiverCity] = useState("");
  const [receiverState, setReceiverState] = useState("");
  const [receiverPincode, setReceiverPincode] = useState("");

  // Commercial Customs & Invoicing (§2)
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
        // fallback to default 84.0
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
    const states = getStatesForCountry(countryName);
    if (states && states.length > 0) {
      setReceiverState(states[0]);
    } else {
      setReceiverState("");
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
      setReceiverAddress1(addr.address || "");
      setReceiverAddress2(addr.address_line_2 || "");
      setReceiverAddress3(addr.address_line_3 || "");
      setReceiverCity(addr.city || "");
      setReceiverPincode(addr.pincode || "");
      if (addr.country) {
        setReceiverCountry(addr.country);
      }
      setReceiverState(addr.state || "");
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      // 1. Validations
      if (!senderName.trim()) throw new Error("Please enter Sender Contact Name.");
      if (!senderMobile.trim()) throw new Error("Please enter Sender Mobile Number.");
      if (!senderAddress1.trim()) throw new Error("Please enter Sender Address Line 1.");
      if (!senderCity.trim()) throw new Error("Please enter Sender City.");
      if (!senderState.trim()) throw new Error("Please select Sender State / UT.");
      if (!senderPincode.trim()) throw new Error("Please enter Sender Pincode.");

      if (!receiverName.trim()) throw new Error("Please enter Receiver Contact Name.");
      if (!receiverMobile.trim()) throw new Error("Please enter Receiver Mobile / Phone Number.");
      if (!receiverCountry.trim()) throw new Error("Please select Receiver Country.");
      if (!receiverAddress1.trim()) throw new Error("Please enter Receiver Address Line 1.");
      if (!receiverCity.trim()) throw new Error("Please enter Receiver City.");
      if (!receiverState.trim()) throw new Error("Please enter/select Receiver State or Province.");
      if (!receiverPincode.trim()) throw new Error("Please enter Receiver Postal / ZIP Code.");

      if (!description.trim()) throw new Error("Please provide a general consignment description.");
      if (!weightKg || parseFloat(weightKg) <= 0) throw new Error("Please enter a valid package weight.");

      const validItems = lineItems.filter((i) => i.name.trim().length > 0);
      if (validItems.length === 0) {
        throw new Error("Please enter at least one line item with description and price.");
      }

      // Convert declared value to smallest unit (cents for USD, paise for INR)
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
        receiver_address_3: receiverAddress3.trim() || undefined,
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

      // If in admin mode and a courier is selected with shipping charge, approve immediately (§18)
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
      setErrorMsg(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess && createdBooking) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 text-center space-y-5 animate-in fade-in duration-300">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-[#002B49]">International Booking Created!</h2>
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl max-w-sm mx-auto">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            Consignment Tracking ID
          </p>
          <p className="font-mono text-xl font-black text-[#002B49]">
            {createdBooking.booking_number}
          </p>
          {createdAwb && (
            <p className="text-xs font-mono font-bold text-[#FF6B00] mt-1">
              AWB: {createdAwb}
            </p>
          )}
        </div>
        <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
          Your international booking to <strong>{receiverCountry}</strong> has been registered.
          Customs declarations and manifest documentation are ready for processing.
        </p>
        <div className="flex justify-center gap-3 pt-2">
          {isAdminMode ? (
            <>
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
                  setCreatedBooking(null);
                  setCreatedAwb(null);
                }}
              >
                Create Another Booking
              </Button>
            </>
          ) : (
            <>
              <Link href={`/track?number=${createdBooking.booking_number}`}>
                <Button variant="primary" size="sm">
                  Track Consignment
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline" size="sm">
                  Return Home
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-500" />
          <div className="flex-1 font-medium">{errorMsg}</div>
        </div>
      )}

      {/* 1. CURRENCY SELECTOR (§3) */}
      <Card className="p-5 border border-slate-200 rounded-2xl shadow-xs bg-gradient-to-r from-slate-50 via-white to-orange-50/30">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#002B49] uppercase tracking-wider">
              <DollarSign className="w-4 h-4 text-[#FF6B00]" />
              Declared Valuation Currency
            </span>
            <p className="text-xs text-slate-500 mt-0.5">
              Select the currency used for customs invoice valuation and freight billing.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="inline-flex p-1 rounded-xl bg-slate-200/80">
              <button
                type="button"
                onClick={() => setCurrency("USD")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  currency === "USD"
                    ? "bg-[#002B49] text-white shadow-xs"
                    : "text-slate-700 hover:text-black"
                }`}
              >
                USD ($)
              </button>
              <button
                type="button"
                onClick={() => setCurrency("INR")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  currency === "INR"
                    ? "bg-[#FF6B00] text-white shadow-xs"
                    : "text-slate-700 hover:text-black"
                }`}
              >
                INR (₹)
              </button>
            </div>
            <div className="text-[11px] font-semibold text-slate-600 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
              1 USD ≈ ₹{exchangeRate.toFixed(2)} INR
            </div>
          </div>
        </div>
      </Card>

      {/* 2. SENDER DETAILS (Origin = India) */}
      <Card className="p-6 border border-slate-200 rounded-2xl shadow-xs">
        <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-100 text-[#FF6B00] flex items-center justify-center font-bold">
              1
            </div>
            <div>
              <h3 className="font-bold text-base text-[#002B49]">Sender / Origin Details</h3>
              <p className="text-xs text-slate-500">Dispatch origin from India</p>
            </div>
          </div>

          {/* Saved Address Book Selector for Sender */}
          {savedAddresses.length > 0 && (
            <div className="w-48 sm:w-64">
              <select
                value={selectedSenderAddrId}
                onChange={(e) => handleSelectSenderAddress(e.target.value)}
                className="w-full text-xs py-1.5 px-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#FF6B00]"
              >
                <option value="">Choose saved address...</option>
                {savedAddresses.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.label} ({a.city})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Sender Name <span className="text-red-500">*</span>
            </label>
            <Input
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              placeholder="e.g. Ramesh Kumar"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Mobile Number <span className="text-red-500">*</span>
            </label>
            <Input
              value={senderMobile}
              onChange={(e) => setSenderMobile(e.target.value)}
              placeholder="10-digit mobile"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
            <Input
              type="email"
              value={senderEmail}
              onChange={(e) => setSenderEmail(e.target.value)}
              placeholder="name@domain.com"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Street Address (Line 1) <span className="text-red-500">*</span>
            </label>
            <Input
              value={senderAddress1}
              onChange={(e) => setSenderAddress1(e.target.value)}
              placeholder="House/Plot No., Street, Area"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Address Line 2 (Optional)</label>
            <Input
              value={senderAddress2}
              onChange={(e) => setSenderAddress2(e.target.value)}
              placeholder="Suite, Building, Floor"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              City <span className="text-red-500">*</span>
            </label>
            <Input
              value={senderCity}
              onChange={(e) => setSenderCity(e.target.value)}
              placeholder="e.g. Jaipur"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              State / Union Territory <span className="text-red-500">*</span>
            </label>
            <select
              value={senderState}
              onChange={(e) => setSenderState(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
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
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Postal PIN Code <span className="text-red-500">*</span>
            </label>
            <Input
              value={senderPincode}
              onChange={(e) => setSenderPincode(e.target.value)}
              placeholder="6-digit PIN"
              required
            />
          </div>
        </div>

        {/* Save Address Option */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
            <input
              type="checkbox"
              checked={saveSenderAddress}
              onChange={(e) => setSaveSenderAddress(e.target.checked)}
              className="w-4 h-4 rounded text-[#FF6B00] focus:ring-[#FF6B00]"
            />
            <span>Save this address to Address Book</span>
          </label>
          {saveSenderAddress && (
            <input
              type="text"
              value={senderAddressLabel}
              onChange={(e) => setSenderAddressLabel(e.target.value)}
              placeholder="Label: e.g. Factory Dispatch, Office"
              className="text-xs py-1 px-2.5 rounded-lg border border-slate-300 w-48"
            />
          )}
        </div>
      </Card>

      {/* 3. RECEIVER DETAILS (International Destination Format — §2) */}
      <Card className="p-6 border border-slate-200 rounded-2xl shadow-xs bg-slate-50/30">
        <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-100 text-[#002B49] flex items-center justify-center font-bold">
              2
            </div>
            <div>
              <h3 className="font-bold text-base text-[#002B49]">International Delivery Destination</h3>
              <p className="text-xs text-slate-500">Destination address & foreign customs location</p>
            </div>
          </div>

          {/* Saved Address Book Selector for Receiver */}
          {savedAddresses.length > 0 && (
            <div className="w-48 sm:w-64">
              <select
                value={selectedReceiverAddrId}
                onChange={(e) => handleSelectReceiverAddress(e.target.value)}
                className="w-full text-xs py-1.5 px-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#002B49]"
              >
                <option value="">Choose saved recipient...</option>
                {savedAddresses.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.label} ({a.country || "India"})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Recipient Contact Name <span className="text-red-500">*</span>
            </label>
            <Input
              value={receiverName}
              onChange={(e) => setReceiverName(e.target.value)}
              placeholder="e.g. John Doe / Global Tech Inc."
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Phone / Mobile <span className="text-red-500">*</span>
            </label>
            <Input
              value={receiverMobile}
              onChange={(e) => setReceiverMobile(e.target.value)}
              placeholder="e.g. +1 415-555-2671"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Recipient Email</label>
            <Input
              type="email"
              value={receiverEmail}
              onChange={(e) => setReceiverEmail(e.target.value)}
              placeholder="recipient@domain.com"
            />
          </div>

          {/* Destination Country Dropdown */}
          <div className="sm:col-span-1">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Destination Country <span className="text-red-500">*</span>
            </label>
            <select
              value={receiverCountry}
              onChange={(e) => handleCountryChange(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#002B49] font-medium"
              required
            >
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.name}>
                  {c.name} ({c.code})
                </option>
              ))}
            </select>
          </div>

          {/* Address Line 1 */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Address Line 1 (Street Address / Building) <span className="text-red-500">*</span>
            </label>
            <Input
              value={receiverAddress1}
              onChange={(e) => setReceiverAddress1(e.target.value)}
              placeholder="e.g. 742 Evergreen Terrace"
              required
            />
          </div>

          {/* Address Line 2 */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Address Line 2 (Suite / Apt)</label>
            <Input
              value={receiverAddress2}
              onChange={(e) => setReceiverAddress2(e.target.value)}
              placeholder="e.g. Suite 400"
            />
          </div>

          {/* Address Line 3 */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Address Line 3 (District / Area)</label>
            <Input
              value={receiverAddress3}
              onChange={(e) => setReceiverAddress3(e.target.value)}
              placeholder="e.g. Springfield Business Park"
            />
          </div>

          {/* City */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              City <span className="text-red-500">*</span>
            </label>
            <Input
              value={receiverCity}
              onChange={(e) => setReceiverCity(e.target.value)}
              placeholder="e.g. Los Angeles"
              required
            />
          </div>

          {/* State / Province (Dynamic dropdown filtered by country, or text input) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              State / Province / Region <span className="text-red-500">*</span>
            </label>
            {validReceiverStates && validReceiverStates.length > 0 ? (
              <select
                value={receiverState}
                onChange={(e) => setReceiverState(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#002B49]"
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
                onChange={(e) => setReceiverState(e.target.value)}
                placeholder="State or Province Name"
                required
              />
            )}
          </div>

          {/* Postal / ZIP Code */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Postal / ZIP Code <span className="text-red-500">*</span>
            </label>
            <Input
              value={receiverPincode}
              onChange={(e) => setReceiverPincode(e.target.value)}
              placeholder="e.g. 90210 / SW1A 1AA / M5V 2T6"
              required
            />
          </div>
        </div>

        {/* Save Address Option */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
            <input
              type="checkbox"
              checked={saveReceiverAddress}
              onChange={(e) => setSaveReceiverAddress(e.target.checked)}
              className="w-4 h-4 rounded text-[#002B49] focus:ring-[#002B49]"
            />
            <span>Save this recipient to Address Book</span>
          </label>
          {saveReceiverAddress && (
            <input
              type="text"
              value={receiverAddressLabel}
              onChange={(e) => setReceiverAddressLabel(e.target.value)}
              placeholder="Label: e.g. US Client Office"
              className="text-xs py-1 px-2.5 rounded-lg border border-slate-300 w-48"
            />
          )}
        </div>
      </Card>

      {/* 4. COMMERCIAL INVOICE & CUSTOMS LINE ITEMS (§2, §3) */}
      <Card className="p-6 border border-slate-200 rounded-2xl shadow-xs">
        <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              3
            </div>
            <div>
              <h3 className="font-bold text-base text-[#002B49]">Customs Declaration & Line Items</h3>
              <p className="text-xs text-slate-500">Commercial invoice itemization required for international customs</p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs font-bold text-slate-600">Total Customs Declared Value:</div>
            <div className="text-base font-black text-[#002B49]">
              {currency === "USD" ? `$${totalDeclaredValue.toFixed(2)} USD` : `₹${totalDeclaredValue.toLocaleString()} INR`}
              {currency === "USD" && (
                <span className="text-xs font-medium text-slate-500 ml-1.5">
                  (≈ ₹{totalDeclaredInrEquivalent.toLocaleString()} INR)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Invoice Metadata */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Invoice Number</label>
            <Input
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              placeholder="e.g. INV-2026-089"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Invoice Date</label>
            <Input
              type="date"
              value={invoiceDate}
              onChange={(e) => setInvoiceDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Service Type</label>
            <select
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#002B49]"
            >
              <option value="Express Worldwide (3-5 Days)">Express Worldwide (3-5 Days)</option>
              <option value="Standard International (5-8 Days)">Standard International (5-8 Days)</option>
              <option value="Economy Air Cargo (7-12 Days)">Economy Air Cargo (7-12 Days)</option>
              <option value="International Document (2-4 Days)">International Document (2-4 Days)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              IOSS / Tax ID (Optional)
            </label>
            <Input
              value={iossNumber}
              onChange={(e) => setIossNumber(e.target.value)}
              placeholder="e.g. IM1234567890"
            />
          </div>
        </div>

        {/* Line Items Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
            <thead className="bg-slate-100 text-slate-700 uppercase tracking-wider font-bold">
              <tr>
                <th className="p-2.5">Item Description *</th>
                <th className="p-2.5 w-24">SKU / Code</th>
                <th className="p-2.5 w-16 text-center">Qty *</th>
                <th className="p-2.5 w-28">Price ({currency}) *</th>
                <th className="p-2.5 w-24">HSN Code</th>
                <th className="p-2.5 w-16 text-center">Tax %</th>
                <th className="p-2.5 w-28 text-right">Total ({currency})</th>
                <th className="p-2.5 w-10 text-center"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {lineItems.map((item, idx) => (
                <tr key={item.id} className="hover:bg-slate-50/50">
                  <td className="p-2">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => handleLineItemChange(idx, "name", e.target.value)}
                      placeholder="e.g. Cotton Handloom Shirt"
                      className="w-full text-xs p-1.5 rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#002B49]"
                      required
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="text"
                      value={item.sku}
                      onChange={(e) => handleLineItemChange(idx, "sku", e.target.value)}
                      placeholder="SKU-101"
                      className="w-full text-xs p-1.5 rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#002B49]"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleLineItemChange(idx, "quantity", e.target.value)}
                      className="w-full text-xs p-1.5 rounded border border-slate-300 text-center focus:outline-none focus:ring-1 focus:ring-[#002B49]"
                      required
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.unit_price || ""}
                      onChange={(e) => handleLineItemChange(idx, "unit_price", e.target.value)}
                      placeholder="0.00"
                      className="w-full text-xs p-1.5 rounded border border-slate-300 font-mono focus:outline-none focus:ring-1 focus:ring-[#002B49]"
                      required
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="text"
                      value={item.hsn_code}
                      onChange={(e) => handleLineItemChange(idx, "hsn_code", e.target.value)}
                      placeholder="620520"
                      className="w-full text-xs p-1.5 rounded border border-slate-300 font-mono focus:outline-none focus:ring-1 focus:ring-[#002B49]"
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
                      className="w-full text-xs p-1.5 rounded border border-slate-300 text-center focus:outline-none focus:ring-1 focus:ring-[#002B49]"
                    />
                  </td>
                  <td className="p-2 text-right font-mono font-bold text-slate-800">
                    {currency === "USD" ? `$${item.total.toFixed(2)}` : `₹${item.total.toLocaleString()}`}
                  </td>
                  <td className="p-2 text-center">
                    {lineItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeLineItem(idx)}
                        className="text-slate-400 hover:text-red-500 p-1"
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

        <div className="mt-3 flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addLineItem}
            className="flex items-center gap-1.5 text-xs text-[#002B49]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Another Line Item</span>
          </Button>

          <span className="text-xs text-slate-500">
            Total Items: <strong>{lineItems.reduce((acc, i) => acc + (Number(i.quantity) || 0), 0)}</strong>
          </span>
        </div>
      </Card>

      {/* 5. PARCEL PACKAGE & WEIGHT */}
      <Card className="p-6 border border-slate-200 rounded-2xl shadow-xs">
        <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
            4
          </div>
          <div>
            <h3 className="font-bold text-base text-[#002B49]">Package Weight & Dimensions</h3>
            <p className="text-xs text-slate-500">Volumetric calculation & packaging type</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              General Consignment Description <span className="text-red-500">*</span>
            </label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Export Cotton Garments Samples"
              required
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">Package Classification</label>
            <select
              value={parcelType}
              onChange={(e) => setParcelType(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#002B49]"
            >
              <option value="Commercial Merchandise">Commercial Merchandise</option>
              <option value="Document / Printed Material">Document / Printed Material</option>
              <option value="Commercial Sample">Commercial Sample</option>
              <option value="Gift Consignment">Gift Consignment</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Actual Weight (kg) <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              step="0.05"
              min="0.1"
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
              placeholder="e.g. 2.5"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Length (cm)</label>
            <Input
              type="number"
              min="1"
              value={lengthCm}
              onChange={(e) => setLengthCm(e.target.value)}
              placeholder="e.g. 25"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Width (cm)</label>
            <Input
              type="number"
              min="1"
              value={widthCm}
              onChange={(e) => setWidthCm(e.target.value)}
              placeholder="e.g. 20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Height (cm)</label>
            <Input
              type="number"
              min="1"
              value={heightCm}
              onChange={(e) => setHeightCm(e.target.value)}
              placeholder="e.g. 15"
            />
          </div>
        </div>

        {volumetricWeightKg && (
          <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between text-slate-600">
            <span>
              Volumetric Weight: <strong>{volumetricWeightKg} kg</strong> (L×W×H / 5000)
            </span>
            <span className="text-[11px] text-slate-400">
              Billable weight will be the greater of actual vs volumetric weight.
            </span>
          </div>
        )}
      </Card>

      {/* 6. ADMIN-ONLY DISPATCH CONTROLS (§18) */}
      {isAdminMode && (
        <Card className="p-6 border border-brand-primary/20 rounded-2xl shadow-xs bg-slate-50/60">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-200 pb-3">
            <Truck className="w-5 h-5 text-brand-primary" />
            <div>
              <h3 className="font-bold text-base text-[#002B49]">Admin Dispatch & Courier Allocation</h3>
              <p className="text-xs text-slate-500">Optionally assign carrier and approve booking immediately</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Assign International Carrier
              </label>
              <select
                value={adminCourierId}
                onChange={(e) => setAdminCourierId(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#002B49]"
              >
                <option value="">Manual / Allocate Later</option>
                {adminCouriers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Shipping Charge ({currency})
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={adminShippingCharge}
                onChange={(e) => setAdminShippingCharge(e.target.value)}
                placeholder={currency === "USD" ? "e.g. 45.00" : "e.g. 3750"}
              />
            </div>
          </div>
        </Card>
      )}

      {/* SUBMISSION BUTTON */}
      <div className="flex items-center justify-end gap-4 pt-4">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-[#002B49] via-[#003860] to-[#001b2e] hover:from-[#001b2e] hover:to-[#002B49] text-white font-bold text-base shadow-md shadow-[#002B49]/20 transition-all flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Registering International Consignment...</span>
            </>
          ) : (
            <>
              <span>Submit International Booking</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
