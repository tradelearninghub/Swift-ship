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
  Lock,
  Globe,
} from "lucide-react";

export default function AdminSettingsPage() {
  const [activeGroup, setActiveGroup] = useState("company");
  const [saved, setSaved] = useState(false);

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
                    <Input label="SMTP Host" defaultValue="smtp.mailtrap.io" required />
                    <Input label="SMTP Port" defaultValue="587" required />
                    <Input label="SMTP Username" defaultValue="swift_relay_user" required />
                    <Input label="SMTP Password" type="password" defaultValue="••••••••••••" required />
                    <Input label="From Email Address" defaultValue="notifications@swiftship.com" required />
                    <Input label="From Display Name" defaultValue="Swift Ship Courier" required />
                  </div>

                  <div className="pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => alert("Test email sent to admin@swiftship.com successfully!")}
                    >
                      Send Test Connection Email (§38)
                    </Button>
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
