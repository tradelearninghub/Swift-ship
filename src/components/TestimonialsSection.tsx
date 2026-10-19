"use client";

import React, { useEffect, useState } from "react";
import { Testimonial, INITIAL_TESTIMONIALS } from "@/lib/testimonials";
import { Star, ChevronLeft, ChevronRight, Quote, MapPin } from "lucide-react";

interface TestimonialsSectionProps {
  initialData?: Testimonial[];
}

export function TestimonialsSection({ initialData }: TestimonialsSectionProps) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(
    initialData && initialData.length > 0 ? initialData : INITIAL_TESTIMONIALS
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

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

  // Auto-slide every 5.5 seconds unless paused by hover
  useEffect(() => {
    if (testimonials.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5500);

    return () => clearInterval(timer);
  }, [testimonials.length, isPaused]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  if (!testimonials || testimonials.length === 0) {
    return null;
  }

  const current = testimonials[currentIndex] || testimonials[0];

  const initials = (current.client_name || "SS")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <section className="py-16 sm:py-24 bg-white relative overflow-hidden border-t border-slate-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Minimal Section Header */}
        <div className="text-center mb-10 sm:mb-14">
          <span className="text-[11px] font-bold text-[#2563EB] uppercase tracking-widest bg-blue-50/80 px-3 py-1 rounded-full border border-blue-100 inline-block mb-3">
            Client Feedback
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0B1536] tracking-tight">
            Trusted by Exporters &amp; Senders
          </h2>
        </div>

        {/* Minimal Slide Card */}
        <div
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="relative bg-slate-50/70 border border-slate-200/80 rounded-3xl p-8 sm:p-12 shadow-2xs transition-all duration-300"
        >
          {/* Subtle Quote Icon Watermark */}
          <Quote className="w-10 h-10 text-slate-200/80 absolute top-6 left-6 -scale-x-100 pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center text-center">
            {/* Star Rating */}
            <div className="flex items-center text-amber-400 gap-1 mb-5">
              {[...Array(Math.max(1, Math.min(5, current.rating || 5)))].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>

            {/* Quote Review Text */}
            <blockquote className="text-base sm:text-lg lg:text-xl text-slate-800 font-medium leading-relaxed max-w-2xl mx-auto mb-8 min-h-[90px] flex items-center justify-center">
              &ldquo;{current.review}&rdquo;
            </blockquote>

            {/* Author Profile */}
            <div className="flex flex-col items-center">
              {current.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={current.avatar_url}
                  alt={current.client_name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-xs mb-2.5"
                />
              ) : (
                <div className="w-11 h-11 rounded-full bg-blue-100 text-[#2563EB] font-bold text-sm flex items-center justify-center mb-2.5 shadow-2xs">
                  {initials}
                </div>
              )}

              <h4 className="font-bold text-sm sm:text-base text-slate-900 tracking-tight">
                {current.client_name}
              </h4>

              <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs text-slate-500 mt-0.5">
                {current.client_role && <span>{current.client_role}</span>}
                {current.company_name && (
                  <>
                    <span className="opacity-40">•</span>
                    <span>{current.company_name}</span>
                  </>
                )}
                {current.destination_route && (
                  <>
                    <span className="opacity-40">•</span>
                    <span className="text-[#2563EB] font-medium flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {current.destination_route}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Minimal Slide Arrows */}
          {testimonials.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous testimonial"
                className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white border border-slate-200 text-slate-600 hover:text-[#2563EB] hover:border-blue-200 hover:shadow-xs flex items-center justify-center transition-all cursor-pointer z-20"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next testimonial"
                className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white border border-slate-200 text-slate-600 hover:text-[#2563EB] hover:border-blue-200 hover:shadow-xs flex items-center justify-center transition-all cursor-pointer z-20"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        {/* Minimal Pagination Dots */}
        {testimonials.length > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  idx === currentIndex
                    ? "w-7 h-2 bg-[#2563EB]"
                    : "w-2 h-2 bg-slate-300 hover:bg-slate-400"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
