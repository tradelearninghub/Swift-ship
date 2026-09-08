"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Truck,
  LayoutDashboard,
  Package,
  Send,
  Users,
  UserCheck,
  Building2,
  DollarSign,
  CreditCard,
  LifeBuoy,
  Bell,
  BarChart3,
  Settings,
  ShieldCheck,
  Menu,
  X,
} from "lucide-react";
import { SignOutButton } from "@/components/SignOutButton";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Bypass admin operational sidebar and chrome for admin login
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const navItems = [
    { section: "Core Operations" },
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { href: "/admin/bookings", label: "Bookings", icon: Package },
    { href: "/admin/shipments", label: "Shipments & AWB", icon: Send },

    { section: "Management" },
    { href: "/admin/customers", label: "Customers", icon: Users },
    { href: "/admin/staff", label: "Staff & Roles", icon: UserCheck },
    { href: "/admin/couriers", label: "Courier Partners", icon: Building2 },

    { section: "Finance & Support" },
    { href: "/admin/cod", label: "COD Settlements", icon: DollarSign },
    { href: "/admin/payments", label: "Payments", icon: CreditCard },
    { href: "/admin/support", label: "Support Tickets", icon: LifeBuoy },

    { section: "System" },
    { href: "/admin/notifications", label: "Notifications", icon: Bell },
    { href: "/admin/reports", label: "Reports", icon: BarChart3 },
    { href: "/admin/settings", label: "System Settings", icon: Settings },
  ];

  const isLinkActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <div className="min-h-screen bg-surface-admin-base flex flex-col md:flex-row text-sm">
      {/* Mobile Header Bar */}
      <div className="md:hidden bg-slate-900 text-white h-14 px-4 flex items-center justify-between border-b border-slate-800 shrink-0">
        <Link href="/admin" className="flex items-center gap-2 font-bold text-base text-white">
          <div className="w-7 h-7 rounded-md bg-brand-primary flex items-center justify-center text-white">
            <Truck className="w-4 h-4" />
          </div>
          <span>Admin Operations</span>
        </Link>
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Admin Sidebar (240px desktop, slide-out drawer on mobile) */}
      <aside
        className={`${
          mobileMenuOpen ? "block" : "hidden"
        } md:flex w-full md:w-60 bg-slate-900 text-slate-300 flex-col shrink-0 border-r border-slate-800 z-30`}
      >
        <div className="hidden md:flex h-14 px-4 border-b border-slate-800 items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2 font-bold text-base text-white">
            <div className="w-7 h-7 rounded-md bg-brand-primary flex items-center justify-center text-white">
              <Truck className="w-4 h-4" />
            </div>
            <span>Admin Operations</span>
          </Link>
          <span className="text-[10px] font-semibold uppercase bg-slate-800 text-brand-accent px-1.5 py-0.5 rounded">
            v2.0
          </span>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item, idx) => {
            if ("section" in item) {
              return (
                <div
                  key={idx}
                  className="text-[11px] font-bold uppercase text-slate-500 px-3 pt-3 pb-1 tracking-wider"
                >
                  {item.section}
                </div>
              );
            }

            const Icon = item.icon!;
            const active = isLinkActive(item.href!, item.exact);

            return (
              <Link
                key={item.href}
                href={item.href!}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                  active
                    ? "bg-brand-primary text-white shadow-sm font-bold"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon className="w-4 h-4" /> {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center font-bold text-white">
              SA
            </div>
            <div>
              <div className="font-semibold text-white">Super Admin</div>
              <div className="text-[10px] text-slate-400">admin@sscourierservice.in</div>
            </div>
          </div>
          <SignOutButton showText={false} className="text-slate-400 hover:text-rose-400" />
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-auto">
        <header className="hidden md:flex h-14 bg-surface-base border-b border-border-default px-6 items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="text-base font-bold text-text-primary">Admin Control Center</h1>
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
              <ShieldCheck className="w-3 h-3" /> System Operational
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="text-xs text-text-secondary hover:text-brand-primary font-medium"
            >
              View Live Website ↗
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 max-w-[1600px] w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
