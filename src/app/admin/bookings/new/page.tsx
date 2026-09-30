"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { INDIAN_STATES_AND_UTS } from "@/lib/geo";
import { ShipmentModeSelector, ShipmentMode } from "@/components/booking/ShipmentModeSelector";
import { InternationalBookingForm } from "@/components/booking/InternationalBookingForm";
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
  Search,
  BookMarked,
  X,
  Plus,
} from "lucide-react";

interface CourierOption {
  id: string;
  name: string;
  code: string;
}

interface CustomerItem {
  id: string;
  name: string;
  mobile: string;
  email?: string | null;
  account_type: "INDIVIDUAL" | "BUSINESS";
  gstin?: string | null;
}

export default function AdminNewBookingPage() {
  const router = useRouter();

  // Mode Selection: Domestic vs International (§1)
  const [shipmentMode, setShipmentMode] = useState<ShipmentMode>("DOMESTIC");

  const [couriers, setCouriers] = useState<CourierOption[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdBookingId, setCreatedBookingId] = useState("");
  const [createdAwb, setCreatedAwb] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Customer Selection State (§4)
  const [customerSearchQuery, setCustomerSearchQuery] = useState("");
  const [customerSearchResults, setCustomerSearchResults] = useState<CustomerItem[]>([]);
  const [isSearchingCustomers, setIsSearchingCustomers] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerItem | null>(null);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const searchDropdownRef = useRef<HTMLDivElement>(null);

  // Inline "Add New Customer" Modal/Card State (§4)
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [newCustName, setNewCustName] = useState("");
  const [newCustMobile, setNewCustMobile] = useState("");
  const [newCustEmail, setNewCustEmail] = useState("");
  const [newCustAccountType, setNewCustAccountType] = useState<"INDIVIDUAL" | "BUSINESS">("INDIVIDUAL");
  const [newCustGstin, setNewCustGstin] = useState("");
  const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);
  const [createCustomerError, setCreateCustomerError] = useState<string | null>(null);

  // Customer Saved Addresses (§5 & §6)
  const [customerAddresses, setCustomerAddresses] = useState<any[]>([]);
  const [selectedSenderAddrId, setSelectedSenderAddrId] = useState("");
  const [selectedReceiverAddrId, setSelectedReceiverAddrId] = useState("");
  const [saveSenderAddress, setSaveSenderAddress] = useState(false);
  const [senderAddressLabel, setSenderAddressLabel] = useState("");
  const [saveReceiverAddress, setSaveReceiverAddress] = useState(false);
  const [receiverAddressLabel, setReceiverAddressLabel] = useState("");

  // Track if staff manually modified sender fields
  const [senderNameEdited, setSenderNameEdited] = useState(false);
  const [senderMobileEdited, setSenderMobileEdited] = useState(false);

  // Form State — Clean and empty per requirements
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

  // Load couriers list
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

  // Search customers debounced
  useEffect(() => {
    if (!customerSearchQuery.trim()) {
      setCustomerSearchResults([]);
      setIsSearchingCustomers(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingCustomers(true);
      try {
        const res = await fetch(`/api/admin/customers?q=${encodeURIComponent(customerSearchQuery.trim())}&limit=10`);
        if (res.ok) {
          const data = await res.json();
          setCustomerSearchResults(data.customers || []);
          setShowCustomerDropdown(true);
        }
      } catch (e) {
        console.error("Customer search failed", e);
      } finally {
        setIsSearchingCustomers(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [customerSearchQuery]);

  // Close search dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchDropdownRef.current && !searchDropdownRef.current.contains(event.target as Node)) {
        setShowCustomerDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch saved addresses when customer is selected
  useEffect(() => {
    async function loadCustomerAddresses() {
      if (!selectedCustomer) {
        setCustomerAddresses([]);
        return;
      }
      try {
        const res = await fetch(`/api/customer/addresses?customer_id=${selectedCustomer.id}`);
        if (res.ok) {
          const data = await res.json();
          setCustomerAddresses(data.addresses || []);
        }
      } catch (e) {
        console.error("Failed to load customer addresses", e);
      }
    }
    loadCustomerAddresses();
  }, [selectedCustomer]);

  // Select existing customer
  const handleSelectCustomer = (cust: CustomerItem) => {
    setSelectedCustomer(cust);
    setShowCustomerDropdown(false);
    setCustomerSearchQuery("");

    setFormData((prev) => ({
      ...prev,
      customer_name: cust.name,
      customer_mobile: cust.mobile,
      sender_name: !senderNameEdited ? cust.name : prev.sender_name,
      sender_mobile: !senderMobileEdited ? cust.mobile : prev.sender_mobile,
    }));
  };

  // Clear selected customer
  const handleClearCustomer = () => {
    setSelectedCustomer(null);
    setCustomerAddresses([]);
    setSelectedSenderAddrId("");
    setSelectedReceiverAddrId("");
    setFormData((prev) => ({
      ...prev,
      customer_name: "",
      customer_mobile: "",
    }));
  };

  // Create new customer inline (§4)
  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingCustomer(true);
    setCreateCustomerError(null);

    try {
      if (!newCustName.trim()) throw new Error("Customer name is required.");
      if (!newCustMobile.trim() || newCustMobile.replace(/\D/g, "").length !== 10) {
        throw new Error("Valid 10-digit mobile number is required.");
      }

      const res = await fetch("/api/admin/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCustName.trim(),
          mobile: newCustMobile.trim(),
          email: newCustEmail.trim() || undefined,
          account_type: newCustAccountType,
          gstin: newCustGstin.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create customer.");
      }

      handleSelectCustomer(data.customer);
      setShowAddCustomerModal(false);
      setNewCustName("");
      setNewCustMobile("");
      setNewCustEmail("");
      setNewCustGstin("");
    } catch (err: any) {
      setCreateCustomerError(err.message || "Failed to create customer");
    } finally {
      setIsCreatingCustomer(false);
    }
  };

  // Handle saved address selection for Sender
  const handleSelectSenderAddress = (addrId: string) => {
    setSelectedSenderAddrId(addrId);
    if (!addrId) return;
    const addr = customerAddresses.find((a) => a.id === addrId);
    if (addr) {
      setFormData((prev) => ({
        ...prev,
        sender_name: addr.contact_name || prev.sender_name,
        sender_mobile: addr.contact_mobile || prev.sender_mobile,
        sender_address: addr.address,
        sender_landmark: addr.landmark || "",
        sender_city: addr.city,
        sender_district: addr.district || "",
        sender_state: addr.state,
        sender_pincode: addr.pincode,
      }));
      setSenderNameEdited(true);
      setSenderMobileEdited(true);
    }
  };

  // Handle saved address selection for Receiver
  const handleSelectReceiverAddress = (addrId: string) => {
    setSelectedReceiverAddrId(addrId);
    if (!addrId) return;
    const addr = customerAddresses.find((a) => a.id === addrId);
    if (addr) {
      setFormData((prev) => ({
        ...prev,
        receiver_name: addr.contact_name || prev.receiver_name,
        receiver_mobile: addr.contact_mobile || prev.receiver_mobile,
        receiver_address: addr.address,
        receiver_landmark: addr.landmark || "",
        receiver_city: addr.city,
        receiver_district: addr.district || "",
        receiver_state: addr.state,
        receiver_pincode: addr.pincode,
      }));
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: value };

      if (name === "customer_name" && !senderNameEdited) {
        next.sender_name = value;
      }
      if (name === "customer_mobile" && !senderMobileEdited) {
        next.sender_mobile = value;
      }

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
        shipment_mode: "DOMESTIC",
        currency: "INR",
        customer_name: (formData.customer_name || selectedCustomer?.name || "").trim(),
        customer_mobile: (formData.customer_mobile || selectedCustomer?.mobile || "").trim(),
        sender_name: (formData.sender_name || formData.customer_name).trim(),
        sender_mobile: (formData.sender_mobile || formData.customer_mobile).trim(),
        sender_email: selectedCustomer?.email || "",
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

        // Address persistence (§5 & §6)
        save_sender_address: saveSenderAddress,
        sender_address_label: senderAddressLabel.trim() || `${formData.sender_city} Pickup`,
        save_receiver_address: saveReceiverAddress,
        receiver_address_label: receiverAddressLabel.trim() || `${formData.receiver_name} (${formData.receiver_city})`,
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

      // Immediately approve and allocate courier if partner is selected
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
              setSelectedCustomer(null);
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
            Manual counter intake with auto customer association, address book selection, and courier assignment
          </p>
        </div>
        <Link href="/admin/bookings">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Bookings
          </Button>
        </Link>
      </div>

      {/* 1. ENTRY POINT — TWO CLEAR BUTTONS (§1) */}
      <ShipmentModeSelector mode={shipmentMode} onChange={setShipmentMode} />

      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 2. CUSTOMER ASSOCIATION (§4) — Shared for both Domestic and International */}
      <Card className="p-5 space-y-4 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-100 pb-3">
          <div className="font-bold text-xs uppercase tracking-wider text-brand-primary flex items-center gap-1.5">
            <UserPlus className="w-4 h-4" /> Customer Association (§4, §8, §9)
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowAddCustomerModal(true)}
            className="flex items-center gap-1 text-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New Customer</span>
          </Button>
        </div>

        {selectedCustomer ? (
          /* Selected Customer Card */
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#002B49] text-white flex items-center justify-center font-bold text-sm">
                {selectedCustomer.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-[#002B49]">{selectedCustomer.name}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 uppercase">
                    {selectedCustomer.account_type}
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Mobile: <strong>+91 {selectedCustomer.mobile}</strong>
                  {selectedCustomer.email && <span> • {selectedCustomer.email}</span>}
                </div>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClearCustomer}
              className="text-xs text-slate-600 hover:text-red-600"
            >
              Change Customer
            </Button>
          </div>
        ) : (
          /* Customer Search Box */
          <div className="relative" ref={searchDropdownRef}>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={customerSearchQuery}
                onChange={(e) => setCustomerSearchQuery(e.target.value)}
                onFocus={() => {
                  if (customerSearchResults.length > 0) setShowCustomerDropdown(true);
                }}
                placeholder="Search existing customer by Name, Mobile (+91), or Email..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#002B49] bg-white shadow-2xs"
              />
              {isSearchingCustomers && (
                <Loader2 className="w-4 h-4 animate-spin text-slate-400 absolute right-3 top-3" />
              )}
            </div>

            {/* Search Results Dropdown */}
            {showCustomerDropdown && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl z-20 max-h-60 overflow-y-auto divide-y divide-slate-100 animate-in fade-in duration-150">
                {customerSearchResults.length > 0 ? (
                  customerSearchResults.map((cust) => (
                    <div
                      key={cust.id}
                      onClick={() => handleSelectCustomer(cust)}
                      className="p-3 hover:bg-slate-50 cursor-pointer flex items-center justify-between transition-colors"
                    >
                      <div>
                        <div className="font-bold text-xs text-slate-800 flex items-center gap-2">
                          <span>{cust.name}</span>
                          <span className="text-[10px] text-slate-500 font-normal">
                            ({cust.account_type})
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Mobile: +91 {cust.mobile} {cust.email && `• ${cust.email}`}
                        </div>
                      </div>
                      <span className="text-[11px] font-bold text-[#FF6B00]">Select</span>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-xs text-slate-500">
                    No matching customer found.
                    <button
                      type="button"
                      onClick={() => {
                        setShowCustomerDropdown(false);
                        setShowAddCustomerModal(true);
                      }}
                      className="block mx-auto mt-1.5 text-brand-primary font-bold hover:underline"
                    >
                      + Add &quot;{customerSearchQuery}&quot; as New Customer
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Inline Add Customer Modal (§4) */}
      {showAddCustomerModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-2xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="font-bold text-base text-[#002B49] flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#FF6B00]" />
                <span>Add New Customer</span>
              </div>
              <button
                type="button"
                onClick={() => setShowAddCustomerModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {createCustomerError && (
              <div className="p-2.5 rounded-lg bg-red-50 text-red-700 text-xs border border-red-200">
                {createCustomerError}
              </div>
            )}

            <form onSubmit={handleCreateCustomer} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Customer Name <span className="text-red-500">*</span>
                </label>
                <Input
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  placeholder="e.g. Anand Sharma"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mobile Number (10-digit) <span className="text-red-500">*</span>
                </label>
                <Input
                  value={newCustMobile}
                  onChange={(e) => setNewCustMobile(e.target.value)}
                  maxLength={10}
                  placeholder="e.g. 9876543210"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                <Input
                  type="email"
                  value={newCustEmail}
                  onChange={(e) => setNewCustEmail(e.target.value)}
                  placeholder="customer@domain.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Account Type</label>
                  <select
                    value={newCustAccountType}
                    onChange={(e) => setNewCustAccountType(e.target.value as any)}
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 text-xs bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#002B49]"
                  >
                    <option value="INDIVIDUAL">Individual</option>
                    <option value="BUSINESS">Business</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">GSTIN (Optional)</label>
                  <Input
                    value={newCustGstin}
                    onChange={(e) => setNewCustGstin(e.target.value)}
                    placeholder="GSTIN number"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddCustomerModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isCreatingCustomer}
                  className="flex items-center gap-1.5"
                >
                  {isCreatingCustomer && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Create & Select Customer</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. SHIPMENT FORM: INTERNATIONAL VS DOMESTIC (§1) */}
      {shipmentMode === "INTERNATIONAL" ? (
        <InternationalBookingForm
          isAdminMode={true}
          customerId={selectedCustomer?.id}
          customerName={selectedCustomer?.name || formData.customer_name}
          customerMobile={selectedCustomer?.mobile || formData.customer_mobile}
          customerEmail={selectedCustomer?.email || ""}
          savedAddresses={customerAddresses}
          adminCouriers={couriers}
          onSuccess={(b, awb) => {
            setCreatedBookingId(b.booking_number);
            if (awb) setCreatedAwb(awb);
            setIsSuccess(true);
          }}
        />
      ) : (
        /* DOMESTIC BOOKING FLOW */
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Sender & Receiver Split */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* SENDER CARD */}
            <Card className="p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="font-bold text-xs uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                  <User className="w-4 h-4 text-brand-primary" /> Sender Details (Pickup)
                </div>

                {customerAddresses.length > 0 && (
                  <select
                    value={selectedSenderAddrId}
                    onChange={(e) => handleSelectSenderAddress(e.target.value)}
                    className="text-[11px] py-1 px-2 rounded-lg border border-slate-300 bg-white text-slate-700 max-w-[160px]"
                  >
                    <option value="">Saved pickup...</option>
                    {customerAddresses.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.label} ({a.city})
                      </option>
                    ))}
                  </select>
                )}
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

              {/* Save Address Checkbox for Sender (§5) */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2">
                <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={saveSenderAddress}
                    onChange={(e) => setSaveSenderAddress(e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-[#002B49]"
                  />
                  <span>Save to customer address book</span>
                </label>
                {saveSenderAddress && (
                  <input
                    type="text"
                    value={senderAddressLabel}
                    onChange={(e) => setSenderAddressLabel(e.target.value)}
                    placeholder="Label: Office, Home"
                    className="text-[11px] py-0.5 px-2 rounded border border-slate-300 w-32"
                  />
                )}
              </div>
            </Card>

            {/* RECEIVER CARD */}
            <Card className="p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="font-bold text-xs uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-brand-accent" /> Receiver Details (Consignee)
                </div>

                {customerAddresses.length > 0 && (
                  <select
                    value={selectedReceiverAddrId}
                    onChange={(e) => handleSelectReceiverAddress(e.target.value)}
                    className="text-[11px] py-1 px-2 rounded-lg border border-slate-300 bg-white text-slate-700 max-w-[160px]"
                  >
                    <option value="">Saved recipient...</option>
                    {customerAddresses.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.label} ({a.city})
                      </option>
                    ))}
                  </select>
                )}
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

              {/* Save Address Checkbox for Receiver (§6) */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2">
                <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={saveReceiverAddress}
                    onChange={(e) => setSaveReceiverAddress(e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-[#002B49]"
                  />
                  <span>Save to customer address book</span>
                </label>
                {saveReceiverAddress && (
                  <input
                    type="text"
                    value={receiverAddressLabel}
                    onChange={(e) => setReceiverAddressLabel(e.target.value)}
                    placeholder="Label: Client, Branch"
                    className="text-[11px] py-0.5 px-2 rounded border border-slate-300 w-32"
                  />
                )}
              </div>
            </Card>
          </div>

          {/* PARCEL & FREIGHT SPECS */}
          <Card className="p-4 space-y-4">
            <div className="font-bold text-xs uppercase tracking-wider text-text-muted flex items-center gap-1.5">
              <Package className="w-4 h-4 text-brand-primary" /> Parcel Weight & Dimensions
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                name="description"
                label="Package Contents / Description"
                placeholder="e.g. Legal documents, cloth sample"
                value={formData.description}
                onChange={handleChange}
                required
              />
              <Input
                name="weight_kg"
                label="Actual Weight (kg)"
                type="number"
                step="0.01"
                placeholder="e.g. 1.25"
                value={formData.weight_kg}
                onChange={handleChange}
                required
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Input
                name="length_cm"
                label="Length (cm)"
                type="number"
                placeholder="L"
                value={formData.length_cm}
                onChange={handleChange}
              />
              <Input
                name="width_cm"
                label="Width (cm)"
                type="number"
                placeholder="W"
                value={formData.width_cm}
                onChange={handleChange}
              />
              <Input
                name="height_cm"
                label="Height (cm)"
                type="number"
                placeholder="H"
                value={formData.height_cm}
                onChange={handleChange}
              />
            </div>
          </Card>

          {/* BILLING, COMMERCIAL & COURIER ASSIGNMENT */}
          <Card className="p-4 space-y-4">
            <div className="font-bold text-xs uppercase tracking-wider text-text-muted flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-brand-primary" /> Operational Intake & Allocation (§11, §18)
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                name="declared_value_rupees"
                label="Declared Value (₹)"
                type="number"
                placeholder="e.g. 500"
                value={formData.declared_value_rupees}
                onChange={handleChange}
                required
              />
              <Input
                name="shipping_charge_rupees"
                label="Shipping Charge (₹)"
                type="number"
                placeholder="Manual rate (Optional)"
                value={formData.shipping_charge_rupees}
                onChange={handleChange}
              />
              <Input
                name="cod_amount_rupees"
                label="COD Amount (₹)"
                type="number"
                placeholder="0 for Prepaid"
                value={formData.cod_amount_rupees}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-primary mb-1">
                Assign Carrier / Courier Partner
              </label>
              <select
                name="courier_partner_id"
                value={formData.courier_partner_id}
                onChange={handleChange}
                className="w-full h-9 px-2 text-xs bg-surface-subtle border border-border-default rounded-lg focus:border-brand-primary focus:outline-none"
              >
                <option value="">Assign Later (Manual Review)</option>
                {couriers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>
          </Card>

          <div className="flex justify-end gap-3 pt-2">
            <Link href="/admin/bookings">
              <Button variant="outline" size="md">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={isSubmitting}
              className="flex items-center gap-2"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Create Staff Booking</span>
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
