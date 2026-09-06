"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  Truck,
  Phone,
  Mail,
  MapPin,
  Home,
  Layers,
  Search,
  PlusCircle,
  Info,
  MessageSquare,
  LogIn,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

interface MobileNavProps {
  phones?: string[];
  email?: string;
  address?: string;
}

export function MobileNav({
  phones = ["8000151117", "7689987368"],
  email = "support@sscourierservice.in",
  address = "Shop No 4, 5th Crossing, Padmavati School, Ghee Walo Ka Rasta, Johri Bazar, Jaipur 302003",
}: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Close drawer on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Prevent background scrolling when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const navLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/services", label: "Services", icon: Layers },
    { href: "/track", label: "Track Shipment", icon: Search },
    { href: "/book", label: "Book a Parcel", icon: PlusCircle, badge: "Quick" },
    { href: "/about", label: "About Us", icon: Info },
    { href: "/contact", label: "Contact Us", icon: MessageSquare },
  ];

  return (
    <>
      {/* Hamburger toggle button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="lg:hidden p-2 rounded-lg text-[#002B49] hover:bg-slate-100 transition-colors focus:outline-none"
        aria-label="Open navigation menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Drawer backdrop & slide-out container */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          {/* Drawer panel */}
          <div className="relative ml-auto w-full max-w-xs sm:max-w-sm bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-250">
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-[#002B49] text-white">
              <div className="flex items-center gap-2 font-bold text-lg">
                <div className="w-8 h-8 rounded-lg bg-[#FF6B00] flex items-center justify-center text-white">
                  <Truck className="w-4 h-4" />
                </div>
                <span>
                  SS<span className="text-[#FF6B00]"> Courier service</span>
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close navigation menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Nav Links */}
            <div className="flex-1 overflow-y-auto p-4 space-y-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1">
                Navigation
              </div>
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      isActive
                        ? "bg-blue-50 text-[#1D4ED8] font-bold"
                        : "text-slate-700 hover:bg-slate-50 hover:text-[#002B49]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? "text-[#1D4ED8]" : "text-slate-400"}`} />
                      <span>{link.label}</span>
                    </div>
                    {link.badge && (
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-[#FF6B00]/10 text-[#FF6B00]">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}

              <div className="pt-4 mt-2 border-t border-slate-100 space-y-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1">
                  Account & Access
                </div>
                <Link
                  href="/login"
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <LogIn className="w-4 h-4 text-slate-400" />
                  <span>Customer / Staff Sign In</span>
                </Link>
                <Link
                  href="/register"
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <UserPlus className="w-4 h-4 text-slate-400" />
                  <span>Register Free Account</span>
                </Link>
              </div>

              {/* Contact Information in Drawer */}
              <div className="pt-4 mt-2 border-t border-slate-100 space-y-3 px-3">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Direct Helplines
                </div>
                {phones.map((phone, idx) => (
                  <a
                    key={idx}
                    href={`tel:${phone}`}
                    className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 hover:text-[#1D4ED8]"
                  >
                    <Phone className="w-3.5 h-3.5 text-[#FF6B00]" />
                    <span>+91 {phone}</span>
                  </a>
                ))}
                <a
                  href={`mailto:${email}`}
                  className="flex items-center gap-2.5 text-xs text-slate-600 hover:text-[#1D4ED8]"
                >
                  <Mail className="w-3.5 h-3.5 text-[#FF6B00]" />
                  <span>{email}</span>
                </a>
              </div>
            </div>

            {/* Action Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 space-y-2">
              <Link href="/book" className="block">
                <Button variant="accent" className="w-full bg-[#FF6B00] hover:bg-[#e05e00] text-white">
                  <PlusCircle className="w-4 h-4 mr-1.5" /> Book Parcel
                </Button>
              </Link>
              <Link href="/track" className="block">
                <Button variant="outline" className="w-full border-slate-300 text-slate-700">
                  <Search className="w-4 h-4 mr-1.5" /> Track Consignment
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
