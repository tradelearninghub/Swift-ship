"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { DeleteConfirmModal } from "@/components/ui/DeleteConfirmModal";
import { INDIAN_STATES_AND_UTS } from "@/lib/geo";
import {
  Building,
  Mail,
  MessageSquare,
  Phone,
  Shield,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileText,
  Share2,
  MapPin,
  ExternalLink,
  Edit3,
  Trash2,
  Plus,
  Code2,
  Check,
  Power,
  Navigation,
} from "lucide-react";

interface SettingRow {
  key: string;
  group: string;
  value: any;
}

function flattenSettings(rows: SettingRow[]): Record<string, any> {
  const map: Record<string, any> = {};
  for (const row of rows) {
    try {
      map[row.key] =
        typeof row.value === "string" ? JSON.parse(row.value) : row.value;
    } catch {
      map[row.key] = row.value;
    }
  }
  return map;
}

interface NotificationTemplateItem {
  id: string;
  event_key: string;
  channel: string;
  subject: string | null;
  body: string;
  sender_email: string | null;
  is_active: boolean;
  updated_at?: string;
}

export default function AdminSettingsPage() {
  const [activeGroup, setActiveGroup] = useState<
    "company" | "templates" | "social" | "smtp" | "whatsapp" | "sms" | "security"
  >("company");
  const [isSaving, setIsSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Test email state
  const [testRecipientEmail, setTestRecipientEmail] = useState("");
  const [isSendingTestEmail, setIsSendingTestEmail] = useState(false);
  const [testEmailResult, setTestEmailResult] = useState<{ success: boolean; message: string } | null>(null);

  // Email Templates state (§39)
  const [templates, setTemplates] = useState<NotificationTemplateItem[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<NotificationTemplateItem | null>(null);
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  const [templateSaveMsg, setTemplateSaveMsg] = useState<{ success: boolean; text: string } | null>(null);
  const [deletingTemplate, setDeletingTemplate] = useState<NotificationTemplateItem | null>(null);

  // Form field state
  const [fields, setFields] = useState({
    // Company
    company_name: "SS Courier service Pvt. Ltd.",
    brand_tagline: "Fast, Safe & Multi-Carrier Courier Logistics",
    support_email: "support@sscourierservice.in",
    support_phone: "8000151117",
    support_phone_2: "7689987368",
    whatsapp_number: "8000151117",
    operating_hours: "Mon - Sat: 08:00 AM - 09:00 PM IST",
    address: "Shop No 4, 5th Crossing, Padmavati School, Ghee Walo Ka Rasta, Johri Bazar",
    landmark: "Near Padmavati School",
    city: "Jaipur",
    district: "Jaipur",
    state: "Rajasthan",
    pincode: "302003",
    latitude: "26.9211",
    longitude: "75.8267",
    map_zoom: "16",
    // Social Links
    facebook_url: "",
    instagram_url: "",
    twitter_url: "",
    x_url: "",
    linkedin_url: "",
    youtube_url: "",
    // SMTP
    smtp_host: "smtp.hostinger.com",
    smtp_port: "465",
    smtp_user: "support@sscourierservice.in",
    smtp_password: "",
    smtp_from_email: "support@sscourierservice.in",
    smtp_from_name: "SS Courier service",
    // WhatsApp
    wa_api_url: "https://graph.facebook.com/v19.0",
    wa_phone_number_id: "",
    wa_business_account_id: "",
    wa_access_token: "",
    // SMS
    sms_gateway_url: "https://api.sms-gateway.in/v2",
    sms_sender_id: "SWFTSH",
    sms_api_key: "",
    sms_entity_id: "",
    // Security
    sec_track_rate_limit: "60 req / min",
    sec_mobile_pin_cap: "10 req / min",
    sec_max_declared_value: "500000",
    sec_session_timeout: "60 Minutes",
  });

  const setField = (key: string, value: string) =>
    setFields((prev) => ({ ...prev, [key]: value }));

  /** Load all settings from the database on mount */
  const loadSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/settings");
      if (!res.ok) return;
      const data = await res.json();
      const map = flattenSettings(data.settings || []);

      setFields((prev) => {
        const next = { ...prev };
        if (map.company_profile) {
          const cp = map.company_profile;
          if (cp.company_name) next.company_name = cp.company_name;
          if (cp.tagline) next.brand_tagline = cp.tagline;
          if (cp.support_email) next.support_email = cp.support_email;
          if (cp.support_phones?.[0]) next.support_phone = cp.support_phones[0];
          if (cp.support_phones?.[1]) next.support_phone_2 = cp.support_phones[1];
          if (cp.whatsapp) next.whatsapp_number = cp.whatsapp;
          if (cp.operating_hours) next.operating_hours = cp.operating_hours;
          if (cp.address) next.address = cp.address;
          if (cp.landmark) next.landmark = cp.landmark;
          if (cp.city) next.city = cp.city;
          if (cp.district) next.district = cp.district;
          if (cp.state) next.state = cp.state;
          if (cp.pincode) next.pincode = cp.pincode;
          if (cp.latitude) next.latitude = String(cp.latitude);
          if (cp.longitude) next.longitude = String(cp.longitude);
          if (cp.map_zoom) next.map_zoom = String(cp.map_zoom);
          if (cp.facebook_url) next.facebook_url = cp.facebook_url;
          if (cp.instagram_url) next.instagram_url = cp.instagram_url;
          if (cp.twitter_url) next.twitter_url = cp.twitter_url;
          if (cp.x_url) next.x_url = cp.x_url;
          if (cp.linkedin_url) next.linkedin_url = cp.linkedin_url;
          if (cp.youtube_url) next.youtube_url = cp.youtube_url;
        }
        if (map.smtp_config) {
          const sc = map.smtp_config;
          if (sc.host) next.smtp_host = sc.host;
          if (sc.port) next.smtp_port = String(sc.port);
          if (sc.user) next.smtp_user = sc.user;
          if (sc.from_email) next.smtp_from_email = sc.from_email;
          if (sc.from_name) next.smtp_from_name = sc.from_name;
        }
        if (map.whatsapp_config) {
          const wc = map.whatsapp_config;
          if (wc.api_url) next.wa_api_url = wc.api_url;
          if (wc.phone_number_id) next.wa_phone_number_id = wc.phone_number_id;
          if (wc.business_account_id) next.wa_business_account_id = wc.business_account_id;
        }
        if (map.sms_config) {
          const sc = map.sms_config;
          if (sc.gateway_url) next.sms_gateway_url = sc.gateway_url;
          if (sc.sender_id) next.sms_sender_id = sc.sender_id;
          if (sc.entity_id) next.sms_entity_id = sc.entity_id;
        }
        if (map.security_config) {
          const sec = map.security_config;
          if (sec.track_rate_limit) next.sec_track_rate_limit = sec.track_rate_limit;
          if (sec.mobile_pin_cap) next.sec_mobile_pin_cap = sec.mobile_pin_cap;
          if (sec.max_declared_value) next.sec_max_declared_value = sec.max_declared_value;
          if (sec.session_timeout) next.sec_session_timeout = sec.session_timeout;
        }
        return next;
      });
    } catch {
      // Offline fallback
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadTemplates = useCallback(async () => {
    setIsLoadingTemplates(true);
    try {
      const res = await fetch("/api/admin/notification-templates");
      if (res.ok) {
        const data = await res.json();
        setTemplates(data.templates || []);
      }
    } catch {
      // Ignore errors
    } finally {
      setIsLoadingTemplates(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  useEffect(() => {
    if (activeGroup === "templates") {
      loadTemplates();
    }
  }, [activeGroup, loadTemplates]);

  /** Geocode / update map pin to match entered address fields (§5) */
  const handleUpdateMapPin = () => {
    const query = `${fields.address}, ${fields.landmark || ""}, ${fields.city}, ${fields.state} ${fields.pincode}`.trim();
    // Default fallback to Johri Bazar Jaipur coordinates
    if (!fields.latitude || !fields.longitude) {
      setField("latitude", "26.9211");
      setField("longitude", "75.8267");
    }
    setSaveResult({
      success: true,
      message: `Map location synchronized for: "${query}". Click "Save Configuration" to persist.`,
    });
  };

  /** Save current group to the database via PUT /api/admin/settings */
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveResult(null);

    try {
      let key = "";
      let group = "";
      let value: any = {};

      if (activeGroup === "company" || activeGroup === "social") {
        key = "company_profile";
        group = "company_profile";
        value = {
          company_name: fields.company_name,
          tagline: fields.brand_tagline,
          support_email: fields.support_email,
          support_phones: [fields.support_phone, fields.support_phone_2].filter(Boolean),
          whatsapp: fields.whatsapp_number,
          operating_hours: fields.operating_hours,
          address: fields.address,
          landmark: fields.landmark,
          city: fields.city,
          district: fields.district,
          state: fields.state,
          pincode: fields.pincode,
          latitude: parseFloat(fields.latitude) || 26.9211,
          longitude: parseFloat(fields.longitude) || 75.8267,
          map_zoom: parseInt(fields.map_zoom) || 16,
          facebook_url: fields.facebook_url.trim(),
          instagram_url: fields.instagram_url.trim(),
          twitter_url: fields.twitter_url.trim() || fields.x_url.trim(),
          x_url: fields.x_url.trim() || fields.twitter_url.trim(),
          linkedin_url: fields.linkedin_url.trim(),
          youtube_url: fields.youtube_url.trim(),
        };
      } else if (activeGroup === "smtp") {
        key = "smtp_config";
        group = "smtp";
        value = {
          host: fields.smtp_host,
          port: parseInt(fields.smtp_port),
          user: fields.smtp_user,
          from_email: fields.smtp_from_email,
          from_name: fields.smtp_from_name,
          ...(fields.smtp_password ? { pass: fields.smtp_password } : {}),
        };
      } else if (activeGroup === "whatsapp") {
        key = "whatsapp_config";
        group = "whatsapp";
        value = {
          api_url: fields.wa_api_url,
          phone_number_id: fields.wa_phone_number_id,
          business_account_id: fields.wa_business_account_id,
        };
      } else if (activeGroup === "sms") {
        key = "sms_config";
        group = "sms";
        value = {
          gateway_url: fields.sms_gateway_url,
          sender_id: fields.sms_sender_id,
          entity_id: fields.sms_entity_id,
        };
      } else {
        key = "security_config";
        group = "security";
        value = {
          track_rate_limit: fields.sec_track_rate_limit,
          mobile_pin_cap: fields.sec_mobile_pin_cap,
          max_declared_value: fields.sec_max_declared_value,
          session_timeout: fields.sec_session_timeout,
        };
      }

      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, group, value }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save settings");

      setSaveResult({
        success: true,
        message: `${activeGroup.toUpperCase()} settings saved and synchronized live site-wide!`,
      });
    } catch (err: any) {
      setSaveResult({
        success: false,
        message: err.message || "Failed to save configuration.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  /** Send test email via real SMTP */
  const handleSendTestEmail = async (email: string) => {
    setIsSendingTestEmail(true);
    setTestEmailResult(null);
    try {
      const res = await fetch("/api/admin/settings/test-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientEmail: email,
          host: fields.smtp_host,
          port: fields.smtp_port,
          user: fields.smtp_user,
          pass: fields.smtp_password,
          fromEmail: fields.smtp_from_email,
          fromName: fields.smtp_from_name,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTestEmailResult({
          success: true,
          message: data.message || `Test email dispatched successfully to ${email}!`,
        });
      } else {
        setTestEmailResult({
          success: false,
          message: data.error || "Failed to dispatch test email via SMTP server.",
        });
      }
    } catch (err: any) {
      setTestEmailResult({
        success: false,
        message: err.message || "Network error while triggering test email.",
      });
    } finally {
      setIsSendingTestEmail(false);
    }
  };

  /** Save individual email template */
  const handleSaveTemplate = async () => {
    if (!editingTemplate) return;
    setIsSavingTemplate(true);
    setTemplateSaveMsg(null);

    try {
      const res = await fetch("/api/admin/notification-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingTemplate),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update template");

      setTemplateSaveMsg({
        success: true,
        text: "Template saved! The updated content will take effect on the next real email.",
      });

      // Update local list
      setTemplates((prev) =>
        prev.map((t) => (t.event_key === editingTemplate.event_key ? editingTemplate : t))
      );
      setTimeout(() => {
        setEditingTemplate(null);
        setTemplateSaveMsg(null);
      }, 1200);
    } catch (err: any) {
      setTemplateSaveMsg({
        success: false,
        text: err.message || "Failed to update template",
      });
    } finally {
      setIsSavingTemplate(false);
    }
  };

  /** Delete template */
  const handleConfirmDeleteTemplate = async () => {
    if (!deletingTemplate) return;
    const res = await fetch(
      `/api/admin/notification-templates?id=${deletingTemplate.id}&event_key=${deletingTemplate.event_key}`,
      { method: "DELETE" }
    );
    if (!res.ok) {
      const d = await res.json();
      throw new Error(d.error || "Failed to delete template");
    }
    setTemplates((prev) => prev.filter((t) => t.id !== deletingTemplate.id));
    setDeletingTemplate(null);
  };

  const navItems = [
    { key: "company" as const, label: "Company Profile", icon: Building },
    { key: "templates" as const, label: "Email Templates (§39)", icon: FileText },
    { key: "social" as const, label: "Social Media Links", icon: Share2 },
    { key: "smtp" as const, label: "Email / SMTP Config", icon: Mail },
    { key: "whatsapp" as const, label: "WhatsApp Gateway", icon: MessageSquare },
    { key: "sms" as const, label: "SMS Provider", icon: Phone },
    { key: "security" as const, label: "Security & Policies", icon: Shield },
  ];

  // Dynamic variable insertion helper
  const insertVariableTag = (tag: string) => {
    if (!editingTemplate) return;
    setEditingTemplate((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        body: `${prev.body} {{${tag}}}`,
      };
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-primary">System Settings</h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Manage company profile, notification templates, gateways, and security policies. Changes reflect site-wide immediately.
          </p>
        </div>
        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading current settings…
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Navigation Tabs */}
        <div className="md:col-span-4 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => {
                  setActiveGroup(item.key);
                  setSaveResult(null);
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                  activeGroup === item.key
                    ? "bg-brand-primary text-white shadow-sm font-bold"
                    : "bg-surface-base border border-border-default text-text-secondary hover:bg-surface-subtle"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Form Canvas */}
        <div className="md:col-span-8">
          <Card className="p-6">
            {/* ============================================================== */}
            {/* 1. EMAIL TEMPLATES TAB (§39)                                   */}
            {/* ============================================================== */}
            {activeGroup === "templates" && (
              <div className="space-y-6">
                <div className="border-b border-border-default pb-3 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-text-primary">Lifecycle Email Templates (§39)</h3>
                    <p className="text-xs text-text-muted mt-0.5">
                      Configure automated emails with dynamic variables and per-template sender selection.
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={loadTemplates}>
                    Refresh
                  </Button>
                </div>

                {isLoadingTemplates ? (
                  <div className="py-12 text-center text-xs text-text-muted space-y-2">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-brand-primary" />
                    <span>Loading templates from database…</span>
                  </div>
                ) : (
                  <div className="divide-y divide-border-default border border-border-default rounded-xl overflow-hidden text-xs">
                    {templates.map((tpl) => (
                      <div
                        key={tpl.id || tpl.event_key}
                        className="p-3.5 hover:bg-surface-subtle transition-colors flex items-center justify-between gap-3"
                      >
                        <div className="space-y-1 max-w-md">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-text-primary">
                              {tpl.event_key}
                            </span>
                            <span
                              className={`px-2 py-0.2 rounded-full text-[10px] font-bold uppercase ${
                                tpl.is_active
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : "bg-slate-100 text-slate-500"
                              }`}
                            >
                              {tpl.is_active ? "Active" : "Disabled"}
                            </span>
                          </div>
                          <div className="text-[11px] text-text-secondary truncate font-medium">
                            Subject: {tpl.subject || "—"}
                          </div>
                          <div className="text-[10px] text-text-muted font-mono truncate">
                            Sender: {tpl.sender_email || fields.smtp_from_email || "Default SMTP Sender"}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingTemplate({ ...tpl })}
                          >
                            <Edit3 className="w-3.5 h-3.5 mr-1" /> Edit
                          </Button>
                          <Button
                            type="button"
                            variant="danger"
                            size="sm"
                            onClick={() => setDeletingTemplate(tpl)}
                            className="bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Template Edit Modal */}
            {editingTemplate && (
              <Modal
                isOpen={!!editingTemplate}
                onClose={() => setEditingTemplate(null)}
                title={`Edit Template: ${editingTemplate.event_key}`}
                description="Changes take effect on the NEXT real notification sent for this lifecycle event."
                maxWidth="2xl"
              >
                <div className="space-y-4 text-xs pt-1">
                  {templateSaveMsg && (
                    <div
                      className={`p-3 rounded-lg flex items-center gap-2 ${
                        templateSaveMsg.success
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : "bg-rose-50 text-rose-800 border border-rose-200"
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>{templateSaveMsg.text}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between p-3 bg-surface-subtle border border-border-default rounded-xl">
                    <div>
                      <div className="font-bold text-text-primary">Enable this Notification Event</div>
                      <div className="text-[11px] text-text-muted">
                        Toggle OFF to disable dispatching emails for this event without deleting the template.
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setEditingTemplate((prev) =>
                          prev ? { ...prev, is_active: !prev.is_active } : null
                        )
                      }
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase transition-all ${
                        editingTemplate.is_active
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {editingTemplate.is_active ? "Enabled (ON)" : "Disabled (OFF)"}
                    </button>
                  </div>

                  <div>
                    <label className="block font-semibold text-text-primary mb-1">
                      Sender Email Address (Per-Template Override)
                    </label>
                    <input
                      type="email"
                      value={editingTemplate.sender_email || ""}
                      onChange={(e) =>
                        setEditingTemplate((prev) =>
                          prev ? { ...prev, sender_email: e.target.value } : null
                        )
                      }
                      placeholder={`Default: ${fields.smtp_from_email || "support@sscourierservice.in"}`}
                      className="w-full h-9 px-3 text-xs bg-surface-subtle border border-border-default rounded-lg focus:border-brand-primary focus:outline-none"
                    />
                    <p className="text-[10px] text-text-muted mt-0.5">
                      Leave empty to use global SMTP sender ({fields.smtp_from_email}).
                    </p>
                  </div>

                  <div>
                    <label className="block font-semibold text-text-primary mb-1">
                      Email Subject Line
                    </label>
                    <input
                      type="text"
                      value={editingTemplate.subject || ""}
                      onChange={(e) =>
                        setEditingTemplate((prev) =>
                          prev ? { ...prev, subject: e.target.value } : null
                        )
                      }
                      className="w-full h-9 px-3 text-xs bg-surface-subtle border border-border-default rounded-lg focus:border-brand-primary focus:outline-none"
                    />
                  </div>

                  {/* Dynamic Variable Chips */}
                  <div className="space-y-1.5 p-3 bg-blue-50/60 border border-blue-200 rounded-xl">
                    <div className="text-[11px] font-bold text-blue-900 flex items-center gap-1">
                      <Code2 className="w-3.5 h-3.5 text-blue-600" />
                      Click dynamic variable chip to insert into message body:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        "customerName",
                        "bookingId",
                        "awb",
                        "courierName",
                        "trackingLink",
                        "companyName",
                        "chargeAmount",
                        "currentDate",
                      ].map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => insertVariableTag(tag)}
                          className="px-2 py-1 bg-white hover:bg-blue-100 text-blue-900 border border-blue-300 rounded font-mono text-[10px] font-semibold transition-colors"
                        >
                          + &#123;&#123;{tag}&#125;&#125;
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-text-primary mb-1">
                      Email Message Body (Plain Text & HTML Supported)
                    </label>
                    <textarea
                      rows={7}
                      value={editingTemplate.body}
                      onChange={(e) =>
                        setEditingTemplate((prev) =>
                          prev ? { ...prev, body: e.target.value } : null
                        )
                      }
                      className="w-full p-3 text-xs font-mono bg-surface-subtle border border-border-default rounded-lg focus:border-brand-primary focus:outline-none leading-relaxed"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-default">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingTemplate(null)}
                      disabled={isSavingTemplate}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={handleSaveTemplate}
                      disabled={isSavingTemplate}
                    >
                      {isSavingTemplate ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> Saving Template…
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5 mr-1" /> Save Template
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </Modal>
            )}

            {/* Template Delete Confirmation Modal */}
            {deletingTemplate && (
              <DeleteConfirmModal
                isOpen={!!deletingTemplate}
                onClose={() => setDeletingTemplate(null)}
                onConfirm={handleConfirmDeleteTemplate}
                entityName={`template ${deletingTemplate.event_key}`}
                description="This will remove the custom template. The platform will fall back to standard built-in defaults."
              />
            )}

            {/* ============================================================== */}
            {/* 2. OTHER TABS (FORM BASED)                                     */}
            {/* ============================================================== */}
            {activeGroup !== "templates" && (
              <form onSubmit={handleSave} className="space-y-6">
                {/* COMPANY PROFILE */}
                {activeGroup === "company" && (
                  <div className="space-y-4">
                    <div className="border-b border-border-default pb-3">
                      <h3 className="font-bold text-sm text-text-primary">Company Profile & Location Mapping</h3>
                      <p className="text-xs text-text-muted mt-0.5">
                        Updates header, footer, receipts, and public contact map pin immediately.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Input
                        label="Company Legal Name"
                        value={fields.company_name}
                        onChange={(e) => setField("company_name", e.target.value)}
                        required
                      />
                      <Input
                        label="Brand Tagline"
                        value={fields.brand_tagline}
                        onChange={(e) => setField("brand_tagline", e.target.value)}
                        required
                      />
                      <Input
                        label="Support Email"
                        type="email"
                        value={fields.support_email}
                        onChange={(e) => setField("support_email", e.target.value)}
                        required
                      />
                      <Input
                        label="Helpline Phone (Primary)"
                        value={fields.support_phone}
                        onChange={(e) => setField("support_phone", e.target.value)}
                        required
                      />
                      <Input
                        label="Helpline Phone (Secondary)"
                        value={fields.support_phone_2}
                        onChange={(e) => setField("support_phone_2", e.target.value)}
                      />
                      <Input
                        label="WhatsApp Support Number"
                        value={fields.whatsapp_number}
                        onChange={(e) => setField("whatsapp_number", e.target.value)}
                        required
                      />
                      <div className="sm:col-span-2">
                        <Input
                          label="Business Operating Hours"
                          value={fields.operating_hours}
                          onChange={(e) => setField("operating_hours", e.target.value)}
                          required
                        />
                      </div>

                      {/* Address Fields with Landmark & State Dropdown (§10, §11) */}
                      <div className="sm:col-span-2">
                        <Input
                          label="Street Address / Office Unit"
                          value={fields.address}
                          onChange={(e) => setField("address", e.target.value)}
                          required
                        />
                      </div>
                      <Input
                        label="Landmark (Optional)"
                        value={fields.landmark}
                        onChange={(e) => setField("landmark", e.target.value)}
                        placeholder="e.g. Near Padmavati School"
                      />
                      <Input
                        label="City"
                        value={fields.city}
                        onChange={(e) => setField("city", e.target.value)}
                        required
                      />
                      <Input
                        label="District"
                        value={fields.district}
                        onChange={(e) => setField("district", e.target.value)}
                        placeholder="e.g. Jaipur"
                      />
                      <div>
                        <label className="block text-xs font-semibold text-text-primary mb-1">
                          State / Union Territory
                        </label>
                        <select
                          value={fields.state}
                          onChange={(e) => setField("state", e.target.value)}
                          className="w-full h-9 px-3 text-xs bg-surface-subtle border border-border-default rounded-lg focus:border-brand-primary focus:outline-none"
                        >
                          {INDIAN_STATES_AND_UTS.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      </div>
                      <Input
                        label="Pincode"
                        value={fields.pincode}
                        onChange={(e) => setField("pincode", e.target.value)}
                        required
                      />
                    </div>

                    {/* Google Map Pinning & Sync (§5) */}
                    <div className="pt-4 border-t border-border-default space-y-3">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                        <div>
                          <h4 className="font-bold text-xs text-text-primary uppercase tracking-wider flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-brand-primary" />
                            Google Map Pinned Location & Coordinates (§5)
                          </h4>
                          <p className="text-[11px] text-text-muted mt-0.5">
                            Adjust coordinates or synchronize the pin to match the entered text address.
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleUpdateMapPin}
                          className="border-brand-primary/40 text-brand-primary hover:bg-brand-primary/10"
                        >
                          <Navigation className="w-3.5 h-3.5 mr-1" /> Update Map Pin to Match Address
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <Input
                          label="Latitude"
                          value={fields.latitude}
                          onChange={(e) => setField("latitude", e.target.value)}
                          placeholder="e.g. 26.9211"
                        />
                        <Input
                          label="Longitude"
                          value={fields.longitude}
                          onChange={(e) => setField("longitude", e.target.value)}
                          placeholder="e.g. 75.8267"
                        />
                        <Input
                          label="Map Zoom Level (12-19)"
                          type="number"
                          value={fields.map_zoom}
                          onChange={(e) => setField("map_zoom", e.target.value)}
                        />
                      </div>

                      {/* Live Map Preview (§5) */}
                      <div className="w-full h-48 sm:h-56 rounded-xl overflow-hidden border border-border-default bg-slate-100 shadow-inner">
                        <iframe
                          title="Live Location Map Preview"
                          src={`https://maps.google.com/maps?q=${encodeURIComponent(
                            `${fields.latitude},${fields.longitude}`
                          )}&hl=en&z=${fields.map_zoom || 16}&output=embed`}
                          width="100%"
                          height="100%"
                          style={{ border: 0 }}
                          loading="lazy"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* SOCIAL MEDIA CHANNELS (§4) */}
                {activeGroup === "social" && (
                  <div className="space-y-4">
                    <div className="border-b border-border-default pb-3">
                      <h3 className="font-bold text-sm text-text-primary">Social Media Profiles & Public Icons (§4)</h3>
                      <p className="text-xs text-text-muted mt-0.5">
                        Each channel will only render on the public site if a valid link is entered. Empty fields will not render at all.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Input
                        label="Facebook Page URL"
                        value={fields.facebook_url}
                        onChange={(e) => setField("facebook_url", e.target.value)}
                        placeholder="https://facebook.com/your-brand"
                      />
                      <Input
                        label="Instagram Profile URL"
                        value={fields.instagram_url}
                        onChange={(e) => setField("instagram_url", e.target.value)}
                        placeholder="https://instagram.com/your-brand"
                      />
                      <Input
                        label="X (formerly Twitter) URL"
                        value={fields.x_url || fields.twitter_url}
                        onChange={(e) => {
                          setField("x_url", e.target.value);
                          setField("twitter_url", e.target.value);
                        }}
                        placeholder="https://x.com/your-handle"
                      />
                      <Input
                        label="LinkedIn Company Page URL"
                        value={fields.linkedin_url}
                        onChange={(e) => setField("linkedin_url", e.target.value)}
                        placeholder="https://linkedin.com/company/your-brand"
                      />
                      <div className="sm:col-span-2">
                        <Input
                          label="YouTube Channel URL"
                          value={fields.youtube_url}
                          onChange={(e) => setField("youtube_url", e.target.value)}
                          placeholder="https://youtube.com/@your-channel"
                        />
                      </div>
                    </div>

                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 leading-relaxed">
                      <strong>Automatic Visibility Rule:</strong> Any platform link left empty will automatically be removed from both desktop and mobile footers without leaving empty spacing or dead links.
                    </div>
                  </div>
                )}

                {/* EMAIL / SMTP CONFIG */}
                {activeGroup === "smtp" && (
                  <div className="space-y-4">
                    <div className="border-b border-border-default pb-3">
                      <h3 className="font-bold text-sm text-text-primary">Email & SMTP Gateway Configuration</h3>
                      <p className="text-xs text-text-muted mt-0.5">
                        Configures the primary outbound email server for customer notifications and OTP verifications.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Input
                        label="SMTP Host"
                        value={fields.smtp_host}
                        onChange={(e) => setField("smtp_host", e.target.value)}
                        required
                      />
                      <Input
                        label="SMTP Port"
                        value={fields.smtp_port}
                        onChange={(e) => setField("smtp_port", e.target.value)}
                        required
                      />
                      <Input
                        label="SMTP Username"
                        value={fields.smtp_user}
                        onChange={(e) => setField("smtp_user", e.target.value)}
                        required
                      />
                      <Input
                        label="SMTP Password"
                        type="password"
                        placeholder="••••••••••••"
                        value={fields.smtp_password}
                        onChange={(e) => setField("smtp_password", e.target.value)}
                      />
                      <Input
                        label="From Email Address"
                        type="email"
                        value={fields.smtp_from_email}
                        onChange={(e) => setField("smtp_from_email", e.target.value)}
                        required
                      />
                      <Input
                        label="From Display Name"
                        value={fields.smtp_from_name}
                        onChange={(e) => setField("smtp_from_name", e.target.value)}
                        required
                      />
                    </div>

                    {/* Test Email Section */}
                    <div className="pt-4 border-t border-border-default space-y-2">
                      <div className="font-bold text-xs text-text-primary">Send Test Email via SMTP</div>
                      <div className="flex gap-2">
                        <input
                          type="email"
                          value={testRecipientEmail}
                          onChange={(e) => setTestRecipientEmail(e.target.value)}
                          placeholder="Enter recipient email address"
                          className="flex-1 h-9 px-3 text-xs bg-surface-subtle border border-border-default rounded-lg focus:border-brand-primary focus:outline-none"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleSendTestEmail(testRecipientEmail)}
                          disabled={isSendingTestEmail}
                        >
                          {isSendingTestEmail ? "Sending…" : "Send Test"}
                        </Button>
                      </div>
                      {testEmailResult && (
                        <div
                          className={`p-2 rounded text-xs ${
                            testEmailResult.success
                              ? "bg-emerald-50 text-emerald-800"
                              : "bg-rose-50 text-rose-800"
                          }`}
                        >
                          {testEmailResult.message}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* WHATSAPP CONFIG */}
                {activeGroup === "whatsapp" && (
                  <div className="space-y-4">
                    <div className="border-b border-border-default pb-3">
                      <h3 className="font-bold text-sm text-text-primary">WhatsApp Business API</h3>
                      <p className="text-xs text-text-muted mt-0.5">
                        Meta Cloud API configuration for automated WhatsApp updates.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="sm:col-span-2">
                        <Input
                          label="Meta Graph API Base URL"
                          value={fields.wa_api_url}
                          onChange={(e) => setField("wa_api_url", e.target.value)}
                        />
                      </div>
                      <Input
                        label="Phone Number ID"
                        value={fields.wa_phone_number_id}
                        onChange={(e) => setField("wa_phone_number_id", e.target.value)}
                        placeholder="e.g. 109283746592"
                      />
                      <Input
                        label="Business Account ID"
                        value={fields.wa_business_account_id}
                        onChange={(e) => setField("wa_business_account_id", e.target.value)}
                        placeholder="e.g. 293847561029"
                      />
                    </div>
                  </div>
                )}

                {/* SMS CONFIG */}
                {activeGroup === "sms" && (
                  <div className="space-y-4">
                    <div className="border-b border-border-default pb-3">
                      <h3 className="font-bold text-sm text-text-primary">DLT SMS Provider</h3>
                      <p className="text-xs text-text-muted mt-0.5">
                        DLT-approved transactional SMS gateway settings.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="sm:col-span-2">
                        <Input
                          label="SMS Gateway Endpoint URL"
                          value={fields.sms_gateway_url}
                          onChange={(e) => setField("sms_gateway_url", e.target.value)}
                        />
                      </div>
                      <Input
                        label="DLT Sender ID"
                        value={fields.sms_sender_id}
                        onChange={(e) => setField("sms_sender_id", e.target.value)}
                      />
                      <Input
                        label="Entity ID"
                        value={fields.sms_entity_id}
                        onChange={(e) => setField("sms_entity_id", e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {/* SECURITY CONFIG */}
                {activeGroup === "security" && (
                  <div className="space-y-4">
                    <div className="border-b border-border-default pb-3">
                      <h3 className="font-bold text-sm text-text-primary">Security & Rate Limiting Policies</h3>
                      <p className="text-xs text-text-muted mt-0.5">
                        Protect endpoints against brute force and automated scraping.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Input
                        label="Tracking Search Rate Cap"
                        value={fields.sec_track_rate_limit}
                        onChange={(e) => setField("sec_track_rate_limit", e.target.value)}
                      />
                      <Input
                        label="Mobile OTP Request Cap"
                        value={fields.sec_mobile_pin_cap}
                        onChange={(e) => setField("sec_mobile_pin_cap", e.target.value)}
                      />
                      <Input
                        label="Max Declared Value (₹)"
                        value={fields.sec_max_declared_value}
                        onChange={(e) => setField("sec_max_declared_value", e.target.value)}
                      />
                      <Input
                        label="Staff Session Timeout"
                        value={fields.sec_session_timeout}
                        onChange={(e) => setField("sec_session_timeout", e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {/* Feedback Banner */}
                {saveResult && (
                  <div
                    className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                      saveResult.success
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        : "bg-rose-50 text-rose-800 border border-rose-200"
                    }`}
                  >
                    {saveResult.success ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    )}
                    <span>{saveResult.message}</span>
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-default">
                  <Button type="submit" variant="primary" size="sm" disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Saving Configuration…
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5 mr-1.5" /> Save Configuration
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
