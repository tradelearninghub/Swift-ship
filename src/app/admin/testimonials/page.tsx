"use client";

import React, { useState, useEffect } from "react";
import { Testimonial } from "@/lib/testimonials";
import { ChannelPartnerCompany, DEFAULT_PARTNER_COMPANIES, getCompanyLogoUrl } from "@/lib/partnerChannel";
import { ChannelPartnerLogo } from "@/components/ChannelPartnerLogo";
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
  Globe,
  ExternalLink,
  Building2,
} from "lucide-react";

export default function AdminTestimonialsPage() {
  const [activeTab, setActiveTab] = useState<"testimonials" | "partners">("testimonials");
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Partner Marquee Settings State
  const [partnerVisible, setPartnerVisible] = useState(true);
  const [partnerCompanies, setPartnerCompanies] = useState<ChannelPartnerCompany[]>(DEFAULT_PARTNER_COMPANIES);
  const [togglingPartner, setTogglingPartner] = useState(false);

  // Add Testimonial Modal State
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

  // Add Partner Company Modal State
  const [addPartnerModalOpen, setAddPartnerModalOpen] = useState(false);
  const [isSubmittingPartner, setIsSubmittingPartner] = useState(false);
  const [partnerName, setPartnerName] = useState("");
  const [partnerWebsite, setPartnerWebsite] = useState("");
  const [partnerLogoUrl, setPartnerLogoUrl] = useState("");
  const [partnerFormError, setPartnerFormError] = useState("");

  // Delete Testimonial Modal State
  const [deletingItem, setDeletingItem] = useState<Testimonial | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Delete Partner Company Modal State
  const [deletingPartner, setDeletingPartner] = useState<ChannelPartnerCompany | null>(null);
  const [isDeletingPartner, setIsDeletingPartner] = useState(false);

  // Load testimonials & partner channel settings
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
        if (partnerData.settings) {
          if (typeof partnerData.settings.is_visible === "boolean") {
            setPartnerVisible(partnerData.settings.is_visible);
          }
          if (Array.isArray(partnerData.settings.companies)) {
            setPartnerCompanies(partnerData.settings.companies);
          }
        }
      }
    } catch {}
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle Global Partner Marquee Visibility Toggle
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

  // Handle Individual Partner Company Visibility Toggle
  const handleToggleIndividualCompany = async (companyId: string, currentVal: boolean) => {
    const nextVal = !currentVal;
    // Optimistic update
    setPartnerCompanies((prev) =>
      prev.map((c) => (c.id === companyId ? { ...c, is_visible: nextVal } : c))
    );

    try {
      await fetch("/api/admin/partner-channel", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId, is_visible: nextVal }),
      });
    } catch {
      // Revert on error
      loadData();
    }
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
          client_role: formRole.trim(),
          company_name: formCompany.trim(),
          destination_route: formRoute.trim(),
          rating: parseInt(formRating, 10) || 5,
          review: formReview.trim(),
          avatar_url: formAvatar.trim() || undefined,
          verification_tag: formTag.trim(),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.testimonials) {
          setTestimonials(data.testimonials);
        }
        setAddModalOpen(false);
        // Reset form
        setFormName("");
        setFormRole("");
        setFormCompany("");
        setFormRoute("");
        setFormReview("");
        setFormAvatar("");
      } else {
        const data = await res.json();
        setFormError(data.error || "Failed to create testimonial.");
      }
    } catch {
      setFormError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Add Channel Partner Company
  const handleAddPartnerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerName.trim() || !partnerWebsite.trim()) {
      setPartnerFormError("Company name and official website URL are required.");
      return;
    }

    setIsSubmittingPartner(true);
    setPartnerFormError("");

    try {
      const res = await fetch("/api/admin/partner-channel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: partnerName.trim(),
          website: partnerWebsite.trim(),
          logo_url: partnerLogoUrl.trim() || undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.settings && data.settings.companies) {
          setPartnerCompanies(data.settings.companies);
        }
        setAddPartnerModalOpen(false);
        setPartnerName("");
        setPartnerWebsite("");
        setPartnerLogoUrl("");
      } else {
        const data = await res.json();
        setPartnerFormError(data.error || "Failed to add partner company.");
      }
    } catch {
      setPartnerFormError("Network error. Please try again.");
    } finally {
      setIsSubmittingPartner(false);
    }
  };

  // Handle Delete Testimonial
  const handleDeleteConfirm = async () => {
    if (!deletingItem) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/testimonials?id=${deletingItem.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setTestimonials((prev) => prev.filter((t) => t.id !== deletingItem.id));
        setDeletingItem(null);
      }
    } catch {}
    setIsDeleting(false);
  };

  // Handle Delete Partner Company
  const handleDeletePartnerConfirm = async () => {
    if (!deletingPartner) return;
    setIsDeletingPartner(true);
    try {
      const res = await fetch(`/api/admin/partner-channel?companyId=${deletingPartner.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setPartnerCompanies((prev) => prev.filter((c) => c.id !== deletingPartner.id));
        setDeletingPartner(null);
      }
    } catch {}
    setIsDeletingPartner(false);
  };

  // Toggle Testimonial Active Status
  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch("/api/admin/testimonials", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, is_active: !currentStatus }),
      });
      if (res.ok) {
        setTestimonials((prev) =>
          prev.map((t) => (t.id === id ? { ...t, is_active: !currentStatus } : t))
        );
      }
    } catch {}
  };

  const activeCount = testimonials.filter((t) => t.is_active).length;
  const visiblePartnersCount = partnerCompanies.filter((c) => c.is_visible).length;

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
            Manage authentic customer reviews displayed on the website and control the Channel Partner Marquee logos &amp; visibility.
          </p>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 flex-wrap sm:flex-nowrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setRefreshing(true);
              loadData();
            }}
            disabled={refreshing}
            className="flex items-center gap-1.5 shrink-0 whitespace-nowrap"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>

          {activeTab === "testimonials" ? (
            <Button
              onClick={() => setAddModalOpen(true)}
              className="flex items-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-md shadow-blue-500/20 shrink-0 whitespace-nowrap px-4 py-2"
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span className="whitespace-nowrap font-semibold">Add Testimonial</span>
            </Button>
          ) : (
            <Button
              onClick={() => setAddPartnerModalOpen(true)}
              className="flex items-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-md shadow-blue-500/20 shrink-0 whitespace-nowrap px-4 py-2"
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span className="whitespace-nowrap font-semibold">Add Channel Partner</span>
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab("testimonials")}
          className={`pb-3 px-2 font-bold text-sm border-b-2 transition-all flex items-center gap-2 ${
            activeTab === "testimonials"
              ? "border-[#2563EB] text-[#2563EB]"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <MessageSquareQuote className="w-4 h-4" />
          <span>Customer Testimonials ({testimonials.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("partners")}
          className={`pb-3 px-2 font-bold text-sm border-b-2 transition-all flex items-center gap-2 ${
            activeTab === "partners"
              ? "border-[#2563EB] text-[#2563EB]"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Channel Partner Marquee ({partnerCompanies.length})</span>
          {!partnerVisible && (
            <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-black">
              RIBBON HIDDEN
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: TESTIMONIALS */}
      {activeTab === "testimonials" && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Average Rating</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-2xl font-black text-slate-900">5.0 / 5.0</p>
                  <div className="flex items-center text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-emerald-600 font-medium mt-0.5">100% 5-Star Feedback</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <Star className="w-6 h-6 fill-amber-500" />
              </div>
            </div>

            {/* Quick Switch to Partner Marquee */}
            <div className="bg-gradient-to-br from-[#0B1536] to-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-md flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Channel Partner Marquee</span>
                </span>
                <span
                  className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                    partnerVisible ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30" : "bg-red-500/20 text-red-300 border border-red-400/30"
                  }`}
                >
                  {partnerVisible ? "ACTIVE ON HOME" : "HIDDEN"}
                </span>
              </div>
              <p className="text-xs text-slate-300 mb-3">
                {visiblePartnersCount} of {partnerCompanies.length} partner logos currently live on the homepage marquee ribbon.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab("partners")}
                className="w-full py-2 px-3 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <span>Manage Partner Companies</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Testimonials List */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900">Current Testimonials ({testimonials.length})</h3>
                <p className="text-xs text-slate-500">
                  These reviews are dynamically served on the public homepage slider. Toggle visibility or delete anytime.
                </p>
              </div>
            </div>

            {loading ? (
              <div className="p-12 text-center text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-[#2563EB]" />
                <p className="text-xs">Loading testimonials...</p>
              </div>
            ) : testimonials.length === 0 ? (
              <div className="p-12 text-center text-slate-400 space-y-3">
                <MessageSquareQuote className="w-12 h-12 mx-auto text-slate-300" />
                <p className="font-semibold text-slate-600 text-sm">No testimonials added yet.</p>
                <Button onClick={() => setAddModalOpen(true)} size="sm">
                  Add Your First Testimonial
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {testimonials.map((item) => (
                  <div
                    key={item.id}
                    className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4 hover:bg-slate-50/60 transition-colors"
                  >
                    <div className="flex items-start gap-4 flex-1">
                      {item.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.avatar_url}
                          alt={item.client_name}
                          className="w-12 h-12 rounded-full object-cover border border-slate-200 shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-blue-100 text-[#2563EB] font-black text-sm flex items-center justify-center shrink-0">
                          {item.client_name.slice(0, 2).toUpperCase()}
                        </div>
                      )}

                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-bold text-sm text-slate-900">{item.client_name}</h4>
                          {item.client_role && (
                            <span className="text-xs text-slate-500">• {item.client_role}</span>
                          )}
                          {item.company_name && (
                            <span className="text-xs font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                              {item.company_name}
                            </span>
                          )}
                        </div>

                        {item.destination_route && (
                          <div className="flex items-center gap-1.5 text-xs text-blue-600 font-medium">
                            <MapPin className="w-3.5 h-3.5" />
                            <span>{item.destination_route}</span>
                          </div>
                        )}

                        <div className="flex items-center text-amber-400 gap-0.5 my-1">
                          {[...Array(item.rating || 5)].map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-current" />
                          ))}
                        </div>

                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed italic">
                          &ldquo;{item.review}&rdquo;
                        </p>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-slate-100">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(item.id, item.is_active)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                          item.is_active
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                            : "bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200"
                        }`}
                      >
                        {item.is_active ? (
                          <>
                            <Eye className="w-3.5 h-3.5" />
                            <span>Visible</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3.5 h-3.5" />
                            <span>Hidden</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeletingItem(item)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors font-medium"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: CHANNEL PARTNER MARQUEE COMPANIES */}
      {activeTab === "partners" && (
        <div className="space-y-6">
          {/* Ribbon Control Banner */}
          <div className="bg-gradient-to-r from-[#0B1536] via-slate-900 to-[#1e293b] text-white p-6 rounded-2xl shadow-md border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-blue-400 bg-blue-950/80 px-2.5 py-0.5 rounded border border-blue-800/60">
                  Global Partner Ribbon
                </span>
                <span
                  className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                    partnerVisible
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30"
                      : "bg-red-500/20 text-red-300 border border-red-400/30"
                  }`}
                >
                  {partnerVisible ? "VISIBLE ON WEBSITE" : "HIDDEN ON WEBSITE"}
                </span>
              </div>
              <h3 className="text-xl font-black text-white tracking-tight">
                Our Channel Partner Marquee
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Add courier companies by name and official website. We automatically fetch the logo and display it in clean white rounded cards matching the reference design. Toggle hide/show for each company individually or toggle the entire marquee ribbon.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={handleTogglePartner}
                disabled={togglingPartner}
                className={`w-full sm:w-auto py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
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
                    <span>Hide Entire Marquee</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5" />
                    <span>Show Entire Marquee</span>
                  </>
                )}
              </button>

              <Button
                onClick={() => setAddPartnerModalOpen(true)}
                className="w-full sm:w-auto bg-[#2563EB] hover:bg-[#1D4ED8] text-white flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Channel Partner</span>
              </Button>
            </div>
          </div>

          {/* Partner Companies Grid */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  Channel Partner Companies ({partnerCompanies.length})
                </h3>
                <p className="text-xs text-slate-500">
                  {visiblePartnersCount} active &amp; visible in the marquee • {partnerCompanies.length - visiblePartnersCount} hidden
                </p>
              </div>

              <div className="text-xs font-semibold text-slate-500 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span>Active cards loop seamlessly on public home</span>
              </div>
            </div>

            {partnerCompanies.length === 0 ? (
              <div className="p-12 text-center text-slate-400 space-y-3">
                <Layers className="w-12 h-12 mx-auto text-slate-300" />
                <p className="font-semibold text-slate-600 text-sm">No channel partner companies yet.</p>
                <Button onClick={() => setAddPartnerModalOpen(true)} size="sm">
                  Add Channel Partner
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-5 sm:p-6 bg-slate-50/40">
                {partnerCompanies.map((company) => (
                  <div
                    key={company.id}
                    className={`bg-white rounded-2xl border p-4 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between ${
                      company.is_visible ? "border-slate-200" : "border-slate-200 opacity-60 bg-slate-50"
                    }`}
                  >
                    {/* Top: Card logo preview (matching reference style) */}
                    <div className="bg-slate-50/80 rounded-xl border border-slate-200/80 h-20 flex items-center justify-center p-3 mb-3 relative overflow-hidden group/prev">
                      <ChannelPartnerLogo company={company} />
                      <span
                        className={`absolute top-2 right-2 text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider ${
                          company.is_visible
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {company.is_visible ? "Visible" : "Hidden"}
                      </span>
                    </div>

                    {/* Middle: Details */}
                    <div className="space-y-1 mb-3">
                      <h4 className="font-bold text-sm text-slate-900 truncate" title={company.name}>
                        {company.name}
                      </h4>
                      {company.website && (
                        <a
                          href={company.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[#2563EB] hover:underline flex items-center gap-1 truncate"
                          title={company.website}
                        >
                          <Globe className="w-3 h-3 shrink-0" />
                          <span className="truncate">{company.website.replace(/^https?:\/\//i, "")}</span>
                          <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                        </a>
                      )}
                    </div>

                    {/* Bottom Action Controls */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleIndividualCompany(company.id, company.is_visible)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                          company.is_visible
                            ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                            : "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                        }`}
                      >
                        {company.is_visible ? (
                          <>
                            <EyeOff className="w-3.5 h-3.5 text-slate-500" />
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
                        onClick={() => setDeletingPartner(company)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Remove Company"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Testimonial Modal */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Add Verified Testimonial"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Client Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Vikram Malhotra"
                required
                className="w-full h-10 px-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[#2563EB] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Client Role / Designation
              </label>
              <input
                type="text"
                value={formRole}
                onChange={(e) => setFormRole(e.target.value)}
                placeholder="e.g. Managing Director"
                className="w-full h-10 px-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[#2563EB] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Company / City
              </label>
              <input
                type="text"
                value={formCompany}
                onChange={(e) => setFormCompany(e.target.value)}
                placeholder="e.g. Silk Crafts India, Jaipur"
                className="w-full h-10 px-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[#2563EB] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Shipping Route / Destination
              </label>
              <input
                type="text"
                value={formRoute}
                onChange={(e) => setFormRoute(e.target.value)}
                placeholder="e.g. Mumbai to New York Air Express"
                className="w-full h-10 px-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[#2563EB] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Star Rating
              </label>
              <select
                value={formRating}
                onChange={(e) => setFormRating(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[#2563EB] focus:outline-none font-semibold text-amber-600"
              >
                <option value="5">⭐⭐⭐⭐⭐ 5 Stars (Excellent)</option>
                <option value="4">⭐⭐⭐⭐ 4 Stars (Very Good)</option>
                <option value="3">⭐⭐⭐ 3 Stars (Good)</option>
              </select>
            </div>

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

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Avatar Image URL (Optional)
            </label>
            <input
              type="url"
              value={formAvatar}
              onChange={(e) => setFormAvatar(e.target.value)}
              placeholder="https://... (or leave blank for auto initials badge)"
              className="w-full h-10 px-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[#2563EB] focus:outline-none"
            />
          </div>

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

      {/* Add Channel Partner Modal */}
      <Modal
        isOpen={addPartnerModalOpen}
        onClose={() => setAddPartnerModalOpen(false)}
        title="Add Channel Partner Company"
      >
        <form onSubmit={handleAddPartnerSubmit} className="space-y-4">
          {partnerFormError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600">
              {partnerFormError}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Company / Carrier Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={partnerName}
              onChange={(e) => setPartnerName(e.target.value)}
              placeholder="e.g. UniUni, FedEx, DHL Express, DPD, GOFO"
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
                placeholder="e.g. https://www.uniuni.com or www.fedex.com"
                required
                className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[#2563EB] focus:outline-none"
              />
              <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              We automatically fetch the high-resolution logo from this domain.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Custom Logo URL (Optional)
            </label>
            <input
              type="url"
              value={partnerLogoUrl}
              onChange={(e) => setPartnerLogoUrl(e.target.value)}
              placeholder="Optional: Provide direct image URL or leave blank for auto-fetch"
              className="w-full h-10 px-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[#2563EB] focus:outline-none"
            />
          </div>

          {/* Live Preview of Card */}
          {partnerWebsite.trim() && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
                Card Preview on Marquee:
              </span>
              <div className="bg-white rounded-xl border border-slate-200 shadow-2xs h-20 px-6 py-3 flex items-center justify-center">
                <ChannelPartnerLogo
                  company={{
                    id: "preview",
                    name: partnerName || "Company Name",
                    website: partnerWebsite,
                    logo_url: partnerLogoUrl,
                    is_visible: true,
                  }}
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setAddPartnerModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmittingPartner}
              className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white"
            >
              {isSubmittingPartner ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add to Marquee"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Testimonial Confirmation Modal */}
      {deletingItem && (
        <DeleteConfirmModal
          isOpen={Boolean(deletingItem)}
          onClose={() => setDeletingItem(null)}
          onConfirm={handleDeleteConfirm}
          title="Delete Testimonial"
          entityName={`review by ${deletingItem.client_name}`}
          description={`Are you sure you want to permanently delete the testimonial by "${deletingItem.client_name}"?`}
        />
      )}

      {/* Delete Partner Company Confirmation Modal */}
      {deletingPartner && (
        <DeleteConfirmModal
          isOpen={Boolean(deletingPartner)}
          onClose={() => setDeletingPartner(null)}
          onConfirm={handleDeletePartnerConfirm}
          title="Remove Channel Partner"
          entityName={deletingPartner.name}
          description={`Are you sure you want to remove "${deletingPartner.name}" from the Channel Partner Marquee?`}
        />
      )}
    </div>
  );
}
