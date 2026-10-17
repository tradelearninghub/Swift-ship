"use client";

import React, { useEffect, useState } from "react";
import { Testimonial, INITIAL_TESTIMONIALS } from "@/lib/testimonials";
import { Star, Quote, CheckCircle2, Globe2, ShieldCheck, MapPin } from "lucide-react";

interface TestimonialsSectionProps {
  initialData?: Testimonial[];
}

export function TestimonialsSection({ initialData }: TestimonialsSectionProps) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(
    initialData && initialData.length > 0 ? initialData : INITIAL_TESTIMONIALS
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/testimonials")
      .then((res) => res.json())
      .then((data) => {
        if (data.testimonials && Array.isArray(data.testimonials) && data.testimonials.length > 0) {
          setTestimonials(data.testimonials);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <section className="py-20 sm:py-28 bg-[#F8FAFC] relative overflow-hidden border-t border-slate-200/80">
      {/* Subtle background decoration */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="main-container relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-[#2563EB] text-xs font-bold mb-3 shadow-2xs">
            <Star className="w-3.5 h-3.5 fill-[#2563EB]" />
            <span>Verified Customer Testimonials</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
            Trusted by <span className="text-[#2563EB]">Exporters &amp; Global Senders</span>
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-3 leading-relaxed">
            See how SS International Courier empowers businesses and individuals with punctual cross-border delivery, paperless customs clearance, and dedicated care.
          </p>

          {/* Aggregate Rating Pill */}
          <div className="inline-flex items-center gap-3 bg-white px-5 py-2.5 rounded-2xl border border-slate-200/90 shadow-xs mt-6">
            <div className="flex items-center text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <span className="font-extrabold text-sm text-slate-900">4.9 / 5.0</span>
            <span className="text-slate-300">|</span>
            <span className="text-xs text-slate-500 font-medium">Over 10,000+ Cross-Border Parcels Handled</span>
          </div>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 sm:gap-8">
          {testimonials.map((item) => {
            const initials = item.client_name
              .split(" ")
              .map((n) => n[0])
              .slice(0, 2)
              .join("")
              .toUpperCase();

            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl p-7 sm:p-8 border border-slate-200/90 shadow-xs hover:shadow-xl hover:border-blue-300 transition-all duration-300 flex flex-col justify-between relative group"
              >
                {/* Quote Icon watermark */}
                <Quote className="absolute top-6 right-6 w-10 h-10 text-slate-100 group-hover:text-blue-50 transition-colors pointer-events-none" />

                <div>
                  {/* Top Bar: Route Badge & Rating */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                    {item.destination_route ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#2563EB] text-xs font-semibold border border-blue-200/80">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span>{item.destination_route}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span>Verified Shipment</span>
                      </span>
                    )}

                    <div className="flex items-center text-amber-400">
                      {[...Array(Math.max(1, Math.min(5, item.rating)))].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                  </div>

                  {/* Review Text */}
                  <p className="text-slate-700 text-sm sm:text-base leading-relaxed mb-6 font-normal">
                    &ldquo;{item.review}&rdquo;
                  </p>
                </div>

                {/* Bottom: Client Profile Card */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {item.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.avatar_url}
                        alt={item.client_name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#0B1536] to-blue-600 text-white font-black text-sm flex items-center justify-center shadow-sm shrink-0">
                        {initials}
                      </div>
                    )}

                    <div className="min-w-0">
                      <h4 className="font-bold text-sm text-slate-900 tracking-tight truncate">
                        {item.client_name}
                      </h4>
                      <p className="text-xs text-slate-500 truncate">
                        {item.client_role}
                      </p>
                      {item.company_name && (
                        <p className="text-[11px] text-[#2563EB] font-medium truncate">
                          {item.company_name}
                        </p>
                      )}
                    </div>
                  </div>

                  {item.tag && (
                    <span className="hidden sm:inline-block text-[10px] font-semibold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 shrink-0">
                      {item.tag}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Banner */}
        <div className="mt-12 text-center bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-left">
            <h4 className="font-bold text-sm text-slate-900">Are you sending an urgent parcel?</h4>
            <p className="text-xs text-slate-500">Experience our priority air cargo network with free doorstep collection.</p>
          </div>
          <a
            href="/book"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all shrink-0"
          >
            <span>Book a Shipment</span>
          </a>
        </div>
      </div>
    </section>
  );
}
