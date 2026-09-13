"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import {
  Settings,
  Building,
  Mail,
  MessageSquare,
  Phone,
  Shield,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";

interface SettingRow {
  key: string;
  group: string;
  value: any;
}

/** Flatten the settings array returned by the API into a key→value map */
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

export default function AdminSettingsPage() {
  const [activeGroup, setActiveGroup] = useState("company");
  const [isSaving, setIsSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Test email state
  const [testRecipientEmail, setTestRecipientEmail] = useState("admin@sscourierservice.in");
  const [isSendingTestEmail, setIsSendingTestEmail] = useState(false);
  const [testEmailResult, setTestEmailResult] = useState<{ success: boolean; message: string } | null>(null);

  // Form field state — all groups in one object
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
    city: "Jaipur",
    pincode: "302003",
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

      // Merge into fields — only overwrite keys that exist in the API response
      setFields((prev) => {
        const next = { ...prev };
        // Company profile is stored as a JSON blob under key "company_profile"
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
          if (cp.city) next.city = cp.city;
          if (cp.pincode) next.pincode = cp.pincode;
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
          const smc = map.sms_config;
          if (smc.gateway_url) next.sms_gateway_url = smc.gateway_url;
          if (smc.sender_id) next.sms_sender_id = smc.sender_id;
          if (smc.entity_id) next.sms_entity_id = smc.entity_id;
        }
        return next;
      });
    } catch {
      // Silently use defaults if API unreachable
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  /** Save the current group's settings to the database */
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveResult(null);

    try {
      let key: string;
      let group: string;
      let value: any;

      if (activeGroup === "company") {
        key = "company_profile";
        group = "company";
        value = {
          company_name: fields.company_name,
          tagline: fields.brand_tagline,
          support_email: fields.support_email,
          support_phones: [fields.support_phone, fields.support_phone_2].filter(Boolean),
          whatsapp: fields.whatsapp_number,
          operating_hours: fields.operating_hours,
          address: fields.address,
          city: fields.city,
          state: "Rajasthan",
          pincode: fields.pincode,
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
          // access_token stored in env — not DB
        };
      } else if (activeGroup === "sms") {
        key = "sms_config";
        group = "sms";
        value = {
          gateway_url: fields.sms_gateway_url,
          sender_id: fields.sms_sender_id,
          entity_id: fields.sms_entity_id,
          // api_key stored in env — not DB
        };
      } else {
        // Security group — stored as individual keys
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
        body: JSON.stringify({ key, group, value: JSON.stringify(value) }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSaveResult({ success: true, message: "Settings saved successfully." });
      } else {
        setSaveResult({ success: false, message: data.error || "Failed to save settings." });
      }
    } catch (err: any) {
      setSaveResult({ success: false, message: err.message || "Network error." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendTestEmail = async () => {
    const email = testRecipientEmail.trim();
    if (!email || !email.includes("@")) {
      setTestEmailResult({ success: false, message: "Please enter a valid recipient email address." });
      return;
    }
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
          pass: fields.smtp_password || undefined,
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

  const navItems = [
    { key: "company", label: "Company Profile", icon: Building },
    { key: "smtp", label: "Email / SMTP Config", icon: Mail },
    { key: "whatsapp", label: "WhatsApp Gateway", icon: MessageSquare },
    { key: "sms", label: "SMS Provider", icon: Phone },
    { key: "security", label: "Security & Rate Limiting", icon: Shield },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-primary">System Settings</h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Manage company profile, notification gateways, and security policies. Changes are saved to the database and reflect site-wide immediately.
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
        {/* Navigation Sidebar */}
        <div className="md:col-span-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                onClick={() => { setActiveGroup(item.key); setSaveResult(null); }}
                className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-semibold text-left transition-all ${
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
            <form onSubmit={handleSave} className="space-y-6">
              {/* COMPANY PROFILE */}
              {activeGroup === "company" && (
                <div className="space-y-4">
                  <div className="border-b border-border-default pb-3">
                    <h3 className="font-bold text-sm text-text-primary">Company Profile & Dynamic Information</h3>
                    <p className="text-xs text-text-muted mt-0.5">
                      Updates header, footer, receipts, and public tracking branding immediately without code changes.
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
                    <Input
                      label="Business Operating Hours"
                      value={fields.operating_hours}
                      onChange={(e) => setField("operating_hours", e.target.value)}
                      required
                    />
                    <div className="sm:col-span-2">
                      <Input
                        label="Full Hub & Office Address"
                        value={fields.address}
                        onChange={(e) => setField("address", e.target.value)}
                        required
                      />
                    </div>
                    <Input
                      label="City"
                      value={fields.city}
                      onChange={(e) => setField("city", e.target.value)}
                      required
                    />
                    <Input
                      label="Pincode"
                      value={fields.pincode}
                      onChange={(e) => setField("pincode", e.target.value)}
                      required
                    />
                  </div>
                </div>
              )}

              {/* SMTP / EMAIL */}
              {activeGroup === "smtp" && (
                <div className="space-y-4">
                  <div className="border-b border-border-default pb-3">
                    <h3 className="font-bold text-sm text-text-primary">Email & SMTP Provider Integration</h3>
                    <p className="text-xs text-text-muted mt-0.5">
                      Configure outgoing email server credentials for booking confirmations and dispatch alerts.
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
                      value={fields.smtp_password}
                      onChange={(e) => setField("smtp_password", e.target.value)}
                      placeholder="Leave blank to keep existing"
                    />
                    <Input
                      label="From Email Address"
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

                  {/* SMTP Test */}
                  <div className="pt-4 border-t border-border-default space-y-3">
                    <div>
                      <h4 className="text-xs font-bold text-text-primary">Send Test Connection Email</h4>
                      <p className="text-[11px] text-text-muted mt-0.5">
                        Specify any custom email address to test live SMTP credentials and delivery end-to-end.
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 max-w-lg">
                      <div className="flex-1">
                        <Input
                          type="email"
                          value={testRecipientEmail}
                          onChange={(e) => setTestRecipientEmail(e.target.value)}
                          placeholder="recipient@example.com"
                          required
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="md"
                        onClick={handleSendTestEmail}
                        isLoading={isSendingTestEmail}
                        className="shrink-0"
                      >
                        Send Test Email
                      </Button>
                    </div>

                    {testEmailResult && (
                      <div
                        className={`p-3 rounded-xl text-xs flex items-start gap-2.5 transition-all ${
                          testEmailResult.success
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : "bg-rose-50 text-rose-800 border border-rose-200"
                        }`}
                      >
                        {testEmailResult.success ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        )}
                        <div className="space-y-0.5">
                          <p className="font-semibold">
                            {testEmailResult.success ? "SMTP Dispatch Verified" : "SMTP Dispatch Failed"}
                          </p>
                          <p className="text-[11px] leading-relaxed">{testEmailResult.message}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* WHATSAPP */}
              {activeGroup === "whatsapp" && (
                <div className="space-y-4">
                  <div className="border-b border-border-default pb-3">
                    <h3 className="font-bold text-sm text-text-primary">WhatsApp Business API Integration</h3>
                    <p className="text-xs text-text-muted mt-0.5">
                      Meta Graph API credentials for real-time delivery milestone templates.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Input
                      label="API Base URL"
                      value={fields.wa_api_url}
                      onChange={(e) => setField("wa_api_url", e.target.value)}
                      required
                    />
                    <Input
                      label="Phone Number ID"
                      value={fields.wa_phone_number_id}
                      onChange={(e) => setField("wa_phone_number_id", e.target.value)}
                      required
                    />
                    <Input
                      label="WhatsApp Business Account ID"
                      value={fields.wa_business_account_id}
                      onChange={(e) => setField("wa_business_account_id", e.target.value)}
                      required
                    />
                    <Input
                      label="Bearer Access Token"
                      type="password"
                      value={fields.wa_access_token}
                      onChange={(e) => setField("wa_access_token", e.target.value)}
                      placeholder="Leave blank to keep existing"
                    />
                  </div>
                </div>
              )}

              {/* SMS GATEWAY */}
              {activeGroup === "sms" && (
                <div className="space-y-4">
                  <div className="border-b border-border-default pb-3">
                    <h3 className="font-bold text-sm text-text-primary">SMS Provider Gateway</h3>
                    <p className="text-xs text-text-muted mt-0.5">
                      DLT-approved SMS sender ID and template routing for India OTP & critical alerts.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      label="SMS Gateway URL"
                      value={fields.sms_gateway_url}
                      onChange={(e) => setField("sms_gateway_url", e.target.value)}
                      required
                    />
                    <Input
                      label="DLT Sender ID (6 Chars)"
                      value={fields.sms_sender_id}
                      onChange={(e) => setField("sms_sender_id", e.target.value)}
                      required
                    />
                    <Input
                      label="API Key / Auth Token"
                      type="password"
                      value={fields.sms_api_key}
                      onChange={(e) => setField("sms_api_key", e.target.value)}
                      placeholder="Leave blank to keep existing"
                    />
                    <Input
                      label="Entity ID"
                      value={fields.sms_entity_id}
                      onChange={(e) => setField("sms_entity_id", e.target.value)}
                      required
                    />
                  </div>
                </div>
              )}

              {/* SECURITY */}
              {activeGroup === "security" && (
                <div className="space-y-4">
                  <div className="border-b border-border-default pb-3">
                    <h3 className="font-bold text-sm text-text-primary">Security & Hardening Policies</h3>
                    <p className="text-xs text-text-muted mt-0.5">
                      Configure tracking rate limits, session expiration, and fraud protections.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      label="Public Track Endpoint Rate Limit"
                      value={fields.sec_track_rate_limit}
                      onChange={(e) => setField("sec_track_rate_limit", e.target.value)}
                      required
                    />
                    <Input
                      label="Mobile+Pincode Brute-Force Cap"
                      value={fields.sec_mobile_pin_cap}
                      onChange={(e) => setField("sec_mobile_pin_cap", e.target.value)}
                      required
                    />
                    <Input
                      label="Max Declared Parcel Value Cap (₹)"
                      value={fields.sec_max_declared_value}
                      onChange={(e) => setField("sec_max_declared_value", e.target.value)}
                      required
                    />
                    <Input
                      label="Admin Session Inactivity Timeout"
                      value={fields.sec_session_timeout}
                      onChange={(e) => setField("sec_session_timeout", e.target.value)}
                      required
                    />
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-border-default flex items-center justify-between">
                {saveResult && (
                  <span
                    className={`text-xs font-semibold flex items-center gap-1.5 ${
                      saveResult.success ? "text-emerald-700" : "text-rose-700"
                    }`}
                  >
                    {saveResult.success ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5" />
                    )}
                    {saveResult.message}
                  </span>
                )}
                {!saveResult && <span />}
                <Button type="submit" variant="primary" size="md" isLoading={isSaving}>
                  {isSaving ? "Saving…" : "Save Changes"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
