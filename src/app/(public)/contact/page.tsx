"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { MOCK_COMPANY_SETTINGS } from "@/lib/mockData";
import { MapPin, Phone, Mail, Clock, MessageSquare, CheckCircle2, Navigation } from "lucide-react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [settings, setSettings] = useState(MOCK_COMPANY_SETTINGS);

  useEffect(() => {
    // Dynamically fetch company profile settings per §7
    fetch("/api/admin/settings?group=company_profile")
      .then((res) => res.json())
      .then((data) => {
        if (data.setting) {
          const val = typeof data.setting === "string" ? JSON.parse(data.setting) : data.setting;
          setSettings((prev) => ({
            ...prev,
            ...val,
            support_phones: Array.isArray(val.support_phones)
              ? val.support_phones
              : val.support_phone
              ? [val.support_phone, "7689987368"]
              : prev.support_phones,
          }));
        }
      })
      .catch(() => {
        // Fallback to initial settings
      });
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const phones = settings.support_phones || ["8000151117", "7689987368"];
  const mapUrl =
    settings.google_maps_embed_url ||
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3557.484920272099!2d75.82412537611685!3d26.921104759799295!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x396db14b1a473b11%3A0xb35a0f5a11c1e5cb!2sJohri%20Bazar%2C%20Jaipur%2C%20Rajasthan%20302003!5e0!3m2!1sen!2sin!4v1710000000000!5m2!1sen!2sin";

  return (
    <div className="max-w-container mx-auto px-4 py-12 space-y-16">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-brand-primary bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
          Get in Touch
        </span>
        <h1 className="text-display">Contact Our Logistics Support Team</h1>
        <p className="text-body text-lg">
          Have questions regarding an active shipment, rates, branch pickup, or commercial bookings? We are here to help.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start max-w-5xl mx-auto">
        {/* Dynamic Company Details Card (§7) */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="p-6 space-y-6 shadow-md border-brand-primary/20">
            <div>
              <h3 className="text-lg font-bold text-text-primary">
                {settings.company_name}
              </h3>
              <p className="text-xs text-text-secondary mt-1">
                {settings.brand_tagline || "Fast, Safe & Multi-Carrier Courier Logistics"}
              </p>
            </div>

            <div className="space-y-4 text-xs text-text-secondary">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-brand-accent shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-text-primary">Branch & Logistics Hub:</div>
                  <p className="mt-0.5 leading-relaxed text-slate-700 font-medium">
                    {settings.address}, {settings.city}, {settings.state} - {settings.pincode}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-brand-accent shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-text-primary">Helpline Numbers:</div>
                  <div className="font-mono text-text-primary flex flex-wrap gap-x-3 gap-y-1 mt-0.5">
                    {phones.map((phone, idx) => (
                      <a
                        key={idx}
                        href={`tel:${phone}`}
                        className="hover:text-brand-primary font-semibold transition-colors"
                      >
                        +91 {phone}
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <div className="font-bold text-text-primary">WhatsApp Support:</div>
                  <a
                    href={`https://wa.me/91${settings.whatsapp_number || "8000151117"}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-emerald-700 font-semibold hover:underline"
                  >
                    +91 {settings.whatsapp_number || "8000151117"}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-brand-accent shrink-0" />
                <div>
                  <div className="font-bold text-text-primary">Support Email:</div>
                  <a
                    href={`mailto:${settings.support_email}`}
                    className="text-brand-primary font-medium hover:underline"
                  >
                    {settings.support_email}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-slate-500 shrink-0" />
                <div>
                  <div className="font-bold text-text-primary">Operating Hours:</div>
                  <p>{settings.operating_hours}</p>
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
                  Thank you for reaching out. Our customer support desk will respond to your query promptly.
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
                    Fill out the form below and a representative will get back to you.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="Your Name" placeholder="Full name" required />
                  <Input label="Mobile Number" type="tel" placeholder="10-digit mobile number" maxLength={10} required />
                </div>

                <Input label="Email Address" type="email" placeholder="name@example.com" required />
                <Input label="AWB or Booking ID (Optional)" placeholder="e.g. AWB number if inquiring about parcel" />

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

      {/* Embedded Google Maps Section (§7) */}
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
              <Navigation className="w-5 h-5 text-brand-primary" />
              Visit Our Main Hub / Office Location
            </h3>
            <p className="text-xs text-text-secondary">
              {settings.address}, {settings.city}, {settings.state} - {settings.pincode}
            </p>
          </div>
          <a
            href="https://maps.google.com/?q=Padmavati+School+Johri+Bazar+Jaipur+Rajasthan+302003"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="sm">
              Open in Google Maps
            </Button>
          </a>
        </div>

        <div className="w-full h-80 sm:h-96 rounded-2xl overflow-hidden border border-border-default shadow-md bg-slate-100 relative">
          <iframe
            title="SS Courier service Location Map"
            src={mapUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen={false}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="w-full h-full"
          />
        </div>
      </div>
    </div>
  );
}
