import React from "react";
import Link from "next/link";
import { Package, Truck, Phone, Mail, MapPin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Notification Bar */}
      <div className="bg-slate-900 text-slate-300 text-xs py-2 px-4 border-b border-slate-800">
        <div className="max-w-container mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-brand-accent" /> +91 98765 43210
            </span>
            <span className="hidden sm:flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-brand-accent" /> support@swiftship.com
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/track" className="hover:text-white transition-colors">
              Quick Track
            </Link>
            <span>•</span>
            <Link href="/login" className="hover:text-white transition-colors">
              Customer Login
            </Link>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-40 bg-surface-base/95 backdrop-blur border-b border-border-default">
        <div className="max-w-container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-text-primary">
            <div className="w-9 h-9 rounded-lg bg-brand-primary flex items-center justify-center text-white">
              <Truck className="w-5 h-5" />
            </div>
            <span>Swift Ship<span className="text-brand-primary">.</span></span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-text-secondary">
            <Link href="/" className="hover:text-brand-primary transition-colors">
              Home
            </Link>
            <Link href="/about" className="hover:text-brand-primary transition-colors">
              About
            </Link>
            <Link href="/services" className="hover:text-brand-primary transition-colors">
              Services
            </Link>
            <Link href="/how-it-works" className="hover:text-brand-primary transition-colors">
              How It Works
            </Link>
            <Link href="/track" className="hover:text-brand-primary transition-colors">
              Track Shipment
            </Link>
            <Link href="/contact" className="hover:text-brand-primary transition-colors">
              Contact
            </Link>
          </nav>

          {/* CTA Action Buttons */}
          <div className="flex items-center gap-3">
            <Link href="/track">
              <Button variant="outline" size="sm" className="hidden sm:inline-flex">
                Track
              </Button>
            </Link>
            <Link href="/book">
              <Button variant="accent" size="sm">
                Book Parcel
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="primary" size="sm">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 border-t border-slate-800">
        <div className="max-w-container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div>
            <div className="flex items-center gap-2 font-bold text-xl text-white mb-4">
              <div className="w-8 h-8 rounded-lg bg-brand-primary flex items-center justify-center text-white">
                <Truck className="w-4 h-4" />
              </div>
              <span>Swift Ship</span>
            </div>
            <p className="text-sm text-slate-400 mb-4 leading-relaxed">
              Modern multi-courier booking and real-time shipment management platform for domestic and business parcels.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link href="/book" className="hover:text-white transition-colors">Book a Parcel</Link></li>
              <li><Link href="/track" className="hover:text-white transition-colors">Track Shipment</Link></li>
              <li><Link href="/services" className="hover:text-white transition-colors">Shipping Services</Link></li>
              <li><Link href="/how-it-works" className="hover:text-white transition-colors">How It Works</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Support & Policies</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/shipping-policy" className="hover:text-white transition-colors">Shipping Policy</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Contact Info</h4>
            <div className="space-y-3 text-sm text-slate-400">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-brand-accent shrink-0 mt-0.5" />
                <span>Plot 42, Logistics Hub, Sitapura Industrial Area, Jaipur, Rajasthan 302022</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-brand-accent shrink-0" />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-brand-accent shrink-0" />
                <span>support@swiftship.com</span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-container mx-auto px-4 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Swift Ship Courier. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/privacy-policy" className="hover:text-slate-400">Privacy</Link>
            <Link href="/terms" className="hover:text-slate-400">Terms</Link>
            <Link href="/admin" className="hover:text-slate-400">Admin Staff Portal</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
