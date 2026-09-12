"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { MOCK_COMPANY_SETTINGS } from "@/lib/mockData";
import {
  Settings,
  Building,
  Mail,
  MessageSquare,
  Phone,
  Shield,
  CheckCircle2,
  AlertCircle,
  Lock,
  Globe,
} from "lucide-react";

export default function AdminSettingsPage() {
  const [activeGroup, setActiveGroup] = useState("company");
  const [saved, setSaved] = useState(false);
  const [testRecipientEmail, setTestRecipientEmail] = useState("admin@sscourierservice.in");
  const [isSendingTestEmail, setIsSendingTestEmail] = useState(false);
  const [testEmailResult, setTestEmailResult] = useState<{ success: boolean; message: string } | null>(null);

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
        body: JSON.stringify({ recipientEmail: email }),
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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const navItems = [
    { key: "company", label: "Company Profile (§7)", icon: Building },
    { key: "smtp", label: "Email / SMTP Config (§38)", icon: Mail },
    { key: "whatsapp", label: "WhatsApp Gateway (§40)", icon: MessageSquare },
    { key: "sms", label: "SMS Provider (§41)", icon: Phone },
    { key: "security", label: "Security & Rate Limiting (§53)", icon: Shield },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-primary">System Settings Architecture</h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Dynamic database-driven configuration for company profile, notification gateways, and security (§51–52).
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Navigation Sidebar */}
        <div className="md:col-span-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                onClick={() => setActiveGroup(item.key)}
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
                    <h3 className="font-bold text-sm text-text-primary">
                      Company Profile & Dynamic Information (§7, §52)
                    </h3>
                    <p className="text-xs text-text-muted mt-0.5">
                      Updates header, footer, receipts, and public tracking branding immediately without code changes.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      label="Company Legal Name"
                      defaultValue={MOCK_COMPANY_SETTINGS.company_name}
                      required
                    />
                    <Input
                      label="Brand Tagline"
                      defaultValue={MOCK_COMPANY_SETTINGS.brand_tagline}
                      required
                    />
                    <Input
                      label="Support Email"
                      type="email"
                      defaultValue={MOCK_COMPANY_SETTINGS.support_email}
                      required
                    />
                    <Input
                      label="Helpline Phone"
                      defaultValue={MOCK_COMPANY_SETTINGS.support_phone}
                      required
                    />
                    <Input
                      label="WhatsApp Support Number"
                      defaultValue={MOCK_COMPANY_SETTINGS.whatsapp_number}
                      required
                    />
                    <Input
                      label="Business Operating Hours"
                      defaultValue={MOCK_COMPANY_SETTINGS.operating_hours}
                      required
                    />
                    <div className="sm:col-span-2">
                      <Input
                        label="Full Hub & Office Address"
                        defaultValue={MOCK_COMPANY_SETTINGS.address}
                        required
                      />
                    </div>
                    <Input label="City" defaultValue={MOCK_COMPANY_SETTINGS.city} required />
                    <Input label="Pincode" defaultValue={MOCK_COMPANY_SETTINGS.pincode} required />
                  </div>
                </div>
              )}

              {/* SMTP / EMAIL */}
              {activeGroup === "smtp" && (
                <div className="space-y-4">
                  <div className="border-b border-border-default pb-3">
                    <h3 className="font-bold text-sm text-text-primary">
                      Email & SMTP Provider Integration (§38)
                    </h3>
                    <p className="text-xs text-text-muted mt-0.5">
                      Configure outgoing email server credentials for booking confirmations and dispatch alerts.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input label="SMTP Host" defaultValue="smtp.hostinger.com" required />
                    <Input label="SMTP Port" defaultValue="465" required />
                    <Input label="SMTP Username" defaultValue="support@sscourierservice.in" required />
                    <Input label="SMTP Password" type="password" defaultValue="••••••••••••" required />
                    <Input label="From Email Address" defaultValue="support@sscourierservice.in" required />
                    <Input label="From Display Name" defaultValue="SS Courier service" required />
                  </div>

                  {/* Real SMTP Sending & Choose Recipient Address (New Feature) */}
                  <div className="pt-4 border-t border-border-default space-y-3">
                    <div>
                      <h4 className="text-xs font-bold text-text-primary">
                        Send Test Connection Email (§38)
                      </h4>
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
                    <h3 className="font-bold text-sm text-text-primary">
                      WhatsApp Business API Integration (§40)
                    </h3>
                    <p className="text-xs text-text-muted mt-0.5">
                      Meta Graph API credentials for real-time delivery milestone templates.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Input label="API Base URL" defaultValue="https://graph.facebook.com/v19.0" required />
                    <Input label="Phone Number ID" defaultValue="1098234871923" required />
                    <Input label="WhatsApp Business Account ID" defaultValue="998127391823" required />
                    <Input label="Bearer Access Token" type="password" defaultValue="EAAG98234192837198273" required />
                  </div>
                </div>
              )}

              {/* SMS GATEWAY */}
              {activeGroup === "sms" && (
                <div className="space-y-4">
                  <div className="border-b border-border-default pb-3">
                    <h3 className="font-bold text-sm text-text-primary">
                      SMS Provider Gateway (§41)
                    </h3>
                    <p className="text-xs text-text-muted mt-0.5">
                      DLT-approved SMS sender ID and template routing for India OTP & critical alerts.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input label="SMS Gateway URL" defaultValue="https://api.sms-gateway.in/v2" required />
                    <Input label="DLT Sender ID (6 Chars)" defaultValue="SWFTSH" required />
                    <Input label="API Key / Auth Token" type="password" defaultValue="sms_sec_991823" required />
                    <Input label="Entity ID" defaultValue="1401552391000028" required />
                  </div>
                </div>
              )}

              {/* SECURITY */}
              {activeGroup === "security" && (
                <div className="space-y-4">
                  <div className="border-b border-border-default pb-3">
                    <h3 className="font-bold text-sm text-text-primary">
                      Security & Hardening Policies (§53, §53a)
                    </h3>
                    <p className="text-xs text-text-muted mt-0.5">
                      Configure tracking rate limits, session expiration, and fraud protections.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input label="Public Track Endpoint Rate Limit" defaultValue="60 req / min" required />
                    <Input label="Mobile+Pincode Brute-Force Cap" defaultValue="10 req / min" required />
                    <Input label="Max Declared Parcel Value Cap (₹)" defaultValue="500000" required />
                    <Input label="Admin Session Inactivity Timeout" defaultValue="60 Minutes" required />
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-border-default flex items-center justify-between">
                <span className="text-xs text-emerald-700 font-semibold">
                  {saved && "✔ All settings updated in runtime store"}
                </span>
                <Button type="submit" variant="primary" size="md">
                  {saved ? "Saved Successfully" : "Save Changes"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
