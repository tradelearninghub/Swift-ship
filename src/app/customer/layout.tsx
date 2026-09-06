"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Truck,
  LayoutDashboard,
  PlusCircle,
  PackageCheck,
  Search,
  User,
  Bell,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SignOutButton } from "@/components/SignOutButton";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { href: "/customer", label: "Dashboard", icon: LayoutDashboard },
    { href: "/book", label: "New Booking", icon: PlusCircle, highlight: true },
    { href: "/customer/bookings", label: "Booking History", icon: PackageCheck },
    { href: "/track", label: "Track Shipment", icon: Search },
    { href: "/customer/profile", label: "Profile & Addresses", icon: User },
    { href: "/customer/notifications", label: "Notifications", icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-surface-subtle flex flex-col md:flex-row">
      {/* Desktop Sidebar Navigation */}
      <aside className="hidden md:flex w-64 bg-surface-base border-r border-border-default flex-col shrink-0">
        <div className="h-16 px-6 border-b border-border-default flex items-center justify-between">
          <Link href="/customer" className="flex items-center gap-2 font-bold text-lg text-text-primary">
            <div className="w-8 h-8 rounded-lg bg-[#002B49] flex items-center justify-center text-white">
              <Truck className="w-4 h-4 text-[#FF6B00]" />
            </div>
            <span>
              SS<span className="text-[#FF6B00]"> Customer</span>
            </span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-blue-50 text-brand-primary font-bold"
                    : link.highlight
                    ? "text-brand-accent font-semibold hover:bg-surface-subtle"
                    : "text-text-secondary hover:bg-surface-subtle hover:text-text-primary"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border-default space-y-1">
          <Link
            href="/"
            className="flex items-center gap-3 px-3.5 py-2 rounded-lg text-xs font-medium text-text-muted hover:text-text-primary hover:bg-surface-subtle transition-colors"
          >
            ← Back to Public Website
          </Link>
          <div className="px-3.5 py-2">
            <SignOutButton className="text-red-600 hover:text-red-700" />
          </div>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileDrawerOpen(false)}
          />
          <div className="relative w-4/5 max-w-xs bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
            <div className="h-16 px-4 border-b border-border-default flex items-center justify-between bg-[#002B49] text-white">
              <div className="flex items-center gap-2 font-bold">
                <Truck className="w-5 h-5 text-[#FF6B00]" />
                <span>Customer Portal</span>
              </div>
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(false)}
                className="p-1 rounded text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileDrawerOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium ${
                      isActive
                        ? "bg-blue-50 text-brand-primary font-bold"
                        : "text-text-secondary hover:bg-surface-subtle hover:text-text-primary"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t border-border-default space-y-2">
              <Link
                href="/"
                className="block text-xs font-medium text-text-muted hover:text-text-primary"
              >
                ← Back to Public Website
              </Link>
              <div className="pt-1">
                <SignOutButton className="text-red-600 hover:text-red-700" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content View */}
      <div className="flex-1 flex flex-col min-w-0 overflow-auto">
        <header className="h-16 bg-surface-base border-b border-border-default px-4 sm:px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(true)}
              className="md:hidden p-2 rounded-lg text-text-secondary hover:bg-surface-subtle"
              aria-label="Open portal menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
              Customer Self-Service
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/book">
              <Button variant="accent" size="sm" className="bg-[#FF6B00] hover:bg-[#e05e00] text-white">
                <PlusCircle className="w-4 h-4 mr-1" /> Book Parcel
              </Button>
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
