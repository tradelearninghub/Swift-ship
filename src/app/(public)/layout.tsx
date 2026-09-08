import React from "react";
import Link from "next/link";
import { Truck, Phone, Mail, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/Button";
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
    <div className="flex flex-col min-h-screen font-sans bg-white text-slate-900">
      {/* 1. Top Bar */}
      <div className="bg-[#002B49] text-white text-xs py-2 px-4 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-3">
          <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
            <span className="flex items-center gap-1.5 text-slate-200">
              <Phone className="w-3.5 h-3.5 text-[#FF6B00]" />
              <a href={`tel:${phone1}`} className="hover:text-white transition-colors">
                +91 {phone1}
              </a>
              <span className="text-slate-500">/</span>
              <a href={`tel:${phone2}`} className="hover:text-white transition-colors">
                {phone2}
              </a>
            </span>
            <span className="hidden sm:flex items-center gap-1.5 text-slate-200">
              <Mail className="w-3.5 h-3.5 text-[#FF6B00]" /> {profile.support_email}
            </span>
            <span className="hidden md:flex items-center gap-1.5 text-slate-300">
              <Clock className="w-3.5 h-3.5 text-[#FF6B00]" /> 24/7 Logistics Desk
            </span>
          </div>
          <div className="flex items-center gap-3 text-slate-300 text-xs">
            <Link href="/track" className="hover:text-white transition-colors">
              Quick Track
            </Link>
            <span className="text-slate-500">•</span>
            <Link href="/login" className="hover:text-white transition-colors">
              Customer Login
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Main Navbar */}
      <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur shadow-sm border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 font-bold text-2xl text-[#002B49]">
            <div className="w-10 h-10 rounded-xl bg-[#002B49] flex items-center justify-center text-white shadow-md">
              <Truck className="w-5 h-5 text-[#FF6B00]" />
            </div>
            <span>
              SS<span className="text-[#FF6B00]"> Courier service</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-8 text-sm font-semibold text-[#002B49]">
            <Link href="/" className="hover:text-[#FF6B00] transition-colors">
              Home
            </Link>
            <Link href="/services" className="hover:text-[#FF6B00] transition-colors">
              Services
            </Link>
            <Link href="/track" className="hover:text-[#FF6B00] transition-colors">
              Tracking
            </Link>
            <Link href="/about" className="hover:text-[#FF6B00] transition-colors">
              About
            </Link>
            <Link href="/contact" className="hover:text-[#FF6B00] transition-colors">
              Contact
            </Link>
          </div>

          {/* Desktop Action Buttons & Mobile Hamburger */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/track" className="hidden sm:block">
              <Button
                variant="outline"
                size="sm"
                className="border-slate-300 text-[#002B49] hover:bg-slate-50"
              >
                Track
              </Button>
            </Link>
            <Link href="/book" className="hidden xs:block">
              <Button
                variant="accent"
                size="sm"
                className="bg-[#FF6B00] hover:bg-[#e05e00] text-white shadow-sm"
              >
                Book Pickup
              </Button>
            </Link>
            <Link href="/login" className="hidden sm:block">
              <Button
                variant="primary"
                size="sm"
                className="bg-[#002B49] hover:bg-[#001b2e] text-white shadow-sm"
              >
                Sign In
              </Button>
            </Link>

            {/* Slide-out Mobile Nav Drawer */}
            <MobileNav
              phones={[phone1, phone2]}
              email={profile.support_email}
              address={`${profile.address}, ${profile.city}, ${profile.state} ${profile.pincode}`}
            />
          </div>
        </div>
      </nav>

      {/* Main Page Content */}
      <main className="flex-1">{children}</main>

      {/* 3. Footer */}
      <footer id="contact" className="bg-[#001b2e] text-slate-300 pt-16 pb-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Col 1 */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 font-bold text-xl text-white">
              <div className="w-8 h-8 rounded-lg bg-[#FF6B00] flex items-center justify-center text-white">
                <Truck className="w-4 h-4" />
              </div>
              <span>
                SS<span className="text-[#FF6B00]"> Courier service</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Your reliable logistics and multi-carrier cargo delivery partner across Jaipur, Rajasthan, India and worldwide.
            </p>
          </div>

          {/* Col 2 */}
          <div>
            <h4 className="text-white font-semibold text-base mb-4">Quick Links</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li><Link href="/" className="hover:text-[#FF6B00] transition-colors">Home</Link></li>
              <li><Link href="/book" className="hover:text-[#FF6B00] transition-colors">Book a Parcel</Link></li>
              <li><Link href="/track" className="hover:text-[#FF6B00] transition-colors">Tracking Portal</Link></li>
              <li><Link href="/services" className="hover:text-[#FF6B00] transition-colors">Shipping Services</Link></li>
              <li><Link href="/about" className="hover:text-[#FF6B00] transition-colors">About SS Courier</Link></li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h4 className="text-white font-semibold text-base mb-4">Support & Policies</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li><Link href="/contact" className="hover:text-[#FF6B00] transition-colors">Contact Us</Link></li>
              <li><Link href="/privacy-policy" className="hover:text-[#FF6B00] transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-[#FF6B00] transition-colors">Terms of Service</Link></li>
              <li><Link href="/shipping-policy" className="hover:text-[#FF6B00] transition-colors">Shipping Policy</Link></li>
              <li><Link href="/login" className="hover:text-[#FF6B00] transition-colors">Customer Portal</Link></li>
            </ul>
          </div>

          {/* Col 4 */}
          <div>
            <h4 className="text-white font-semibold text-base mb-4">Contact & Head Office</h4>
            <div className="space-y-3.5 text-sm text-slate-400">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#FF6B00] shrink-0 mt-1" />
                <span className="leading-snug">
                  {profile.address}, {profile.city}, {profile.state} {profile.pincode}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#FF6B00] shrink-0" />
                <span>
                  <a href={`tel:${phone1}`} className="hover:text-white">
                    +91 {phone1}
                  </a>
                  {" / "}
                  <a href={`tel:${phone2}`} className="hover:text-white">
                    {phone2}
                  </a>
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#FF6B00] shrink-0" />
                <span>
                  <a href={`mailto:${profile.support_email}`} className="hover:text-white">
                    {profile.support_email}
                  </a>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} SS Courier service Pvt Ltd. All Rights Reserved.</p>
          <div className="flex gap-4">
            <Link href="/privacy-policy" className="hover:text-slate-400">Privacy</Link>
            <Link href="/terms" className="hover:text-slate-400">Terms</Link>
            <Link href="/admin/login" className="hover:text-slate-400">Admin Staff Portal</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
