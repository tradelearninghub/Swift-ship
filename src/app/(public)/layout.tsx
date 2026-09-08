import React from "react";
import Link from "next/link";
import { Truck, Phone, Mail, MapPin, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { MobileNav } from "@/components/MobileNav";
import { BottomNav } from "@/components/BottomNav";
import { getCompanyProfile } from "@/lib/settings";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCompanyProfile();
  const phone1 = profile.support_phones[0] || "8000151117";
  const phone2 = profile.support_phones[1] || "7689987368";

  return (
    <div className="flex flex-col min-h-screen bg-surface-base text-text-primary antialiased selection:bg-brand-primary selection:text-white">
      {/* 1. Top Announcement / Quick Contact Bar */}
      <div className="bg-slate-900 text-slate-300 text-xs py-2 px-4 border-b border-slate-800">
        <div className="max-w-container mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-4 sm:gap-6">
            <span className="flex items-center gap-1.5 font-medium">
              <Phone className="w-3.5 h-3.5 text-brand-accent" />
              <a href={`tel:${phone1}`} className="hover:text-white transition-colors">
                +91 {phone1}
              </a>
              <span className="text-slate-600 hidden sm:inline">/</span>
              <a href={`tel:${phone2}`} className="hover:text-white transition-colors hidden sm:inline">
                {phone2}
              </a>
            </span>
            <span className="hidden md:flex items-center gap-1.5 text-slate-400">
              <Mail className="w-3.5 h-3.5 text-brand-accent" />
              <a href={`mailto:${profile.support_email}`} className="hover:text-white transition-colors">
                {profile.support_email}
              </a>
            </span>
            <span className="hidden lg:flex items-center gap-1.5 text-slate-400">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Mon - Sat: 8 AM - 9 PM</span>
            </span>
          </div>

          <div className="flex items-center gap-3 font-medium">
            <Link href="/track" className="hover:text-white transition-colors text-slate-300">
              Quick Track
            </Link>
            <span className="text-slate-600">•</span>
            <Link href="/login" className="hover:text-white transition-colors text-slate-300">
              Customer Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Main Sticky Navigation Header */}
      <header className="sticky top-0 z-40 bg-surface-base/95 backdrop-blur border-b border-border-default transition-all">
        <div className="max-w-container mx-auto px-4 h-16 sm:h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 font-bold text-xl sm:text-2xl text-text-primary group">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-brand-primary flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <Truck className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="leading-tight">
              <span className="font-extrabold tracking-tight">
                SS Courier <span className="text-brand-primary">service</span>
              </span>
              <span className="hidden sm:block text-[10px] uppercase font-semibold text-text-muted tracking-wider">
                Fast & Reliable Logistics
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-semibold text-text-secondary">
            <Link href="/" className="hover:text-brand-primary transition-colors">
              Home
            </Link>
            <Link href="/services" className="hover:text-brand-primary transition-colors">
              Services
            </Link>
            <Link href="/track" className="hover:text-brand-primary transition-colors">
              Track Shipment
            </Link>
            <Link href="/book" className="hover:text-brand-primary transition-colors">
              Book Parcel
            </Link>
            <Link href="/calculator" className="hover:text-brand-primary transition-colors">
              Rate Calculator
            </Link>
            <Link href="/contact" className="hover:text-brand-primary transition-colors">
              Contact
            </Link>
          </nav>

          {/* Action CTAs + Mobile Drawer Toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/track" className="hidden sm:inline-flex">
              <Button variant="outline" size="sm" className="font-semibold text-xs sm:text-sm">
                Track
              </Button>
            </Link>
            <Link href="/book" className="hidden xs:inline-flex">
              <Button variant="accent" size="sm" className="font-semibold text-xs sm:text-sm shadow-sm">
                Book Parcel
              </Button>
            </Link>
            <Link href="/login" className="hidden md:inline-flex">
              <Button variant="primary" size="sm" className="font-semibold text-xs sm:text-sm shadow-sm">
                Sign In
              </Button>
            </Link>

            {/* Slide-out Mobile Navigation Drawer */}
            <MobileNav
              phones={[phone1, phone2]}
              email={profile.support_email}
              address={`${profile.address}, ${profile.city}, ${profile.state} ${profile.pincode}`}
            />
          </div>
        </div>

        {/* Mobile Horizontal Navigation Bar (Visible on mobile & tablet) */}
        <div className="lg:hidden bg-surface-subtle border-t border-border-default px-4 py-2.5 overflow-x-auto scrollbar-none flex items-center gap-2 text-xs font-semibold whitespace-nowrap">
          <Link
            href="/"
            className="px-3 py-1.5 rounded-lg bg-surface-base border border-border-default text-text-primary hover:border-brand-primary"
          >
            Home
          </Link>
          <Link
            href="/track"
            className="px-3 py-1.5 rounded-lg bg-surface-base border border-border-default text-text-primary hover:border-brand-primary"
          >
            Track Shipment
          </Link>
          <Link
            href="/book"
            className="px-3 py-1.5 rounded-lg bg-brand-primary text-white shadow-xs"
          >
            Book Parcel
          </Link>
          <Link
            href="/calculator"
            className="px-3 py-1.5 rounded-lg bg-surface-base border border-border-default text-text-primary hover:border-brand-primary"
          >
            Rate Calculator
          </Link>
          <Link
            href="/services"
            className="px-3 py-1.5 rounded-lg bg-surface-base border border-border-default text-text-primary hover:border-brand-primary"
          >
            Services
          </Link>
          <Link
            href="/contact"
            className="px-3 py-1.5 rounded-lg bg-surface-base border border-border-default text-text-primary hover:border-brand-primary"
          >
            Contact
          </Link>
        </div>
      </header>

      {/* 3. Main Page Content */}
      <main className="flex-1 pb-20 lg:pb-0">{children}</main>

      {/* 4. Unified Footer */}
      <footer className="bg-slate-900 text-slate-300 pt-16 pb-10 border-t border-slate-800">
        <div className="max-w-container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Column 1: Company Profile */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 font-bold text-xl text-white">
              <div className="w-8 h-8 rounded-lg bg-brand-primary flex items-center justify-center text-white">
                <Truck className="w-4 h-4" />
              </div>
              <span>
                SS Courier <span className="text-brand-accent">service</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              Your trusted multi-carrier logistics and express cargo delivery partner. Door-to-door domestic parcel pickup, real-time GPS tracking, and verified Cash on Delivery (COD) services across India.
            </p>
            <div className="pt-1 flex items-center gap-2 text-xs text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Multi-Carrier Live Dispatch Network</span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/book" className="hover:text-white transition-colors">
                  Book a Parcel
                </Link>
              </li>
              <li>
                <Link href="/track" className="hover:text-white transition-colors">
                  Track Shipment
                </Link>
              </li>
              <li>
                <Link href="/calculator" className="hover:text-white transition-colors">
                  Shipping Rate Calculator
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-white transition-colors">
                  Logistics Services
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Portals & Policies */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider">Portals & Policies</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <Link href="/login" className="hover:text-white transition-colors">
                  Customer Self-Service
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-white transition-colors">
                  Create Business Account
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Customer Support
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/shipping-policy" className="hover:text-white transition-colors">
                  Shipping & Return Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Head Office & Direct Contact */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider">Head Office Contact</h4>
            <div className="space-y-3 text-sm text-slate-400">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-brand-accent shrink-0 mt-1" />
                <span className="leading-snug">
                  {profile.address}, {profile.city}, {profile.state} {profile.pincode}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-brand-accent shrink-0" />
                <div className="space-x-1">
                  <a href={`tel:${phone1}`} className="hover:text-white font-medium">
                    +91 {phone1}
                  </a>
                  <span>/</span>
                  <a href={`tel:${phone2}`} className="hover:text-white font-medium">
                    {phone2}
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-brand-accent shrink-0" />
                <a href={`mailto:${profile.support_email}`} className="hover:text-white">
                  {profile.support_email}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Legal Bar */}
        <div className="max-w-container mx-auto px-4 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} SS Courier service Pvt. Ltd. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <Link href="/privacy-policy" className="hover:text-slate-400 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-slate-400 transition-colors">
              Terms
            </Link>
            <Link href="/admin/login" className="hover:text-slate-400 transition-colors font-medium">
              Admin Staff Portal
            </Link>
          </div>
        </div>
      </footer>

      {/* 5. Mobile Fixed Bottom Navigation */}
      <BottomNav
        phones={[phone1, phone2]}
        email={profile.support_email}
        address={`${profile.address}, ${profile.city}, ${profile.state} ${profile.pincode}`}
      />
    </div>
  );
}
