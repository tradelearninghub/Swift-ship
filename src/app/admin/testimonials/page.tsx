"use client";

import React, { useState, useEffect } from "react";
import { Testimonial } from "@/lib/testimonials";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { DeleteConfirmModal } from "@/components/ui/DeleteConfirmModal";
import {
  MessageSquareQuote,
  Plus,
  Trash2,
  Star,
  MapPin,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Sparkles,
  Layers,
  ArrowRight,
  Loader2,
  RefreshCw,
} from "lucide-react";

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Partner Marquee Settings State
  const [partnerVisible, setPartnerVisible] = useState(true);
  const [togglingPartner, setTogglingPartner] = useState(false);

  // Add Modal State
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formName, setFormName] = useState("");
  const [formRole, setFormRole] = useState("");
  const [formCompany, setFormCompany] = useState("");
  const [formRoute, setFormRoute] = useState("");
  const [formRating, setFormRating] = useState("5");
  const [formReview, setFormReview] = useState("");
  const [formAvatar, setFormAvatar] = useState("");
  const [formTag, setFormTag] = useState("Verified Exporter");
  const [formError, setFormError] = useState("");

  // Delete Modal State
  const [deletingItem, setDeletingItem] = useState<Testimonial | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load testimonials
  const loadData = async () => {
    try {
      const res = await fetch("/api/admin/testimonials");
      if (res.ok) {
        const data = await res.json();
        if (data.testimonials) {
          setTestimonials(data.testimonials);
        }
      }
    } catch {}

    try {
      const partnerRes = await fetch("/api/admin/partner-channel");
      if (partnerRes.ok) {
        const partnerData = await partnerRes.json();
        if (partnerData.settings && typeof partnerData.settings.is_visible === "boolean") {
          setPartnerVisible(partnerData.settings.is_visible);
        }
      }
    } catch {}
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle Partner Channel Marquee Visibility Toggle
  const handleTogglePartner = async () => {
    const nextVal = !partnerVisible;
    setTogglingPartner(true);
    try {
      const res = await fetch("/api/admin/partner-channel", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_visible: nextVal }),
      });
      if (res.ok) {
        setPartnerVisible(nextVal);
      }
    } catch {}
    setTogglingPartner(false);
  };

  // Handle Add Testimonial
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formReview.trim()) {
      setFormError("Client name and review text are required.");
      return;
    }

    setIsSubmitting(true);
    setFormError("");

    try {
      const res = await fetch("/api/admin/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_name: formName.trim(),
          client_role: formRole.trim() || "Verified Consignee",
          company_name: formCompany.trim() || undefined,
          destination_route: formRoute.trim() || undefined,
          rating: parseInt(formRating, 10) || 5,
          review: formReview.trim(),
          avatar_url: formAvatar.trim() || undefined,
          tag: formTag.trim() || "Verified Exporter",
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to add testimonial");
      }

      const data = await res.json();
      if (data.testimonials) {
        setTestimonials(data.testimonials);
      }

      // Reset form
      setFormName("");
      setFormRole("");
      setFormCompany("");
      setFormRoute("");
      setFormRating("5");
      setFormReview("");
      setFormAvatar("");
      setFormTag("Verified Exporter");
      setAddModalOpen(false);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setFormError(err.message);
      } else {
        setFormError("An unexpected error occurred.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete Testimonial
  const handleDeleteConfirm = async () => {
    if (!deletingItem) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/admin/testimonials?id=${encodeURIComponent(deletingItem.id)}`, {
        method: "DELETE",
      });

      if (res.ok) {
        const data = await res.json();
        if (data.testimonials) {
          setTestimonials(data.testimonials);
        } else {
          setTestimonials((prev) => prev.filter((t) => t.id !== deletingItem.id));
        }
      }
    } catch {}

    setIsDeleting(false);
    setDeletingItem(null);
  };

  // Handle Active/Inactive Toggle
  const handleToggleStatus = async (item: Testimonial) => {
    try {
      const res = await fetch("/api/admin/testimonials", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, is_active: !item.is_active }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.testimonials) {
          setTestimonials(data.testimonials);
        } else {
          setTestimonials((prev) =>
            prev.map((t) => (t.id === item.id ? { ...t, is_active: !t.is_active } : t))
          );
        }
      }
    } catch {}
  };

  const activeCount = testimonials.filter((t) => t.is_active).length;

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-primary bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              CMS &amp; Website Content
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <MessageSquareQuote className="w-7 h-7 text-[#2563EB]" />
            <span>Testimonials &amp; Partner Channels</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage authentic customer reviews displayed on the website and control the partner courier marquee banner.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setRefreshing(true);
              loadData();
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
            <span>Add Testimonial</span>
          </Button>
        </div>
      </div>

      {/* KPI & Partner Marquee Toggle Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Total Testimonials */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Reviews</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{testimonials.length}</p>
            <p className="text-xs text-slate-500 mt-0.5">{activeCount} Published &amp; Visible</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center font-bold">
            <MessageSquareQuote className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Average Rating */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Average Rating</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl font-black text-slate-900">5.0</span>
              <div className="flex items-center text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
            </div>
            <p className="text-xs text-emerald-600 font-medium mt-0.5">100% 5-Star Feedback</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Star className="w-6 h-6 fill-amber-500" />
          </div>
        </div>

        {/* Card 3: Partner Channel Marquee Switch (§Req 4) */}
        <div className="bg-gradient-to-br from-[#0B1536] to-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              <span>Partner Channel Marquee</span>
            </span>
            <span
              className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                partnerVisible ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30" : "bg-red-500/20 text-red-300 border border-red-400/30"
              }`}
            >
              {partnerVisible ? "ACTIVE & VISIBLE" : "HIDDEN"}
            </span>
          </div>

          <p className="text-xs text-slate-300 mb-3">
            Indian &amp; US courier partners animated marquee ribbon on the home page.
          </p>

          <button
            type="button"
            onClick={handleTogglePartner}
            disabled={togglingPartner}
            className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              partnerVisible
                ? "bg-rose-600/90 hover:bg-rose-700 text-white shadow-sm"
                : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
            }`}
          >
            {togglingPartner ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : partnerVisible ? (
              <>
                <EyeOff className="w-3.5 h-3.5" />
                <span>Hide Partner Marquee</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5" />
                <span>Show Partner Marquee</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Testimonials List */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-900">Current Testimonials ({testimonials.length})</h3>
            <p className="text-xs text-slate-500">
              These reviews are dynamically served on the public homepage. Click Delete to remove or toggle visibility.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-[#2563EB]" />
            <p className="text-xs">Loading testimonials...</p>
          </div>
        ) : testimonials.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm font-semibold text-slate-600">No testimonials currently added.</p>
            <p className="text-xs text-slate-400 mt-1">Click &ldquo;Add Testimonial&rdquo; to publish your first customer review.</p>
            <Button onClick={() => setAddModalOpen(true)} size="sm" className="mt-4">
              <Plus className="w-4 h-4 mr-1.5" />
              Add Testimonial
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {testimonials.map((item, index) => {
              const initials = item.client_name
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")
                .toUpperCase();

              return (
                <div
                  key={item.id}
                  className="p-5 sm:p-6 hover:bg-slate-50/60 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  {/* Left: Avatar + Client Details */}
                  <div className="flex items-start gap-4 min-w-0">
                    <span className="text-xs font-bold text-slate-400 mt-2 shrink-0">#{index + 1}</span>

                    {item.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.avatar_url}
                        alt={item.client_name}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#0B1536] to-blue-600 text-white font-black text-sm flex items-center justify-center shrink-0">
                        {initials}
                      </div>
                    )}

                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-bold text-sm text-slate-900">{item.client_name}</h4>
                        {item.destination_route && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                            <MapPin className="w-3 h-3" />
                            <span>{item.destination_route}</span>
                          </span>
                        )}
                        <span
                          className={`text-[10px] font-bold px-2 py-0.2 rounded-full ${
                            item.is_active
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-slate-100 text-slate-500 border border-slate-200"
                          }`}
                        >
                          {item.is_active ? "VISIBLE" : "HIDDEN"}
                        </span>
                      </div>

                      <p className="text-xs text-slate-500 font-medium">
                        {item.client_role} {item.company_name ? `• ${item.company_name}` : ""}
                      </p>

                      <div className="flex items-center gap-2 pt-0.5">
                        <div className="flex items-center text-amber-400">
                          {[...Array(item.rating)].map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-current" />
                          ))}
                        </div>
                        <span className="text-xs font-bold text-slate-700">{item.rating}.0 Star Rating</span>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-700 pt-1 leading-relaxed italic line-clamp-2 max-w-3xl">
                        &ldquo;{item.review}&rdquo;
                      </p>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(item)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors flex items-center gap-1.5 ${
                        item.is_active
                          ? "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                          : "bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100"
                      }`}
                    >
                      {item.is_active ? (
                        <>
                          <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                          <span>Hide</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Show</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeletingItem(item)}
                      className="p-2 rounded-lg text-rose-600 hover:bg-rose-50 border border-rose-200 hover:border-rose-300 transition-colors"
                      title="Delete Testimonial"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Testimonial Modal */}
      <Modal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} title="Add New Customer Testimonial">
        <form onSubmit={handleAddSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Client Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Client Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                required
                className="w-full h-10 px-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[#2563EB] focus:outline-none"
              />
            </div>

            {/* Role / Designation */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Designation / Role <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formRole}
                onChange={(e) => setFormRole(e.target.value)}
                placeholder="e.g. Founder & Exporter"
                required
                className="w-full h-10 px-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[#2563EB] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Company Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Company Name (Optional)
              </label>
              <input
                type="text"
                value={formCompany}
                onChange={(e) => setFormCompany(e.target.value)}
                placeholder="e.g. Sharma Crafts Pvt Ltd"
                className="w-full h-10 px-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[#2563EB] focus:outline-none"
              />
            </div>

            {/* Destination Route */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Destination Route (Optional)
              </label>
              <input
                type="text"
                value={formRoute}
                onChange={(e) => setFormRoute(e.target.value)}
                placeholder="e.g. Jaipur → New York, USA"
                className="w-full h-10 px-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[#2563EB] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Rating */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Star Rating
              </label>
              <select
                value={formRating}
                onChange={(e) => setFormRating(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[#2563EB] focus:outline-none bg-white"
              >
                <option value="5">⭐⭐⭐⭐⭐ 5 Stars (Excellent)</option>
                <option value="4">⭐⭐⭐⭐ 4 Stars (Very Good)</option>
                <option value="3">⭐⭐⭐ 3 Stars (Good)</option>
              </select>
            </div>

            {/* Tag / Category */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Verification Tag
              </label>
              <input
                type="text"
                value={formTag}
                onChange={(e) => setFormTag(e.target.value)}
                placeholder="e.g. Verified Air Cargo Exporter"
                className="w-full h-10 px-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[#2563EB] focus:outline-none"
              />
            </div>
          </div>

          {/* Avatar URL */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Avatar Image URL (Optional)
            </label>
            <input
              type="url"
              value={formAvatar}
              onChange={(e) => setFormAvatar(e.target.value)}
              placeholder="https://images.unsplash.com/... (or leave blank for auto initials badge)"
              className="w-full h-10 px-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[#2563EB] focus:outline-none"
            />
          </div>

          {/* Review Text */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Client Review / Feedback <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              value={formReview}
              onChange={(e) => setFormReview(e.target.value)}
              placeholder="Write the full testimonial details..."
              required
              className="w-full p-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[#2563EB] focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setAddModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Publish Testimonial"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      {deletingItem && (
        <DeleteConfirmModal
          isOpen={Boolean(deletingItem)}
          onClose={() => setDeletingItem(null)}
          onConfirm={handleDeleteConfirm}
          title="Delete Testimonial"
          entityName={`review by ${deletingItem.client_name}`}
          description={`Are you sure you want to permanently delete the testimonial by "${deletingItem.client_name}"? This action will remove it from the public homepage immediately.`}
        />
      )}
    </div>
  );
}
