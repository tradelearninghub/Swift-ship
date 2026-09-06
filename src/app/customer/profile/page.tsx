"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { User, MapPin, Plus, CheckCircle2, Building2, Trash2 } from "lucide-react";

export default function CustomerProfilePage() {
  const [savedAddresses, setSavedAddresses] = useState([
    {
      id: "addr-1",
      label: "Home / Primary Office",
      address: "Flat 402, Royal Palms, Tonk Road",
      city: "Jaipur",
      state: "Rajasthan",
      pincode: "302022",
      is_default: true,
    },
    {
      id: "addr-2",
      label: "Warehouse / Branch 2",
      address: "Plot 19, Sitapura Industrial Area Phase 1",
      city: "Jaipur",
      state: "Rajasthan",
      pincode: "302022",
      is_default: false,
    },
  ]);

  const [isSaved, setIsSaved] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Profile & Address Book</h1>
        <p className="text-xs text-text-secondary mt-0.5">
          Manage your personal sender details, business GSTIN, and saved pickup addresses.
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
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <Input label="Full Name" defaultValue="Rahul Sharma" required />
                <Input label="Mobile Number" type="tel" defaultValue="9876543210" required />
                <Input label="Email Address" type="email" defaultValue="rahul.sharma@example.com" required />
                <div className="p-3 bg-surface-subtle border border-border-default rounded-xl space-y-1 text-xs">
                  <span className="font-semibold text-text-muted">Account Type:</span>
                  <div className="font-bold text-brand-primary flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" /> Individual Shipper Account
                  </div>
                </div>

                <Button type="submit" variant="primary" size="sm">
                  {isSaved ? "Saved Successfully!" : "Save Changes"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Saved Addresses Book */}
        <div className="md:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-text-primary flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-brand-accent" /> Saved Addresses ({savedAddresses.length})
            </h3>
            <Button variant="outline" size="sm">
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Address
            </Button>
          </div>

          <div className="space-y-3">
            {savedAddresses.map((addr) => (
              <Card key={addr.id} className="p-4 space-y-2 relative group">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-text-primary">{addr.label}</span>
                  {addr.is_default && (
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                      Default Pickup
                    </span>
                  )}
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">{addr.address}</p>
                <div className="text-xs font-semibold text-text-primary">
                  {addr.city}, {addr.state} - {addr.pincode}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
