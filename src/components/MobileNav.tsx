"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  Phone,
  Mail,
  Home,
  Package,
  Search,
  Calculator,
  HelpCircle,
  Info,
  LogIn,
  UserPlus,
  ShieldCheck,
  Truck,
  PlusCircle,
  UserCheck,
  LogOut,
} from "lucide-react";

export interface MobileNavUser {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
}

interface MobileNavProps {
  phones: string[];
  email: string;
  address: string;
  socials?: { url?: string; isSvg?: boolean; hover?: string; label?: string; icon?: string }[];
  whatsappUrl?: string;
  user?: MobileNavUser | null;
}

export function MobileNav({
  phones,
  email,
  address,
  socials = [],
  whatsappUrl,
  user: initialUser = null,
}: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<MobileNavUser | null>(initialUser);
  const pathname = usePathname();

  useEffect(() => {
    let isMounted = true;
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setCurrentUser(data.user || null);
          }
        } else if (isMounted) {
          setCurrentUser(null);
        }
      } catch {
        // preserve current state on error
      }
    }
    checkAuth();
    return () => {
      isMounted = false;
    };
  }, [pathname]);

  const displayEmail = email || "support@sscourierservice.in";

  const navLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/services", label: "Services", icon: Package },
    { href: "/track", label: "Track Consignment", icon: Search },
    { href: "/calculator", label: "Rate Calculator", icon: Calculator },
    { href: "/how-it-works", label: "How It Works", icon: HelpCircle },
    { href: "/about", label: "About Us", icon: Info },
    { href: "/contact", label: "Contact Us", icon: Phone },
  ];

  return (
    <>
      {/* Mobile Menu Hamburger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="p-2 rounded-lg text-[#030164] hover:bg-slate-100 transition-colors focus:outline-none border border-slate-200 shadow-xs"
        aria-label="Open mobile navigation menu"
        aria-expanded={isOpen}
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Slide-out Backdrop & Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden h-[100dvh]">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in-50"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Slide-out Drawer Panel (uses dynamic viewport height 100dvh) */}
          <div className="relative ml-auto w-full max-w-xs sm:max-w-sm bg-white h-[100dvh] max-h-[100dvh] shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-250">
            {/* Header */}
            <div className="p-3.5 bg-[#06122C] text-white flex items-center justify-between border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/ss-logo.jpg"
                  alt="SS International Courier"
                  className="h-8 w-auto object-contain bg-white rounded-md p-1"
                />
                <div className="flex flex-col">
                  <span className="font-bold text-xs leading-tight tracking-tight text-white">SS INTERNATIONAL</span>
                  <span className="text-[8px] font-bold text-[#C58B24] tracking-[0.2em] uppercase leading-none">COURIER</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close navigation menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Action Button: Book a Parcel when logged in, Login when not logged in */}
            <div className="p-3 border-b border-slate-100 bg-slate-50 shrink-0">
              {currentUser ? (
                <Link
                  href="/book"
                  onClick={() => setIsOpen(false)}
                  className="w-full flex items-center justify-center gap-2 bg-[#C58B24] hover:bg-[#b07b1d] text-white font-bold py-2.5 px-4 rounded-xl shadow-sm text-sm transition-all"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Book a Parcel</span>
                </Link>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="w-full flex items-center justify-center gap-2 bg-[#C58B24] hover:bg-[#b07b1d] text-white font-bold py-2.5 px-4 rounded-xl shadow-sm text-sm transition-all"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Login</span>
                </Link>
              )}
            </div>

            {/* Scrollable Nav Content (with proper padding to ensure all buttons are visible) */}
            <div className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-2 pb-24">
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
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                      isActive
                        ? "bg-[#06122C] text-[#C58B24]"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`w-4 h-4 ${
                          isActive ? "text-[#C58B24]" : "text-slate-400"
                        }`}
                      />
                      <span>{link.label}</span>
                    </div>
                  </Link>
                );
              })}

              {/* Portal Links */}
              <div className="pt-3 border-t border-slate-100 space-y-1">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1">
                  Portals &amp; Access
                </div>
                {currentUser ? (
                  <>
                    <div className="px-3.5 py-1 text-xs text-slate-600 flex items-center justify-between">
                      <span>Logged in as</span>
                      <strong className="text-[#06122C] font-semibold">{currentUser.name}</strong>
                    </div>
                    <Link
                      href={currentUser.role === "ADMIN" || currentUser.role === "SUPER_ADMIN" ? "/admin" : "/customer"}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-sm font-semibold text-[#06122C] hover:bg-slate-50 transition-colors"
                    >
                      <UserCheck className="w-4 h-4 text-emerald-600" />
                      <span>{currentUser.role === "ADMIN" || currentUser.role === "SUPER_ADMIN" ? "Admin Operations" : "Customer Dashboard"}</span>
                    </Link>
                    <button
                      type="button"
                      onClick={async () => {
                        setIsOpen(false);
                        try {
                          await fetch("/api/auth/logout", { method: "POST" });
                        } catch {}
                        window.location.href = "/login";
                      }}
                      className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-colors text-left cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      <span>Sign Out</span>
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-sm font-semibold text-[#06122C] hover:bg-slate-50"
                    >
                      <LogIn className="w-4 h-4 text-slate-400" />
                      <span>Customer Sign In</span>
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-sm font-semibold text-[#06122C] hover:bg-slate-50"
                    >
                      <UserPlus className="w-4 h-4 text-slate-400" />
                      <span>Register Free Account</span>
                    </Link>
                    <Link
                      href="/admin/login"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-[#C58B24]"
                    >
                      <ShieldCheck className="w-4 h-4 text-slate-400" />
                      <span>Admin Operations →</span>
                    </Link>
                  </>
                )}
              </div>

              {/* Direct Call Helplines & Support Email (Fully visible on mobile) */}
              <div className="pt-3 border-t border-slate-100 space-y-2 px-3 text-xs">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Direct Contact
                </div>
                {phones.map((p, i) => {
                  const cleanP = p.replace(/^\+91/, "").trim();
                  return (
                    <a
                      key={i}
                      href={`tel:+91${cleanP}`}
                      className="flex items-center gap-2 font-semibold text-[#06122C] hover:text-[#C58B24]"
                    >
                      <Phone className="w-3.5 h-3.5 text-[#C58B24] shrink-0" />
                      <span>+91 {cleanP}</span>
                    </a>
                  );
                })}
                <a
                  href={`mailto:${displayEmail}`}
                  className="flex items-center gap-2 text-slate-600 hover:text-[#C58B24] py-0.5"
                >
                  <Mail className="w-3.5 h-3.5 text-[#C58B24] shrink-0" />
                  <span className="break-all font-medium text-xs">{displayEmail}</span>
                </a>
              </div>

              {/* Mobile Social Links */}
              {socials && socials.length > 0 && (
                <div className="pt-3 border-t border-slate-100 px-3">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Follow Us &amp; Chat
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {socials.map((s, idx) => (
                      <a
                        key={idx}
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`w-8 h-8 rounded-full bg-slate-100 ${s.hover || "hover:bg-[#06122C]"} text-slate-700 hover:text-white flex items-center justify-center transition-all text-xs shadow-xs`}
                        title={s.label}
                        aria-label={s.label}
                      >
                        {s.isSvg ? (
                          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                          </svg>
                        ) : (
                          <i className={s.icon || "fas fa-share-alt"}></i>
                        )}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Notice */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 text-center shrink-0">
              <p className="font-semibold text-slate-700">SS International Courier</p>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-0.5 truncate text-[10px] text-blue-600 hover:underline block"
                title="Open address in Google Maps"
              >
                {address}
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

