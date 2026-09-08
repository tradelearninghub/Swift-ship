"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, PlusCircle, Calculator, Menu } from "lucide-react";
import { MobileNav } from "@/components/MobileNav";

interface BottomNavProps {
  phones?: string[];
  email?: string;
  address?: string;
}

export function BottomNav({ phones, email, address }: BottomNavProps) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Do not show bottom nav on admin portal routes
  if (pathname.startsWith("/admin")) {
    return null;
  }

  const items = [
    { href: "/", label: "Home", icon: Home },
    { href: "/track", label: "Track", icon: Search },
    { href: "/book", label: "Book", icon: PlusCircle, isPrimary: true },
    { href: "/calculator", label: "Rates", icon: Calculator },
  ];

  return (
    <>
      {/* Fixed Bottom Mobile Navigation Bar */}
      <nav
        aria-label="Mobile Navigation"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg pb-safe"
      >
        <div className="grid grid-cols-5 h-16 max-w-lg mx-auto items-center px-1">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            if (item.isPrimary) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex flex-col items-center justify-center relative -top-3"
                >
                  <div className="w-12 h-12 rounded-full bg-[#FF6B00] hover:bg-[#e05e00] text-white shadow-lg shadow-[#FF6B00]/30 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-bold text-[#FF6B00] mt-1">
                    {item.label}
                  </span>
                </Link>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center h-full py-1 transition-colors ${
                  isActive
                    ? "text-[#FF6B00] font-bold"
                    : "text-slate-500 hover:text-[#002B49]"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-[#FF6B00]" : "text-slate-500"}`} />
                <span className="text-[11px] font-medium mt-1">{item.label}</span>
              </Link>
            );
          })}

          {/* 5th Button: Drawer Menu trigger */}
          <div className="flex flex-col items-center justify-center h-full py-1">
            <MobileNav
              phones={phones}
              email={email}
              address={address}
              customTrigger={
                <button
                  type="button"
                  className="flex flex-col items-center justify-center text-slate-500 hover:text-[#002B49]"
                  aria-label="Open full menu"
                >
                  <Menu className="w-5 h-5" />
                  <span className="text-[11px] font-medium mt-1">Menu</span>
                </button>
              }
            />
          </div>
        </div>
      </nav>
    </>
  );
}
