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
  Home,
  Layers,
  Search,
  PlusCircle,
  Calculator,
  MessageSquare,
  LogIn,
  UserPlus,
  Info,
  ShieldCheck,
} from "lucide-react";

interface MobileNavProps {
  phones?: string[];
  email?: string;
  address?: string;
  customTrigger?: React.ReactNode;
}

export function MobileNav({
  phones = ["8000151117", "7689987368"],
  email = "support@sscourierservice.in",
  address = "Shop No 4, 5th Crossing, Padmavati School, Ghee Walo Ka Rasta, Johri Bazar, Jaipur 302003",
  customTrigger,
}: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Close drawer on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Prevent background scrolling when drawer is open
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
    { href: "/track", label: "Tracking Portal", icon: Search },
    { href: "/calculator", label: "Rate Calculator", icon: Calculator },
    { href: "/book", label: "Book Pickup", icon: PlusCircle, badge: "Fast" },
    { href: "/about", label: "About Us", icon: Info },
    { href: "/contact", label: "Contact Us", icon: MessageSquare },
  ];

  return (
    <>
      {/* Trigger: Either customTrigger or default hamburger button */}
      {customTrigger ? (
        <div onClick={() => setIsOpen(true)} role="button" tabIndex={0}>
          {customTrigger}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="p-2 rounded-lg text-[#002B49] hover:bg-slate-100 transition-colors focus:outline-none border border-slate-200 shadow-xs"
          aria-label="Open mobile navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      )}

      {/* Drawer Overlay & Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Dark Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in-50"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Slide-out Drawer Panel */}
          <div className="relative ml-auto w-full max-w-xs sm:max-w-sm bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-250">
            {/* Header */}
            <div className="p-4 bg-[#002B49] text-white flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-2 font-bold text-lg">
                <div className="w-8 h-8 rounded-lg bg-[#FF6B00] flex items-center justify-center text-white">
                  <Truck className="w-4 h-4" />
                </div>
                <span>
                  SS Courier<span className="text-[#FF6B00]"> service</span>
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Nav Links */}
            <div className="flex-1 overflow-y-auto p-4 space-y-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1">
                Navigation Menu
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
                        ? "bg-orange-50 text-[#FF6B00] font-bold"
                        : "text-[#002B49] hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? "text-[#FF6B00]" : "text-slate-400"}`} />
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

              {/* Portals */}
              <div className="pt-4 mt-2 border-t border-slate-100 space-y-1">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1">
                  Portals & Access
                </div>
                <Link
                  href="/login"
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-[#002B49] hover:bg-slate-50"
                >
                  <LogIn className="w-4 h-4 text-slate-400" />
                  <span>Customer Sign In</span>
                </Link>
                <Link
                  href="/register"
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-[#002B49] hover:bg-slate-50"
                >
                  <UserPlus className="w-4 h-4 text-slate-400" />
                  <span>Register Free Account</span>
                </Link>
                <Link
                  href="/admin/login"
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-[#FF6B00]"
                >
                  <ShieldCheck className="w-4 h-4 text-slate-400" />
                  <span>Admin Operations →</span>
                </Link>
              </div>

              {/* Direct Call Helplines */}
              <div className="pt-4 mt-2 border-t border-slate-100 space-y-2.5 px-3 text-xs">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Direct Contact
                </div>
                {phones.map((p, i) => (
                  <a
                    key={i}
                    href={`tel:${p}`}
                    className="flex items-center gap-2 font-semibold text-[#002B49] hover:text-[#FF6B00]"
                  >
                    <Phone className="w-3.5 h-3.5 text-[#FF6B00]" />
                    <span>+91 {p}</span>
                  </a>
                ))}
                <a
                  href={`mailto:${email}`}
                  className="flex items-center gap-2 text-slate-600 hover:text-[#FF6B00]"
                >
                  <Mail className="w-3.5 h-3.5 text-[#FF6B00]" />
                  <span className="truncate">{email}</span>
                </a>
              </div>
            </div>

            {/* Bottom Button */}
            <div className="p-4 border-t border-slate-100 bg-slate-50">
              <Link
                href="/book"
                className="w-full inline-flex items-center justify-center gap-2 bg-[#FF6B00] hover:bg-[#e05e00] text-white py-3 rounded-lg font-bold text-sm shadow-md transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Book Pickup Now</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
