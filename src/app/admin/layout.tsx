import React from "react";
import Link from "next/link";
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
  LogOut,
  ShieldCheck,
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-surface-admin-base flex flex-col md:flex-row text-sm">
      {/* Admin Sidebar (240px desktop) */}
      <aside className="w-full md:w-60 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800">
        <div className="h-14 px-4 border-b border-slate-800 flex items-center justify-between">
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
          <div className="text-[11px] font-bold uppercase text-slate-500 px-3 py-1.5 tracking-wider">
            Core Operations
          </div>
          <Link
            href="/admin"
            className="flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium bg-brand-primary text-white"
          >
            <LayoutDashboard className="w-4 h-4" /> Dashboard
          </Link>
          <Link
            href="/admin/bookings"
            className="flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <Package className="w-4 h-4" /> Bookings
          </Link>
          <Link
            href="/admin/shipments"
            className="flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <Send className="w-4 h-4" /> Shipments & AWB
          </Link>

          <div className="text-[11px] font-bold uppercase text-slate-500 px-3 pt-3 py-1.5 tracking-wider">
            Management
          </div>
          <Link
            href="/admin/customers"
            className="flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <Users className="w-4 h-4" /> Customers
          </Link>
          <Link
            href="/admin/staff"
            className="flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <UserCheck className="w-4 h-4" /> Staff & Roles
          </Link>
          <Link
            href="/admin/couriers"
            className="flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <Building2 className="w-4 h-4" /> Courier Partners
          </Link>

          <div className="text-[11px] font-bold uppercase text-slate-500 px-3 pt-3 py-1.5 tracking-wider">
            Finance & Support
          </div>
          <Link
            href="/admin/cod"
            className="flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <DollarSign className="w-4 h-4" /> COD Settlements
          </Link>
          <Link
            href="/admin/payments"
            className="flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <CreditCard className="w-4 h-4" /> Payments
          </Link>
          <Link
            href="/admin/support"
            className="flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <LifeBuoy className="w-4 h-4" /> Support Tickets
          </Link>

          <div className="text-[11px] font-bold uppercase text-slate-500 px-3 pt-3 py-1.5 tracking-wider">
            System
          </div>
          <Link
            href="/admin/notifications"
            className="flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <Bell className="w-4 h-4" /> Notifications
          </Link>
          <Link
            href="/admin/reports"
            className="flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <BarChart3 className="w-4 h-4" /> Reports
          </Link>
          <Link
            href="/admin/settings"
            className="flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <Settings className="w-4 h-4" /> System Settings
          </Link>
        </nav>

        <div className="p-3 border-t border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center font-bold text-white">
              SA
            </div>
            <div>
              <div className="font-semibold text-white">Super Admin</div>
              <div className="text-[10px] text-slate-400">admin@swiftship.com</div>
            </div>
          </div>
          <Link href="/login" title="Sign Out" className="text-slate-400 hover:text-rose-400">
            <LogOut className="w-4 h-4" />
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-auto">
        <header className="h-14 bg-surface-base border-b border-border-default px-6 flex items-center justify-between shrink-0">
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

        <main className="flex-1 p-6 max-w-[1600px] w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
