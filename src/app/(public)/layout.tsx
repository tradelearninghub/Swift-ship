import React from "react";
import Link from "next/link";
import { Phone, Mail, Clock, MapPin, Truck } from "lucide-react";
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
    <div className="flex flex-col min-h-screen bg-white text-[#222] font-sans antialiased">
      {/* 1. TOP BAR (Matches ai_studio_code (14).html) */}
      <div className="bg-[#002B49] text-white text-[13px] py-2 px-4 border-b border-white/10">
        <div className="w-[90%] max-w-[1200px] mx-auto flex flex-wrap justify-between items-center gap-3">
          <div className="flex items-center gap-5 flex-wrap">
            <span className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[#FF6B00]" />
              <a href={`tel:${phone1}`} className="hover:text-[#FF6B00] transition-colors">
                +91 {phone1}
              </a>
              <span className="text-white/40">/</span>
              <a href={`tel:${phone2}`} className="hover:text-[#FF6B00] transition-colors">
                {phone2}
              </a>
            </span>
            <span className="hidden sm:flex items-center gap-1.5 text-slate-300">
              <Mail className="w-3.5 h-3.5 text-[#FF6B00]" />
              <a href={`mailto:${profile.support_email}`} className="hover:text-[#FF6B00] transition-colors">
                {profile.support_email}
              </a>
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium">
            <span className="hidden md:flex items-center gap-1.5 text-slate-300">
              <Clock className="w-3.5 h-3.5 text-[#FF6B00]" /> 24/7 Support
            </span>
            <Link href="/track" className="hover:text-[#FF6B00] transition-colors">
              Quick Track
            </Link>
            <span className="text-white/30">•</span>
            <Link href="/login" className="hover:text-[#FF6B00] transition-colors">
              Customer Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* 2. NAVBAR (Sticky with shadow, matches ai_studio_code (14).html) */}
      <nav className="bg-white sticky top-0 z-50 shadow-[0_4px_15px_rgba(0,0,0,0.05)]">
        <div className="w-[90%] max-w-[1200px] mx-auto py-3.5 sm:py-4 flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="text-2xl sm:text-[26px] font-bold text-[#002B49] tracking-tight">
            SS Courier<span className="text-[#FF6B00]"> service</span>
          </Link>

          {/* Desktop Nav Links */}
          <ul className="hidden lg:flex items-center gap-7 text-[15px] font-medium text-[#002B49]">
            <li>
              <Link href="/" className="hover:text-[#FF6B00] transition-colors">
                Home
              </Link>
            </li>
            <li>
              <Link href="/services" className="hover:text-[#FF6B00] transition-colors">
                Services
              </Link>
            </li>
            <li>
              <Link href="/track" className="hover:text-[#FF6B00] transition-colors">
                Tracking
              </Link>
            </li>
            <li>
              <Link href="/calculator" className="hover:text-[#FF6B00] transition-colors">
                Rate Calculator
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-[#FF6B00] transition-colors">
                About
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-[#FF6B00] transition-colors">
                Contact
              </Link>
            </li>
            <li>
              <Link
                href="/book"
                className="inline-block bg-[#FF6B00] hover:bg-[#e05e00] text-white px-6 py-2.5 rounded-md font-semibold text-sm shadow-sm transition-all duration-200"
              >
                Book Pickup
              </Link>
            </li>
          </ul>

          {/* Mobile Actions + Drawer Toggle */}
          <div className="flex items-center gap-2 lg:hidden">
            <Link
              href="/book"
              className="inline-block bg-[#FF6B00] hover:bg-[#e05e00] text-white px-3.5 py-2 rounded-md font-semibold text-xs shadow-xs"
            >
              Book Pickup
            </Link>

            <MobileNav
              phones={[phone1, phone2]}
              email={profile.support_email}
              address={`${profile.address}, ${profile.city}, ${profile.state} ${profile.pincode}`}
            />
          </div>
        </div>

        {/* Mobile Horizontal Quick Navigation Strip */}
        <div className="lg:hidden bg-slate-50 border-t border-slate-200 px-3 py-2 overflow-x-auto scrollbar-none flex items-center gap-2 text-xs font-semibold whitespace-nowrap">
          <Link
            href="/"
            className="px-3 py-1.5 rounded-md bg-white border border-slate-200 text-[#002B49] hover:border-[#FF6B00]"
          >
            Home
          </Link>
          <Link
            href="/track"
            className="px-3 py-1.5 rounded-md bg-white border border-slate-200 text-[#002B49] hover:border-[#FF6B00]"
          >
            Track Shipment
          </Link>
          <Link
            href="/calculator"
            className="px-3 py-1.5 rounded-md bg-white border border-slate-200 text-[#002B49] hover:border-[#FF6B00]"
          >
            Rate Calculator
          </Link>
          <Link
            href="/services"
            className="px-3 py-1.5 rounded-md bg-white border border-slate-200 text-[#002B49] hover:border-[#FF6B00]"
          >
            Services
          </Link>
          <Link
            href="/about"
            className="px-3 py-1.5 rounded-md bg-white border border-slate-200 text-[#002B49] hover:border-[#FF6B00]"
          >
            About Us
          </Link>
          <Link
            href="/contact"
            className="px-3 py-1.5 rounded-md bg-white border border-slate-200 text-[#002B49] hover:border-[#FF6B00]"
          >
            Contact
          </Link>
        </div>
      </nav>

      {/* 3. MAIN PAGE CONTENT */}
      <main className="flex-1 pb-16 lg:pb-0">{children}</main>

      {/* 4. FOOTER (Matches ai_studio_code (14).html) */}
      <footer id="contact" className="bg-[#001b2e] text-[#ccc] pt-14 pb-6 text-sm">
        <div className="w-[90%] max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
            {/* Col 1: Brand & Tagline */}
            <div>
              <h3 className="text-white text-xl font-bold mb-3.5">
                SS Courier<span className="text-[#FF6B00]"> service</span>
              </h3>
              <p className="text-slate-300 leading-relaxed text-sm max-w-sm mb-4">
                Your reliable logistics and multi-carrier cargo delivery partner across Jaipur, Rajasthan, and nationwide across India.
              </p>
              <div className="text-xs text-slate-400">
                Hub: {profile.address}, {profile.city}, {profile.state} {profile.pincode}
              </div>
            </div>

            {/* Col 2: Quick Links */}
            <div>
              <h4 className="text-white text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link href="/" className="hover:text-[#FF6B00] transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="hover:text-[#FF6B00] transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/track" className="hover:text-[#FF6B00] transition-colors">
                    Tracking Portal
                  </Link>
                </li>
                <li>
                  <Link href="/calculator" className="hover:text-[#FF6B00] transition-colors">
                    Shipping Calculator
                  </Link>
                </li>
                <li>
                  <Link href="/services" className="hover:text-[#FF6B00] transition-colors">
                    Services
                  </Link>
                </li>
                <li>
                  <Link href="/book" className="hover:text-[#FF6B00] transition-colors">
                    Book a Parcel
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 3: Contact Info */}
            <div>
              <h4 className="text-white text-lg font-semibold mb-4">Contact Us</h4>
              <div className="space-y-3 text-sm">
                <p className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#FF6B00] shrink-0" />
                  <a href={`tel:${phone1}`} className="hover:text-white">
                    +91 {phone1}
                  </a>
                  <span>/</span>
                  <a href={`tel:${phone2}`} className="hover:text-white">
                    {phone2}
                  </a>
                </p>
                <p className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#FF6B00] shrink-0" />
                  <a href={`mailto:${profile.support_email}`} className="hover:text-white">
                    {profile.support_email}
                  </a>
                </p>
                <p className="flex items-start gap-2 text-xs text-slate-400 pt-1">
                  <MapPin className="w-4 h-4 text-[#FF6B00] shrink-0 mt-0.5" />
                  <span>Johri Bazar, Jaipur, Rajasthan 302003</span>
                </p>
              </div>
            </div>
          </div>

          {/* Copyright & Legal Bar */}
          <div className="border-t border-white/10 pt-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 text-center sm:text-left">
            <p>&copy; {new Date().getFullYear()} SS Courier service Pvt Ltd. All Rights Reserved.</p>
            <div className="flex items-center gap-4">
              <Link href="/privacy-policy" className="hover:text-slate-200 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-slate-200 transition-colors">
                Terms
              </Link>
              <Link href="/admin/login" className="hover:text-[#FF6B00] transition-colors font-medium">
                Admin Operations
              </Link>
            </div>
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
