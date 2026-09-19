"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  MapPin,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Star,
  Search,
  Building2,
  Home,
  Warehouse,
  User,
  Phone,
  Mail,
  ArrowRight,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { INDIAN_STATES_AND_UTS } from "@/lib/geo";

export interface CustomerAddress {
  id: string;
  customer_id: string;
  label: string;
  contact_name: string | null;
  contact_mobile: string | null;
  contact_email: string | null;
  address: string;
  landmark: string | null;
  city: string;
  district: string | null;
  state: string;
  pincode: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

const EMPTY_FORM = {
  label: "",
  contact_name: "",
  contact_mobile: "",
  contact_email: "",
  address: "",
  landmark: "",
  city: "",
  district: "",
  state: "",
  pincode: "",
  is_default: false,
};

export default function CustomerAddressBookPage() {
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/customer/addresses");
      if (res.ok) {
        const data = await res.json();
        setAddresses(data.addresses || []);
      } else {
        const err = await res.json();
        console.error("Failed to load addresses:", err);
      }
    } catch (e) {
      console.error("Network error while fetching addresses:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const showToast = (type: "success" | "error", text: string) => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage(null), 3500);
  };

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({
      ...EMPTY_FORM,
      is_default: addresses.length === 0,
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (addr: CustomerAddress) => {
    setEditingId(addr.id);
    setFormData({
      label: addr.label,
      contact_name: addr.contact_name || "",
      contact_mobile: addr.contact_mobile || "",
      contact_email: addr.contact_email || "",
      address: addr.address,
      landmark: addr.landmark || "",
      city: addr.city,
      district: addr.district || "",
      state: addr.state,
      pincode: addr.pincode,
      is_default: addr.is_default,
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!formData.label.trim()) errs.label = "Address label is required (e.g. Office, Home)";
    if (!formData.address.trim()) errs.address = "Street address is required (min 5 chars)";
    else if (formData.address.trim().length < 5) errs.address = "Address must be at least 5 characters";

    if (!formData.city.trim()) errs.city = "City is required";
    if (!formData.state.trim()) errs.state = "State is required";

    const pinClean = formData.pincode.replace(/\D/g, "");
    if (!pinClean) errs.pincode = "6-digit Indian pincode is required";
    else if (!/^\d{6}$/.test(pinClean)) errs.pincode = "Must be a valid 6-digit postal code";

    if (formData.contact_mobile) {
      const mobClean = formData.contact_mobile.replace(/\D/g, "");
      if (mobClean && !/^[6-9]\d{9}$/.test(mobClean)) {
        errs.contact_mobile = "Enter a valid 10-digit Indian mobile number";
      }
    }

    if (formData.contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contact_email.trim())) {
      errs.contact_email = "Enter a valid email address format";
    }

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);
    try {
      const url = editingId
        ? `/api/customer/addresses/${editingId}`
        : "/api/customer/addresses";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save address");
      }

      setIsModalOpen(false);
      showToast("success", editingId ? "Address updated successfully" : "New address added to Address Book");
      await fetchAddresses();
    } catch (err: any) {
      showToast("error", err.message || "An error occurred while saving address");
    } finally {
      setSaving(false);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const res = await fetch(`/api/customer/addresses/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_default: true }),
      });
      if (res.ok) {
        showToast("success", "Default address updated");
        await fetchAddresses();
      }
    } catch (e) {
      showToast("error", "Failed to set default address");
    }
  };

  const handleDelete = async (id: string, label: string) => {
    if (!confirm(`Are you sure you want to remove "${label}" from your address book?`)) return;

    try {
      const res = await fetch(`/api/customer/addresses/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        showToast("success", "Address removed from Address Book");
        await fetchAddresses();
      } else {
        const err = await res.json();
        showToast("error", err.error || "Failed to delete address");
      }
    } catch (e) {
      showToast("error", "Network error while deleting address");
    }
  };

  const filteredAddresses = addresses.filter((a) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      a.label.toLowerCase().includes(q) ||
      a.address.toLowerCase().includes(q) ||
      a.city.toLowerCase().includes(q) ||
      a.state.toLowerCase().includes(q) ||
      a.pincode.includes(q) ||
      (a.contact_name && a.contact_name.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Toast Alert */}
      {statusMessage && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-sm shadow-md animate-in fade-in slide-in-from-top-2 duration-200 ${
            statusMessage.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <Trash2 className="w-5 h-5 text-red-600 shrink-0" />
            )}
            <span className="font-semibold">{statusMessage.text}</span>
          </div>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-xs text-text-muted hover:text-text-primary px-2 py-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-base p-6 rounded-2xl border border-border-default shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-primary bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
              Address Book
            </span>
            <span className="text-xs text-text-muted">
              {addresses.length} {addresses.length === 1 ? "Location" : "Locations"} Saved
            </span>
          </div>
          <h1 className="text-2xl font-bold text-text-primary mt-1">Saved Addresses & Locations</h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Store pickup hubs, warehouses, and recipient addresses for instant 1-click booking.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/book">
            <Button variant="outline" size="sm" className="flex items-center gap-1.5 text-xs">
              <ArrowRight className="w-3.5 h-3.5 text-brand-primary" /> Book Parcel
            </Button>
          </Link>
          <Button
            variant="primary"
            size="sm"
            onClick={openCreateModal}
            className="flex items-center gap-1.5 text-xs shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add New Address
          </Button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      {addresses.length > 0 && (
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by label, city, person, or pincode…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-surface-base border border-border-default rounded-xl text-xs focus:ring-1 focus:ring-brand-primary text-text-primary placeholder:text-text-muted"
            />
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="text-xs text-text-muted hover:text-text-primary underline"
            >
              Clear
            </button>
          )}
        </div>
      )}

