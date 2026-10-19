"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { DeleteConfirmModal } from "@/components/ui/DeleteConfirmModal";
import {
  Truck,
  Plus,
  Trash2,
  Globe,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
  Power,
  ShieldCheck,
  Building2,
  Layers,
} from "lucide-react";

export interface DeliveryPartner {
  id: string;
  name: string;
  code: string;
  website?: string;
  status: "ACTIVE" | "INACTIVE";
  active_shipments_count?: number;
}

export default function AdminCouriersPage() {
  const [partners, setPartners] = useState<DeliveryPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Add Partner Modal State
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [partnerName, setPartnerName] = useState("");
  const [partnerWebsite, setPartnerWebsite] = useState("");
  const [formError, setFormError] = useState("");

  // Delete Partner Modal State
  const [deletingPartner, setDeletingPartner] = useState<DeliveryPartner | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load couriers from API
  const loadPartners = async () => {
    try {
      const res = await fetch("/api/admin/couriers");
      if (res.ok) {
        const data = await res.json();
        if (data.couriers && Array.isArray(data.couriers)) {
          setPartners(data.couriers);
        }
      }
    } catch {}
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    loadPartners();
  }, []);

  // Handle Toggle On/Off Channel
  const handleToggleChannel = async (partner: DeliveryPartner) => {
    const nextStatus = partner.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    // Optimistic update
    setPartners((prev) =>
      prev.map((p) => (p.id === partner.id ? { ...p, status: nextStatus } : p))
    );

    try {
      const res = await fetch("/api/admin/couriers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: partner.id, status: nextStatus }),
      });
      if (!res.ok) {
        loadPartners();
      }
    } catch {
      loadPartners();
    }
  };

  // Handle Add Delivery Partner Submit
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerName.trim()) {
      setFormError("Delivery partner name is required.");
      return;
    }

    setIsSubmitting(true);
    setFormError("");

    try {
      const cleanWebsite = partnerWebsite.trim()
        ? partnerWebsite.trim().startsWith("http")
          ? partnerWebsite.trim()
          : `https://${partnerWebsite.trim()}`
        : "";

      const res = await fetch("/api/admin/couriers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: partnerName.trim(),
          website: cleanWebsite,
          status: "ACTIVE",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.courier) {
          setPartners((prev) => [data.courier, ...prev]);
        }
        setAddModalOpen(false);
        setPartnerName("");
        setPartnerWebsite("");
      } else {
        const data = await res.json();
        setFormError(data.error || "Failed to add delivery partner.");
      }
    } catch {
      setFormError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete Confirm
  const handleDeleteConfirm = async () => {
    if (!deletingPartner) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/admin/couriers?id=${deletingPartner.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setPartners((prev) => prev.filter((p) => p.id !== deletingPartner.id));
        setDeletingPartner(null);
      }
    } catch {}
    setIsDeleting(false);
  };

  const activeCount = partners.filter((p) => p.status === "ACTIVE").length;
  const inactiveCount = partners.length - activeCount;

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-primary bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              Parcel Dispatch Channels
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Truck className="w-7 h-7 text-[#2563EB]" />
            <span>Delivery Partners</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage delivery partners used to deliver your parcels. Toggle channels on or off according to operational use. Active channels are available during booking courier assignment.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setRefreshing(true);
              loadPartners();
            }}
            disabled={refreshing}
            className="flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>

          <Button
            onClick={() => setAddModalOpen(true)}
            className="flex items-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-md shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add Delivery Partner</span>
          </Button>
        </div>
      </div>

      {/* Overview KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Delivery Partners</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{partners.length}</p>
            <p className="text-xs text-slate-500 mt-0.5">Registered carriers</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center font-bold">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Channels</p>
            <p className="text-2xl font-black text-emerald-600 mt-1">{activeCount}</p>
            <p className="text-xs text-emerald-600 font-medium mt-0.5">Ready for Parcel Assignment</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Off Channel</p>
            <p className="text-2xl font-black text-slate-600 mt-1">{inactiveCount}</p>
            <p className="text-xs text-slate-400 mt-0.5">Disabled from Dispatch</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center font-bold">
            <Power className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Delivery Partners Cards Grid */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-base text-slate-900">Configured Delivery Partners</h3>
            <p className="text-xs text-slate-500">
              Toggle channels on or off. Active channels appear in the booking review section for assignment.
            </p>
          </div>
          <div className="text-xs font-semibold text-slate-500 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>{activeCount} active for dispatch</span>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-[#2563EB]" />
            <p className="text-xs">Loading delivery partners...</p>
          </div>
        ) : partners.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <Truck className="w-12 h-12 mx-auto text-slate-300" />
            <p className="font-semibold text-slate-600 text-sm">No delivery partners found.</p>
            <Button onClick={() => setAddModalOpen(true)} size="sm">
              Add Your First Delivery Partner
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 p-6 bg-slate-50/40">
            {partners.map((partner) => {
              const isActive = partner.status === "ACTIVE";
              const isProtectedInHouse = partner.code === "IN_HOUSE";
              const domain = partner.website
                ? partner.website.replace(/^https?:\/\//i, "").split("/")[0]
                : "";

              return (
                <div
                  key={partner.id}
                  className={`bg-white rounded-2xl border p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between ${
                    isActive ? "border-slate-200" : "border-slate-200/80 bg-slate-50/80 opacity-70"
                  }`}
                >
                  <div>
                    {/* Top row: Status badge & Toggle switch */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span
                        className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 ${
                          isActive
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isActive ? "bg-emerald-500" : "bg-slate-400"
                          }`}
                        />
                        {isActive ? "Channel Active" : "Channel Off"}
                      </span>

                      {/* On / Off Channel Toggle Button */}
                      <button
                        type="button"
                        onClick={() => handleToggleChannel(partner)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                          isActive
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                            : "bg-slate-200 hover:bg-slate-300 text-slate-700"
                        }`}
                        title={isActive ? "Click to turn off channel" : "Click to activate channel"}
                      >
                        <Power className="w-3 h-3" />
                        <span>{isActive ? "ON" : "OFF"}</span>
                      </button>
                    </div>

                    {/* Logo & Name Area */}
                    <div className="flex items-start gap-3 my-2">
                      {domain ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`}
                          alt={partner.name}
                          className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 p-1.5 object-contain shrink-0"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2563EB] border border-blue-200 flex items-center justify-center shrink-0 font-black text-xs">
                          {partner.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-sm sm:text-base text-slate-900 truncate" title={partner.name}>
                          {partner.name}
                        </h4>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                          <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-[11px] font-semibold text-slate-600">
                            {partner.code}
                          </span>
                          {isProtectedInHouse && (
                            <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-1.5 py-0.5 rounded">
                              Self Fleet
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Official Website */}
                    {partner.website ? (
                      <div className="mt-3 pt-3 border-t border-slate-100">
                        <a
                          href={partner.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[#2563EB] hover:text-[#1d4ed8] hover:underline flex items-center gap-1.5 truncate font-medium"
                          title="Open official partner website"
                        >
                          <Globe className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                          <span className="truncate">{partner.website.replace(/^https?:\/\//i, "")}</span>
                          <ExternalLink className="w-3 h-3 shrink-0 opacity-60" />
                        </a>
                      </div>
                    ) : (
                      <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-400 italic">
                        No official website provided
                      </div>
                    )}
                  </div>

                  {/* Bottom Footer Actions */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      {isActive ? "Ready for parcels" : "Excluded from assignment"}
                    </span>

                    {!isProtectedInHouse && (
                      <button
                        type="button"
                        onClick={() => setDeletingPartner(partner)}
                        className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition-colors cursor-pointer"
                        title="Remove delivery partner"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Delivery Partner Modal */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Add New Delivery Partner"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Delivery Partner Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={partnerName}
              onChange={(e) => setPartnerName(e.target.value)}
              placeholder="e.g. FedEx, DHL Express, Aramex, Blue Dart, DTDC"
              required
              className="w-full h-10 px-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[#2563EB] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Official Website URL <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={partnerWebsite}
                onChange={(e) => setPartnerWebsite(e.target.value)}
                placeholder="e.g. https://www.fedex.com or www.dhl.com"
                required
                className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[#2563EB] focus:outline-none"
              />
              <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Used to identify the carrier and link tracking milestones.
            </p>
          </div>

          {/* Quick Domain Preview */}
          {partnerWebsite.trim() && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://www.google.com/s2/favicons?domain=${partnerWebsite.replace(/^https?:\/\//i, "").split("/")[0]}&sz=64`}
                alt="Domain Icon"
                className="w-7 h-7 rounded-lg border border-slate-200 bg-white p-1"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
              <div className="text-xs">
                <span className="font-bold text-slate-800">{partnerName || "Partner Name"}</span>
                <p className="text-[11px] text-slate-500">{partnerWebsite}</p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setAddModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Delivery Partner"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Partner Modal */}
      {deletingPartner && (
        <DeleteConfirmModal
          isOpen={Boolean(deletingPartner)}
          onClose={() => setDeletingPartner(null)}
          onConfirm={handleDeleteConfirm}
          title="Remove Delivery Partner"
          entityName={deletingPartner.name}
          description={`Are you sure you want to remove "${deletingPartner.name}"? If you simply want to stop using it temporarily, you can toggle the channel OFF instead.`}
        />
      )}
    </div>
  );
}
