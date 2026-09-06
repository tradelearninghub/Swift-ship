"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Bell, Mail, MessageSquare, Phone, Check, X, ShieldCheck } from "lucide-react";

export default function AdminNotificationsPage() {
  const [rules, setRules] = useState([
    { event: "booking.created", label: "Booking Request Created", email: true, whatsapp: true, sms: false },
    { event: "booking.approved", label: "Booking Approved & Rate Confirmed", email: true, whatsapp: true, sms: true },
    { event: "shipment.awb_generated", label: "AWB Generated & Dispatched", email: true, whatsapp: true, sms: true },
    { event: "shipment.in_transit", label: "Shipment In Transit Checkpoint", email: false, whatsapp: true, sms: false },
    { event: "shipment.out_for_delivery", label: "Out for Delivery (OTP Trigger)", email: true, whatsapp: true, sms: true },
    { event: "shipment.delivered", label: "Shipment Delivered / POD Signed", email: true, whatsapp: true, sms: true },
    { event: "shipment.rto", label: "Return to Origin (RTO) Exception", email: true, whatsapp: true, sms: true },
    { event: "cod.collected", label: "COD Cash Collected by Courier", email: true, whatsapp: true, sms: false },
  ]);

  const toggleChannel = (index: number, channel: "email" | "whatsapp" | "sms") => {
    setRules((prev) =>
      prev.map((r, i) => (i === index ? { ...r, [channel]: !r[channel] } : r))
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Notification Rules & Dispatch Grid</h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Configure per-event automated multi-channel triggers for Email, WhatsApp, and SMS (§42).
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="py-3 bg-surface-subtle">
          <CardTitle className="text-xs uppercase tracking-wider text-text-muted flex items-center gap-1.5">
            <Bell className="w-3.5 h-3.5 text-brand-primary" /> Lifecycle Event Dispatch Matrix (§42)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-subtle border-b border-border-default uppercase text-text-muted">
                <tr>
                  <th className="px-4 py-3 font-semibold">Lifecycle Event</th>
                  <th className="px-4 py-3 font-semibold text-center">
                    <span className="inline-flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-blue-600" /> Email (SMTP)
                    </span>
                  </th>
                  <th className="px-4 py-3 font-semibold text-center">
                    <span className="inline-flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-600" /> WhatsApp Business
                    </span>
                  </th>
                  <th className="px-4 py-3 font-semibold text-center">
                    <span className="inline-flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-amber-600" /> SMS Gateway
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-default">
                {rules.map((rule, idx) => (
                  <tr key={rule.event} className="hover:bg-surface-subtle transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-text-primary">{rule.label}</div>
                      <div className="text-[10px] font-mono text-text-muted">{rule.event}</div>
                    </td>

                    {/* Email Switch */}
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => toggleChannel(idx, "email")}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all ${
                          rule.email
                            ? "bg-blue-100 text-blue-800 border border-blue-300"
                            : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        {rule.email ? "ON" : "OFF"}
                      </button>
                    </td>

                    {/* WhatsApp Switch */}
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => toggleChannel(idx, "whatsapp")}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all ${
                          rule.whatsapp
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                            : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        {rule.whatsapp ? "ON" : "OFF"}
                      </button>
                    </td>

                    {/* SMS Switch */}
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => toggleChannel(idx, "sms")}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all ${
                          rule.sms
                            ? "bg-amber-100 text-amber-800 border border-amber-300"
                            : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        {rule.sms ? "ON" : "OFF"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