      {/* Content Grid */}
      {loading ? (
        <div className="py-16 text-center text-xs text-text-muted bg-surface-base rounded-2xl border border-border-default">
          <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-brand-primary" />
          Loading your saved address book…
        </div>
      ) : filteredAddresses.length === 0 ? (
        <Card className="border-dashed border-2 border-border-default bg-surface-subtle/50 text-center py-16 px-6">
          <div className="w-14 h-14 rounded-2xl bg-blue-100 text-brand-primary flex items-center justify-center mx-auto mb-3 shadow-inner">
            <MapPin className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-text-primary">
            {searchQuery ? "No matching addresses found" : "No saved addresses yet"}
          </h3>
          <p className="text-xs text-text-secondary max-w-md mx-auto mt-1 mb-6">
            {searchQuery
              ? `No address matched "${searchQuery}". Try a different keyword or clear search.`
              : "Save your frequent pickup locations and delivery destinations to speed up parcel booking."}
          </p>
          {searchQuery ? (
            <Button variant="outline" size="sm" onClick={() => setSearchQuery("")}>
              Clear Search Filter
            </Button>
          ) : (
            <Button variant="primary" size="md" onClick={openCreateModal} className="flex items-center gap-2 mx-auto">
              <Plus className="w-4 h-4" /> Add Your First Address
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAddresses.map((addr) => (
            <div
              key={addr.id}
              className={`bg-surface-base rounded-2xl border transition-all duration-200 flex flex-col justify-between hover:shadow-md ${
                addr.is_default
                  ? "border-brand-primary/40 shadow-sm ring-1 ring-brand-primary/20"
                  : "border-border-default hover:border-border-hover"
              }`}
            >
              <div className="p-5 space-y-3.5">
                {/* Top Badge Row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-text-primary flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-brand-primary" />
                      {addr.label}
                    </span>
                    {addr.is_default && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <Star className="w-2.5 h-2.5 fill-emerald-600 text-emerald-600" /> Default
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(addr)}
                      title="Edit Address"
                      className="p-1.5 text-text-muted hover:text-brand-primary hover:bg-surface-subtle rounded-lg transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(addr.id, addr.label)}
                      title="Delete Address"
                      className="p-1.5 text-text-muted hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Contact Coordinates (if provided) */}
                {(addr.contact_name || addr.contact_mobile || addr.contact_email) && (
                  <div className="bg-surface-subtle/80 rounded-xl p-2.5 text-xs text-text-secondary space-y-1 border border-border-default/60">
                    {addr.contact_name && (
                      <div className="font-semibold text-text-primary flex items-center gap-1.5">
                        <User className="w-3 h-3 text-brand-primary shrink-0" />
                        <span>{addr.contact_name}</span>
                      </div>
                    )}
                    {addr.contact_mobile && (
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <Phone className="w-3 h-3 text-text-muted shrink-0" />
                        <span>+91 {addr.contact_mobile}</span>
                      </div>
                    )}
                    {addr.contact_email && (
                      <div className="flex items-center gap-1.5 text-[11px] truncate">
                        <Mail className="w-3 h-3 text-text-muted shrink-0" />
                        <span className="truncate">{addr.contact_email}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Street Address */}
                <div className="text-xs text-text-secondary leading-relaxed space-y-1">
                  <p className="font-medium text-text-primary text-[13px]">{addr.address}</p>
                  {addr.landmark && (
                    <p className="text-[11px] text-text-muted italic">Landmark: {addr.landmark}</p>
                  )}
                  <p className="text-xs font-semibold text-brand-primary">
                    {addr.city}{addr.district && addr.district !== addr.city ? `, ${addr.district}` : ""}, {addr.state} — {addr.pincode}
                  </p>
                </div>
              </div>

              {/* Bottom Actions Bar */}
              <div className="px-5 py-3 bg-surface-subtle border-t border-border-default flex items-center justify-between gap-2 rounded-b-2xl">
                {!addr.is_default ? (
                  <button
                    onClick={() => handleSetDefault(addr.id)}
                    className="text-[11px] font-semibold text-text-muted hover:text-brand-primary flex items-center gap-1 transition-colors"
                  >
                    <Star className="w-3 h-3" /> Set Default
                  </button>
                ) : (
                  <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Primary Hub
                  </span>
                )}

                <Link
                  href={`/book`}
                  className="text-[11px] font-bold text-brand-accent hover:underline flex items-center gap-1 ml-auto"
                >
                  Use for Booking →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Address Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => !saving && setIsModalOpen(false)}
        title={editingId ? "Edit Saved Address" : "Add Address to Book"}
        description={
          editingId
            ? "Update your location specifications and contact person"
            : "Save a new pickup hub or recipient delivery destination"
        }
        maxWidth="xl"
      >
        <form onSubmit={handleSaveAddress} className="space-y-4 pt-2">
          {/* Label & Quick Suggestions */}
          <div className="space-y-1.5">
            <Input
              label="Address Label / Title"
              value={formData.label}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              placeholder="e.g. Office, Central Warehouse, Client - Sharma Ent"
              error={formErrors.label}
              required
            />
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-[11px] text-text-muted">Quick Tags:</span>
              {["Head Office", "Home", "Jaipur Hub", "Warehouse", "Branch Office", "Client"].map((tag) => (
                <button
                  type="button"
                  key={tag}
                  onClick={() => setFormData({ ...formData, label: tag })}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border transition-all ${
                    formData.label === tag
                      ? "bg-brand-primary text-white border-brand-primary"
                      : "bg-surface-subtle text-text-secondary border-border-default hover:bg-surface-base"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Contact Person Details */}
          <div className="p-3 bg-surface-subtle rounded-xl border border-border-default/60 space-y-3">
            <div className="text-xs font-bold text-text-primary flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-brand-primary" /> Contact Person at Location (Optional)
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label="Contact Name"
                value={formData.contact_name}
                onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                placeholder="Person / Manager"
              />
              <Input
                label="Mobile Number"
                type="tel"
                maxLength={10}
                value={formData.contact_mobile}
                onChange={(e) => setFormData({ ...formData, contact_mobile: e.target.value })}
                placeholder="10-digit mobile"
                error={formErrors.contact_mobile}
              />
              <Input
                label="Email"
                type="email"
                value={formData.contact_email}
                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                placeholder="contact@example.com"
                error={formErrors.contact_email}
              />
            </div>
          </div>

          {/* Address lines */}
          <Input
            label="Street Address / Building / Flat"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="Complete street address (plot, floor, street, area)"
            error={formErrors.address}
            required
          />

          <Input
            label="Landmark (Optional)"
            value={formData.landmark}
            onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
            placeholder="e.g. Near Metro Station, Opposite Central Bank"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="City"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="City"
              error={formErrors.city}
              required
            />
            <Input
              label="District"
              value={formData.district}
              onChange={(e) => setFormData({ ...formData, district: e.target.value })}
              placeholder="District"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-text-primary">
                State / Union Territory <span className="text-status-danger">*</span>
              </label>
              <select
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full h-10 px-3 py-2 text-xs bg-surface-base border border-border-default rounded-lg focus:ring-1 focus:ring-brand-primary"
                required
              >
                <option value="">Select State / UT</option>
                {INDIAN_STATES_AND_UTS.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
            <Input
              label="6-Digit Indian Pincode"
              maxLength={6}
              value={formData.pincode}
              onChange={(e) => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, "") })}
              placeholder="Pincode (e.g. 302001)"
              error={formErrors.pincode}
              required
            />
          </div>

          {/* Set Default Checkbox */}
          <div className="pt-2">
            <label className="flex items-center gap-2 text-xs font-semibold text-text-primary cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_default}
                onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                className="w-4 h-4 rounded text-brand-primary focus:ring-brand-primary border-border-default"
              />
              <span>Set as primary default address for bookings</span>
            </label>
          </div>

          {/* Modal Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-default">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" disabled={saving}>
              {saving ? "Saving…" : editingId ? "Save Changes" : "Add to Address Book"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
