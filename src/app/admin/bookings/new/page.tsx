"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { InternationalBookingForm } from "@/components/booking/InternationalBookingForm";
import {
  UserPlus,
  Loader2,
  Search,
  X,
  Plus,
  ArrowLeft,
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

  const [couriers, setCouriers] = useState<CourierOption[]>([]);

  // Customer Selection State
  const [customerSearchQuery, setCustomerSearchQuery] = useState("");
  const [customerSearchResults, setCustomerSearchResults] = useState<CustomerItem[]>([]);
  const [isSearchingCustomers, setIsSearchingCustomers] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerItem | null>(null);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const searchDropdownRef = useRef<HTMLDivElement>(null);

  // Inline "Add New Customer" Modal State
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [newCustName, setNewCustName] = useState("");
  const [newCustMobile, setNewCustMobile] = useState("");
  const [newCustEmail, setNewCustEmail] = useState("");
  const [newCustAccountType, setNewCustAccountType] = useState<"INDIVIDUAL" | "BUSINESS">("INDIVIDUAL");
  const [newCustGstin, setNewCustGstin] = useState("");
  const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);
  const [createCustomerError, setCreateCustomerError] = useState<string | null>(null);

  // Customer Saved Addresses
  const [customerAddresses, setCustomerAddresses] = useState<any[]>([]);

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
        console.error("Failed to load addresses", e);
      }
    }
    loadCustomerAddresses();
  }, [selectedCustomer]);

  // Customer selection action
  const handleSelectCustomer = (cust: CustomerItem) => {
    setSelectedCustomer(cust);
    setShowCustomerDropdown(false);
    setCustomerSearchQuery("");
  };

  // Clear selected customer
  const handleClearCustomer = () => {
    setSelectedCustomer(null);
    setCustomerAddresses([]);
  };

  // Create new customer inline
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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Create Direct Booking (Staff Intake)</h1>
          <p className="text-xs text-text-secondary">
            International parcel counter intake with customer association, automated commercial invoice, and direct courier dispatch
          </p>
        </div>
        <Link href="/admin/bookings">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Bookings
          </Button>
        </Link>
      </div>

      {/* CUSTOMER ASSOCIATION CARD */}
      <Card className="p-5 space-y-4 border border-slate-200 shadow-xs overflow-visible relative z-30">
        <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-100 pb-3">
          <div className="font-bold text-xs uppercase tracking-wider text-brand-primary flex items-center gap-1.5">
            <UserPlus className="w-4 h-4" /> Customer Association
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
          <div className="relative z-30" ref={searchDropdownRef}>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="text"
                value={customerSearchQuery}
                onChange={(e) => setCustomerSearchQuery(e.target.value)}
                onFocus={() => {
                  if (customerSearchResults.length > 0) setShowCustomerDropdown(true);
                }}
                placeholder="Search registered customer by Name or Mobile number..."
                className="w-full h-10 pl-9 pr-8 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#002B49] text-slate-900"
              />
              {isSearchingCustomers && (
                <Loader2 className="w-4 h-4 text-slate-400 animate-spin absolute right-3 top-3" />
              )}
            </div>

            {/* Search Results Dropdown */}
            {showCustomerDropdown && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 max-h-72 overflow-y-auto divide-y divide-slate-100 animate-in fade-in duration-150">
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
                      <span className="text-[11px] font-bold text-brand-accent">Select</span>
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

      {/* Inline Add Customer Modal */}
      {showAddCustomerModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-2xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="font-bold text-base text-[#002B49] flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-brand-accent" />
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

      {/* INTERNATIONAL BOOKING ENGINE (STAFF INTAKE) */}
      <InternationalBookingForm
        isAdminMode={true}
        customerId={selectedCustomer?.id}
        customerName={selectedCustomer?.name || ""}
        customerMobile={selectedCustomer?.mobile || ""}
        customerEmail={selectedCustomer?.email || ""}
        savedAddresses={customerAddresses}
        adminCouriers={couriers}
      />
    </div>
  );
}
