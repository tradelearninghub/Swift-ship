import React from "react";
import Link from "next/link";
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

          {/* Mobile Quick Action & Drawer Trigger */}
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

        {/* Mobile Horizontal Quick Navigation Strip */}
        <div className="lg:hidden bg-slate-50 border-t border-slate-200 px-3 py-2 overflow-x-auto scrollbar-none flex items-center gap-2 text-xs font-semibold whitespace-nowrap mt-2">
          <Link
            href="/"
            className="px-3 py-1.5 rounded-md bg-white border border-slate-200 text-[#002B49] hover:border-[#FF6B00]"
          >
            Home
          </Link>
          <Link
            href="/services"
            className="px-3 py-1.5 rounded-md bg-white border border-slate-200 text-[#002B49] hover:border-[#FF6B00]"
          >
            Services
          </Link>
          <Link
            href="/track"
            className="px-3 py-1.5 rounded-md bg-white border border-slate-200 text-[#002B49] hover:border-[#FF6B00]"
          >
            Tracking
          </Link>
          <Link
            href="/calculator"
            className="px-3 py-1.5 rounded-md bg-white border border-slate-200 text-[#002B49] hover:border-[#FF6B00]"
          >
            Rate Calculator
          </Link>
          <Link
            href="/how-it-works"
            className="px-3 py-1.5 rounded-md bg-white border border-slate-200 text-[#002B49] hover:border-[#FF6B00]"
          >
            How It Works
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

      {/* MAIN CONTENT */}
      <main className="flex-1 pb-16 lg:pb-0">{children}</main>

      {/* FOOTER */}
      <footer id="contact" className="site-footer">
        <div className="main-container">
          <div className="footer-grid">
            <div className="footer-col">
              <h3 style={{ color: "#fff", marginBottom: "15px" }}>
                SS Courier<span style={{ color: "var(--secondary)" }}> services</span>
              </h3>
              <p>Your reliable logistics and cargo delivery partner.</p>
              <p style={{ marginTop: "12px", fontSize: "12px", color: "#888" }}>
                Hub: {profile.address}, {profile.city}, {profile.state} {profile.pincode}
              </p>
            </div>
            <div className="footer-col">
              <h4>Quick Links</h4>
              <ul>
                <li>
                  <Link href="/">Home</Link>
                </li>
                <li>
                  <Link href="/services">Services</Link>
                </li>
                <li>
                  <Link href="/track">Tracking Portal</Link>
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
                  <Link href="/contact">Contact Us</Link>
                </li>
                <li>
                  <Link href="/book">Book a Parcel</Link>
                </li>
                <li>
                  <Link href="/shipping-policy">Shipping Policy</Link>
                </li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Contact Us</h4>
              <p>
                <i className="fas fa-phone"></i> +91 {phone1} / {phone2}
              </p>
              <p style={{ marginTop: "8px" }}>
                <i className="fas fa-envelope"></i> {profile.support_email}
              </p>
              <p style={{ marginTop: "8px", fontSize: "12px", color: "#aaa" }}>
                <i className="fas fa-map-marker-alt"></i> Johri Bazar, Jaipur, Rajasthan 302003
              </p>
            </div>
          </div>
          <div className="copyright">
            <p>
              &copy; {new Date().getFullYear()} SS Courier service Pvt Ltd. All Rights Reserved. &nbsp;|&nbsp;{" "}
              <Link href="/privacy-policy" style={{ color: "#aaa" }}>
                Privacy Policy
              </Link>{" "}
              &nbsp;|&nbsp;{" "}
              <Link href="/terms" style={{ color: "#aaa" }}>
                Terms of Service
              </Link>{" "}
              &nbsp;|&nbsp;{" "}
              <Link href="/shipping-policy" style={{ color: "#aaa" }}>
                Shipping Policy
              </Link>{" "}
              &nbsp;|&nbsp;{" "}
              <Link href="/admin/login" style={{ color: "var(--secondary)" }}>
                Admin Operations
              </Link>
            </p>
          </div>
        </div>
      </footer>

      {/* Mobile Fixed Bottom Navigation */}
      <BottomNav
        phones={[phone1, phone2]}
        email={profile.support_email}
        address={`${profile.address}, ${profile.city}, ${profile.state} ${profile.pincode}`}
      />
    </div>
  );
}
