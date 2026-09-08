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
  ShieldCheck,
  ExternalLink,
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
    { href: "/track", label: "Track Shipment", icon: Search },
    { href: "/book", label: "Book a Parcel", icon: PlusCircle, badge: "Fast" },
    { href: "/calculator", label: "Rate Calculator", icon: Calculator },
    { href: "/services", label: "Shipping Services", icon: Layers },
    { href: "/contact", label: "Contact & Support", icon: MessageSquare },
  ];

  return (
    <>
      {/* Mobile Hamburger toggle button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="lg:hidden p-2 rounded-xl text-text-primary hover:bg-slate-100 transition-colors focus:outline-none border border-border-default shadow-sm"
        aria-label="Open mobile navigation menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Drawer overlay & slide-out panel */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-in fade-in-50"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer panel */}
          <div className="relative ml-auto w-full max-w-xs sm:max-w-sm bg-surface-base h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-250 border-l border-border-default">
            {/* Drawer Header */}
            <div className="p-4 border-b border-border-default flex items-center justify-between bg-slate-900 text-white">
              <div className="flex items-center gap-2.5 font-bold text-base">
                <div className="w-8 h-8 rounded-lg bg-brand-primary flex items-center justify-center text-white shadow-sm">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <span className="block font-extrabold text-white text-sm">
                    SS Courier <span className="text-brand-accent">service</span>
                  </span>
                  <span className="block text-[10px] text-slate-400 font-normal">
                    Express Logistics & Cargo
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Nav Links */}
            <div className="flex-1 overflow-y-auto p-4 space-y-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-text-muted px-3 py-1">
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
                        ? "bg-blue-50 text-brand-primary font-bold shadow-xs border border-blue-100"
                        : "text-text-secondary hover:bg-slate-50 hover:text-text-primary"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? "text-brand-primary" : "text-text-muted"}`} />
                      <span>{link.label}</span>
                    </div>
                    {link.badge && (
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}

              {/* Portal Access */}
              <div className="pt-4 mt-2 border-t border-border-default space-y-1">
                <div className="text-[11px] font-bold uppercase tracking-wider text-text-muted px-3 py-1">
                  User Portals
                </div>
                <Link
                  href="/login"
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-text-secondary hover:bg-slate-50 hover:text-text-primary transition-colors"
                >
                  <LogIn className="w-4 h-4 text-text-muted" />
                  <span>Customer Sign In</span>
                </Link>
                <Link
                  href="/register"
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-text-secondary hover:bg-slate-50 hover:text-text-primary transition-colors"
                >
                  <UserPlus className="w-4 h-4 text-text-muted" />
                  <span>Create Account</span>
                </Link>
                <Link
                  href="/admin/login"
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-text-muted hover:bg-slate-50 hover:text-brand-primary transition-colors"
                >
                  <ShieldCheck className="w-4 h-4 text-text-muted" />
                  <span>Admin Staff Portal →</span>
                </Link>
              </div>

              {/* Direct Phone Support */}
              <div className="pt-4 mt-2 border-t border-border-default space-y-2 px-3">
                <div className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                  Direct Helplines
                </div>
                {phones.map((phone, idx) => (
                  <a
                    key={idx}
                    href={`tel:${phone}`}
                    className="flex items-center gap-2.5 text-xs font-semibold text-text-secondary hover:text-brand-primary"
                  >
                    <Phone className="w-3.5 h-3.5 text-brand-accent" />
                    <span>+91 {phone}</span>
                  </a>
                ))}
                <a
                  href={`mailto:${email}`}
                  className="flex items-center gap-2.5 text-xs text-text-secondary hover:text-brand-primary"
                >
                  <Mail className="w-3.5 h-3.5 text-brand-accent" />
                  <span className="truncate">{email}</span>
                </a>
              </div>
            </div>

            {/* Action Footer */}
            <div className="p-4 border-t border-border-default bg-surface-subtle space-y-2">
              <Link href="/book" className="block">
                <Button variant="accent" className="w-full font-bold shadow-sm flex items-center justify-center gap-2">
                  <PlusCircle className="w-4 h-4" /> Book Parcel
                </Button>
              </Link>
              <Link href="/track" className="block">
                <Button variant="outline" className="w-full font-semibold flex items-center justify-center gap-2">
                  <Search className="w-4 h-4" /> Track Consignment
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
