"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Plane, LogIn, UserPlus, Lock, Loader2, ShieldCheck, CheckCircle2 } from "lucide-react";
import { InternationalBookingForm } from "@/components/booking/InternationalBookingForm";

export default function BookParcelPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);

  // Load authenticated customer details & address book on mount
  useEffect(() => {
    async function checkAuthAndLoadAddresses() {
      try {
        const authRes = await fetch("/api/auth/me");
        if (authRes.ok) {
          const authData = await authRes.json();
          if (authData.user) {
            setCurrentUser(authData.user);
            const addrRes = await fetch("/api/customer/addresses");
            if (addrRes.ok) {
              const addrData = await addrRes.json();
              setSavedAddresses(addrData.addresses || []);
            }
          }
        }
      } catch (e) {
        // Guest user browsing unauthenticated
      } finally {
        setLoading(false);
      }
    }
    checkAuthAndLoadAddresses();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-8 animate-in fade-in-50 duration-300">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase bg-amber-50 text-amber-800 border border-amber-200 shadow-xs">
          <Plane className="w-3.5 h-3.5 text-[#C58B24] animate-pulse" />
          <span>Global Air Express Courier</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#06122C] tracking-tight">
          Book International Shipment
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Fast, customs-cleared global parcel dispatch across 220+ countries with automated commercial invoices, live tracking, and door-to-door transit.
        </p>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-xs">
          <Loader2 className="w-8 h-8 animate-spin text-[#C58B24] mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-600">Checking authorization...</p>
        </div>
      ) : !currentUser ? (
        /* Unauthenticated User: Login Required Gate */
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden max-w-xl mx-auto">
          <div className="bg-[#06122C] p-6 text-white text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-white/10 text-[#C58B24] flex items-center justify-center mx-auto mb-2 border border-white/15">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold tracking-tight">Sign In Required</h2>
            <p className="text-xs text-slate-300 max-w-md mx-auto">
              Please log in to your verified customer account to book an international shipment and access automated commercial invoices.
            </p>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            <div className="space-y-3 text-xs text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-2 font-bold text-slate-800">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Why is login required?</span>
              </div>
              <ul className="space-y-1.5 pl-6 list-disc text-slate-600">
                <li>Automated consignor KYC &amp; commercial invoice generation</li>
                <li>One-click address book saving &amp; pickup scheduling</li>
                <li>Real-time shipment milestone notifications &amp; AWB tracking</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/login?redirect=/book"
                className="flex-1 py-3 px-4 rounded-xl bg-[#C58B24] hover:bg-[#b07b1d] text-white font-bold text-sm text-center shadow-md shadow-[#C58B24]/20 transition-all flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In to Continue</span>
              </Link>
              <Link
                href="/register?redirect=/book"
                className="flex-1 py-3 px-4 rounded-xl border border-slate-300 hover:border-slate-400 bg-white text-slate-700 font-bold text-sm text-center hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4 text-slate-500" />
                <span>Create Free Account</span>
              </Link>
            </div>
          </div>
        </div>
      ) : (
        /* Authenticated: Show Booking Form */
        <InternationalBookingForm
          savedAddresses={savedAddresses}
          customerId={currentUser.id}
          customerName={currentUser.name}
          customerEmail={currentUser.email}
          customerMobile={currentUser.mobile}
        />
      )}
    </div>
  );
}
