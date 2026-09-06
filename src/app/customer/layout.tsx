import React from "react";
import Link from "next/link";
import {
  Truck,
  LayoutDashboard,
  PlusCircle,
  PackageCheck,
  Search,
  User,
  Bell,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-surface-subtle flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-surface-base border-r border-border-default flex flex-col shrink-0">
        <div className="h-16 px-6 border-b border-border-default flex items-center justify-between">
          <Link href="/customer" className="flex items-center gap-2 font-bold text-lg text-text-primary">
            <div className="w-8 h-8 rounded-lg bg-brand-primary flex items-center justify-center text-white">
              <Truck className="w-4 h-4" />
            </div>
            <span>Customer Portal</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <Link
            href="/customer"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium bg-blue-50 text-brand-primary"
          >
            <LayoutDashboard className="w-4 h-4" /> Dashboard
          </Link>
          <Link
            href="/book"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium text-text-secondary hover:bg-surface-subtle hover:text-text-primary transition-colors"
          >
            <PlusCircle className="w-4 h-4 text-brand-accent" /> New Booking
          </Link>
          <Link
            href="/customer/bookings"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium text-text-secondary hover:bg-surface-subtle hover:text-text-primary transition-colors"
          >
            <PackageCheck className="w-4 h-4" /> Booking History
          </Link>
          <Link
            href="/track"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium text-text-secondary hover:bg-surface-subtle hover:text-text-primary transition-colors"
          >
            <Search className="w-4 h-4" /> Track Shipment
          </Link>
          <Link
            href="/customer/profile"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium text-text-secondary hover:bg-surface-subtle hover:text-text-primary transition-colors"
          >
            <User className="w-4 h-4" /> Profile & Addresses
          </Link>
          <Link
            href="/customer/notifications"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium text-text-secondary hover:bg-surface-subtle hover:text-text-primary transition-colors"
          >
            <Bell className="w-4 h-4" /> Notifications
          </Link>
        </nav>

        <div className="p-4 border-t border-border-default">
          <Link href="/login" className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-rose-50 transition-colors">
            <LogOut className="w-4 h-4" /> Sign Out
          </Link>
        </div>
      </aside>

      {/* Main Content View */}
      <div className="flex-1 flex flex-col min-w-0 overflow-auto">
        <header className="h-16 bg-surface-base border-b border-border-default px-6 flex items-center justify-between shrink-0">
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
            Customer Self-Service
          </h2>
          <div className="flex items-center gap-3">
            <Link href="/book">
              <Button variant="accent" size="sm">
                <PlusCircle className="w-4 h-4 mr-1" /> Quick Book
              </Button>
            </Link>
          </div>
        </header>

        <main className="flex-1 p-6 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
