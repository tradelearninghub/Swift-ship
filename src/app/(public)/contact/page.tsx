"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { MOCK_COMPANY_SETTINGS } from "@/lib/mockData";
import { MapPin, Phone, Mail, Clock, MessageSquare, CheckCircle2 } from "lucide-react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-container mx-auto px-4 py-12 space-y-16">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-brand-primary bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
          Get in Touch
        </span>
        <h1 className="text-display">Contact Our Logistics Support Team</h1>
        <p className="text-body text-lg">
          Have questions regarding an active shipment, commercial rates, or API integration? We are here to help.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start max-w-5xl mx-auto">
        {/* Dynamic Company Details Card (§7) */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="p-6 space-y-6 shadow-md border-brand-primary/20">
            <div>
              <h3 className="text-lg font-bold text-text-primary">
                {MOCK_COMPANY_SETTINGS.company_name}
              </h3>
              <p className="text-xs text-text-secondary mt-1">
                {MOCK_COMPANY_SETTINGS.brand_tagline}
              </p>
            </div>

            <div className="space-y-4 text-xs text-text-secondary">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-brand-accent shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-text-primary">Headquarters & Hub:</div>
                  <p className="mt-0.5 leading-relaxed">
                    {MOCK_COMPANY_SETTINGS.address}, {MOCK_COMPANY_SETTINGS.city},{" "}
                    {MOCK_COMPANY_SETTINGS.state} - {MOCK_COMPANY_SETTINGS.pincode}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-brand-accent shrink-0" />
                <div>
                  <div className="font-bold text-text-primary">Helpline Number:</div>
                  <p className="font-mono text-text-primary">{MOCK_COMPANY_SETTINGS.support_phone}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <div className="font-bold text-text-primary">WhatsApp Support:</div>
                  <p className="font-mono text-text-primary">{MOCK_COMPANY_SETTINGS.whatsapp_number}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-brand-accent shrink-0" />
                <div>
                  <div className="font-bold text-text-primary">Support Email:</div>
                  <p className="text-brand-primary">{MOCK_COMPANY_SETTINGS.support_email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-slate-500 shrink-0" />
                <div>
                  <div className="font-bold text-text-primary">Operating Hours:</div>
                  <p>{MOCK_COMPANY_SETTINGS.operating_hours}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-7">
          <Card className="p-6 md:p-8 shadow-md">
            {submitted ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-text-primary">Message Sent Successfully</h3>
                <p className="text-xs text-text-secondary max-w-sm mx-auto">
                  Thank you for reaching out. Our support desk will respond to your query within 2 business hours.
                </p>
                <Button variant="outline" size="sm" onClick={() => setSubmitted(false)}>
                  Send Another Message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-text-primary">Send Us a Message</h3>
                  <p className="text-xs text-text-secondary">
                    Fill out the form below and an agent will contact you shortly.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="Your Name" placeholder="e.g. Rahul Sharma" required />
                  <Input label="Mobile Number" type="tel" placeholder="10-digit mobile" required />
                </div>

                <Input label="Email Address" type="email" placeholder="name@company.com" required />
                <Input label="AWB or Booking ID (if applicable)" placeholder="e.g. BK-1025" />

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-text-primary">
                    Message / Inquiry <span className="text-status-danger">*</span>
                  </label>
                  <textarea
                    rows={4}
                    className="w-full px-3.5 py-2 text-sm bg-surface-base border border-border-default rounded-lg focus:ring-1 focus:ring-brand-primary placeholder:text-text-muted"
                    placeholder="How can our logistics team assist you today?"
                    required
                  />
                </div>

                <Button type="submit" variant="primary" size="lg" className="w-full shadow-md">
                  Submit Inquiry
                </Button>
              </form>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
