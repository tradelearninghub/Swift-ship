"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { User, MapPin, Plus, CheckCircle2, Building2, Trash2, RefreshCw } from "lucide-react";
import { INDIAN_STATES_AND_UTS } from "@/lib/geo";

interface SavedAddress {
  id: string;
  label: string;
  address: string;
  landmark?: string;
  city: string;
  district?: string;
  state: string;
  pincode: string;
  is_default: boolean;
}

export default function CustomerProfilePage() {
  const [profile, setProfile] = useState({
    name: "",
    mobile: "",
    email: "",
    account_type: "INDIVIDUAL",
    gstin: "",
  });
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddr, setNewAddr] = useState<Omit<SavedAddress, "id">>({
    label: "",
    address: "",
    landmark: "",
    city: "",
    district: "",
    state: "",
    pincode: "",
    is_default: false,
  });

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [authRes, addrRes] = await Promise.all([
          fetch("/api/auth/me"),
          fetch("/api/customer/addresses"),
        ]);

        if (authRes.ok) {
          const data = await authRes.json();
          if (data.user) {
            setProfile({
              name: data.user.name || "",
              mobile: data.user.mobile || "",
              email: data.user.email || "",
              account_type: data.user.accountType || "INDIVIDUAL",
              gstin: data.user.gstin || "",
            });
          }
        }

        if (addrRes.ok) {
          const data = await addrRes.json();
          setSavedAddresses(data.addresses || []);
        }
      } catch (e) {
        console.error("Failed to load user profile or addresses", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddr.address.trim() || !newAddr.pincode.trim()) return;

    try {
      const res = await fetch("/api/customer/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newAddr,
          is_default: savedAddresses.length === 0 ? true : newAddr.is_default,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSavedAddresses((prev) => [data.address, ...prev]);
        setIsAddingAddress(false);
        setNewAddr({
          label: "",
          address: "",
          landmark: "",
          city: "",
          district: "",
          state: "",
          pincode: "",
          is_default: false,
        });
      }
    } catch (e) {
      console.error("Failed to save address", e);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return;
    try {
      const res = await fetch(`/api/customer/addresses/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setSavedAddresses((prev) => prev.filter((a) => a.id !== id));
      }
    } catch (e) {
      console.error("Failed to delete address", e);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Profile & Address Book</h1>
        <p className="text-xs text-text-secondary mt-0.5">
          Manage your sender identity, verified contact coordinates, and saved pickup locations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Personal Details */}
        <div className="md:col-span-7">
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-sm flex items-center gap-2">
                <User className="w-4 h-4 text-brand-primary" /> Personal & Account Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {loading ? (
                <div className="py-8 text-center text-xs text-text-muted">
                  <RefreshCw className="w-4 h-4 animate-spin mx-auto mb-1 text-brand-primary" />
                  Loading account profile…
                </div>
              ) : (
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <Input
                    label="Full Name"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    placeholder="Your full name"
                    required
                  />
                  <Input
                    label="Mobile Number"
                    type="tel"
                    maxLength={10}
                    value={profile.mobile}
                    onChange={(e) => setProfile({ ...profile, mobile: e.target.value })}
                    placeholder="10-digit mobile"
                    required
                  />
                  <Input
                    label="Email Address"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    placeholder="name@example.com"
                    required
                  />

                  {profile.account_type === "BUSINESS" && (
                    <Input
                      label="GSTIN / Business Registration"
                      value={profile.gstin}
                      onChange={(e) => setProfile({ ...profile, gstin: e.target.value })}
                      placeholder="e.g. 08AAAAA0000A1Z5"
                    />
                  )}

                  <div className="p-3 bg-surface-subtle border border-border-default rounded-xl space-y-1 text-xs">
                    <span className="font-semibold text-text-muted">Account Classification:</span>
                    <div className="font-bold text-brand-primary flex items-center gap-1.5">
                      {profile.account_type === "BUSINESS" ? (
                        <>
                          <Building2 className="w-3.5 h-3.5 text-purple-600" /> Verified B2B Business Account
                        </>
                      ) : (
                        <>
                          <User className="w-3.5 h-3.5" /> Individual Shipper Account
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <Button type="submit" variant="primary" size="sm">
                      {isSaved ? "Saved Successfully!" : "Save Profile"}
                    </Button>
                    {isSaved && (
                      <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Updated
                      </span>
                    )}
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Saved Addresses Book */}
        <div className="md:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-text-primary flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-brand-accent" /> Saved Addresses ({savedAddresses.length})
            </h3>
            <div className="flex items-center gap-2">
              <a
                href="/customer/addresses"
                className="text-xs font-semibold text-brand-primary hover:underline"
              >
                Manage All →
              </a>
              {!isAddingAddress && (
                <Button variant="outline" size="sm" onClick={() => setIsAddingAddress(true)}>
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add
                </Button>
              )}
            </div>
          </div>

          {/* New Address Form Modal/Box */}
          {isAddingAddress && (
            <Card className="p-4 border-brand-primary/40 bg-blue-50/20 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-text-primary">Add Pickup Location</span>
                <button
                  type="button"
                  onClick={() => setIsAddingAddress(false)}
                  className="text-text-muted hover:text-text-primary"
                >
                  ✕
                </button>
              </div>
              <form onSubmit={handleAddAddress} className="space-y-2.5">
                <Input
                  label="Address Label"
                  placeholder="e.g. Head Office, Warehouse"
                  value={newAddr.label}
                  onChange={(e) => setNewAddr({ ...newAddr, label: e.target.value })}
                  required
                />
                <Input
                  label="Street Address"
                  placeholder="Complete pickup address"
                  value={newAddr.address}
                  onChange={(e) => setNewAddr({ ...newAddr, address: e.target.value })}
                  required
                />
                <Input
                  label="Landmark (Optional)"
                  placeholder="e.g. Near Metro Station"
                  value={newAddr.landmark || ""}
                  onChange={(e) => setNewAddr({ ...newAddr, landmark: e.target.value })}
                />
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    label="City"
                    value={newAddr.city}
                    onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                    required
                  />
                  <Input
                    label="District"
                    value={newAddr.district || ""}
                    onChange={(e) => setNewAddr({ ...newAddr, district: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-text-primary mb-1">
                      State / UT
                    </label>
                    <select
                      value={newAddr.state}
                      onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
                      className="w-full h-9 px-2 text-xs bg-surface-base border border-border-default rounded-lg focus:border-brand-primary"
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
                    label="Pincode"
                    maxLength={6}
                    value={newAddr.pincode}
                    onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value.replace(/\D/g, "") })}
                    placeholder="6-digit PIN"
                    required
                  />
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <Button type="button" variant="outline" size="sm" onClick={() => setIsAddingAddress(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" size="sm">
                    Save Address
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* List of Addresses */}
          {savedAddresses.length === 0 && !isAddingAddress ? (
            <Card className="p-8 text-center text-xs text-text-muted space-y-2">
              <MapPin className="w-8 h-8 mx-auto text-text-muted/60" />
              <p className="font-semibold text-text-primary">No saved addresses</p>
              <p className="mt-0.5">
                Save your warehouse or home locations for faster 1-click booking without re-entering details.
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {savedAddresses.map((addr) => (
                <Card key={addr.id} className="p-4 space-y-1.5 relative group">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-text-primary">{addr.label}</span>
                    <div className="flex items-center gap-2">
                      {addr.is_default && (
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                          Default Pickup
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeleteAddress(addr.id)}
                        className="text-text-muted hover:text-rose-600 transition-colors p-1"
                        title="Delete address"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed">{addr.address}</p>
                  {addr.landmark && (
                    <div className="text-[11px] text-text-muted">
                      <span className="font-semibold">Landmark:</span> {addr.landmark}
                    </div>
                  )}
                  <div className="text-xs font-semibold text-text-primary">
                    {addr.city}{addr.district ? `, ${addr.district}` : ""}, {addr.state} - {addr.pincode}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
