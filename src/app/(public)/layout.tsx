import React from "react";
import Link from "next/link";
import { MobileNav } from "@/components/MobileNav";
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
    <div className="flex flex-col min-h-screen bg-white text-[#222]">
      {/* 1. TOP BAR */}
      <div className="top-bar">
        <div className="main-container">
          <div className="flex items-center gap-4 flex-wrap">
            <span>
              <i className="fas fa-phone-alt"></i>{" "}
              <a href={`tel:${phone1}`}>+91 {phone1}</a> /{" "}
              <a href={`tel:${phone2}`}>{phone2}</a>
            </span>
            <span className="hidden sm:inline">
              <i className="fas fa-envelope"></i>{" "}
              <a href={`mailto:${profile.support_email}`}>
                {profile.support_email}
              </a>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden md:inline">
              <i className="fas fa-clock"></i> 24/7 Support
            </span>
            <Link href="/track" className="hover:text-[#FF6B00] transition-colors">
              Tracking
            </Link>
            <span className="opacity-40">•</span>
            <Link href="/login" className="hover:text-[#FF6B00] transition-colors">
              Customer Login
            </Link>
          </div>
        </div>
      </div>

      {/* NAVBAR */}
      <nav className="navbar">
        <div className="main-container">
          <Link href="/" className="logo">
            SS Courier<span> services</span>
          </Link>

          {/* Desktop Unified Nav Links */}
          <ul className="nav-links">
            <li>
              <Link href="/">Home</Link>
            </li>
            <li>
              <Link href="/services">Services</Link>
            </li>
            <li>
              <Link href="/track">Tracking</Link>
            </li>
            <li>
              <Link href="/calculator">Rate Calculator</Link>
            </li>
            <li>
              <Link href="/how-it-works">How It Works</Link>
            </li>
            <li>
              <Link href="/about">About Us</Link>
            </li>
            <li>
              <Link href="/contact">Contact</Link>
            </li>
            <li>
              <Link href="/book" className="btn btn-primary">
                Book a Parcel
              </Link>
            </li>
          </ul>

          {/* Mobile Quick Action & Side Drawer Trigger */}
          <div className="lg:hidden flex items-center gap-2">
            <Link href="/book" className="btn btn-primary text-xs py-2 px-3">
              Book a Parcel
            </Link>
            <MobileNav
              phones={[phone1, phone2]}
              email={profile.support_email}
              address={`${profile.address}, ${profile.city}, ${profile.state} ${profile.pincode}`}
            />
          </div>
        </div>
      </nav>

      {/* MAIN CONTENT (Zero bottom bar margin needed) */}
      <main className="flex-1">{children}</main>

      {/* FOOTER: Four-Column Layout per §7, §52, and Design System */}
      <footer id="contact" className="site-footer bg-[#001b2e] text-[#ccc] pt-14 pb-6 text-sm border-t border-white/10">
        <div className="main-container">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* Section 1 — Company */}
            <div className="footer-col space-y-3">
              <h3 className="text-white text-xl font-bold tracking-tight">
                {profile.company_name}
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                {profile.tagline || "Your reliable logistics and cargo delivery partner."}
              </p>
              <div className="pt-2 text-xs text-slate-400">
                <span className="font-semibold text-slate-300">Central Hub: </span>
                {profile.address}, {profile.city}, {profile.state} {profile.pincode}
              </div>
            </div>

            {/* Section 2 — Quick Links (6 canonical links matching header nav) */}
            <div className="footer-col">
              <h4 className="text-white text-base font-semibold mb-4 border-b border-white/10 pb-2 inline-block">
                Quick Links
              </h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/" className="text-slate-300 hover:text-[#FF6B00] transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-slate-300 hover:text-[#FF6B00] transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/services" className="text-slate-300 hover:text-[#FF6B00] transition-colors">
                    Services
                  </Link>
                </li>
                <li>
                  <Link href="/how-it-works" className="text-slate-300 hover:text-[#FF6B00] transition-colors">
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link href="/track" className="text-slate-300 hover:text-[#FF6B00] transition-colors">
                    Track Shipment
                  </Link>
                </li>
                <li>
                  <Link href="/book" className="text-slate-300 hover:text-[#FF6B00] transition-colors">
                    Book a Parcel
                  </Link>
                </li>
              </ul>
            </div>

            {/* Section 3 — Support & Policies */}
            <div className="footer-col">
              <h4 className="text-white text-base font-semibold mb-4 border-b border-white/10 pb-2 inline-block">
                Support & Policies
              </h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/contact" className="text-slate-300 hover:text-[#FF6B00] transition-colors">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="/shipping-policy" className="text-slate-300 hover:text-[#FF6B00] transition-colors">
                    Shipping Policy
                  </Link>
                </li>
                <li>
                  <Link href="/privacy-policy" className="text-slate-300 hover:text-[#FF6B00] transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-slate-300 hover:text-[#FF6B00] transition-colors">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>

            {/* Section 4 — Contact Info (from settings) */}
            <div className="footer-col">
              <h4 className="text-white text-base font-semibold mb-4 border-b border-white/10 pb-2 inline-block">
                Contact Info
              </h4>
              <div className="space-y-3 text-sm text-slate-300">
                <div>
                  <p className="font-semibold text-slate-200 text-xs uppercase tracking-wider mb-1">
                    Direct Helpline
                  </p>
                  <div className="flex flex-col gap-1">
                    {profile.support_phones.map((phone, idx) => (
                      <a
                        key={idx}
                        href={`tel:${phone}`}
                        className="hover:text-[#FF6B00] transition-colors flex items-center gap-2"
                      >
                        <i className="fas fa-phone text-[#FF6B00] text-xs"></i>
                        <span>+91 {phone}</span>
                      </a>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="font-semibold text-slate-200 text-xs uppercase tracking-wider mb-1">
                    Email Support
                  </p>
                  <a
                    href={`mailto:${profile.support_email}`}
                    className="hover:text-[#FF6B00] transition-colors flex items-center gap-2"
                  >
                    <i className="fas fa-envelope text-[#FF6B00] text-xs"></i>
                    <span className="break-all">{profile.support_email}</span>
                  </a>
                </div>

                <div>
                  <p className="font-semibold text-slate-200 text-xs uppercase tracking-wider mb-1">
                    Hub Address
                  </p>
                  <p className="text-xs text-slate-400 leading-relaxed flex items-start gap-2">
                    <i className="fas fa-map-marker-alt text-[#FF6B00] text-xs mt-1 shrink-0"></i>
                    <span>
                      {profile.address}, {profile.city}, {profile.state} {profile.pincode}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Thin bottom bar: Copyright + Links */}
          <div className="copyright pt-6 border-t border-white/10 text-center text-xs text-slate-400">
            <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
              <span>
                &copy; {new Date().getFullYear()} {profile.company_name}. All Rights Reserved.
              </span>
              <span className="hidden sm:inline opacity-40">•</span>
              <Link href="/privacy-policy" className="hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <span className="opacity-40">•</span>
              <Link href="/terms" className="hover:text-white transition-colors">
                Terms of Service
              </Link>
              <span className="opacity-40">•</span>
              <Link href="/shipping-policy" className="hover:text-white transition-colors">
                Shipping Policy
              </Link>
              <span className="opacity-40">•</span>
              <Link href="/admin/login" className="text-[#FF6B00] hover:underline font-semibold">
                Admin Operations
              </Link>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
