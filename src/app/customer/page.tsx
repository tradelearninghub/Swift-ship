"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import {
  Package,
  Truck,
  CheckCircle2,
  RotateCcw,
  Plus,
  ArrowRight,
  RefreshCw,
  Clock,
  ExternalLink,
} from "lucide-react";
import { formatPaiseToRupees } from "@/lib/utils";
import { formatDateTimeIST } from "@/lib/datetime";

export default function CustomerDashboardPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [userName, setUserName] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch session user and bookings in parallel
      const [userRes, bookingsRes] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/bookings?limit=50"),
      ]);

      if (userRes.ok) {
        const userData = await userRes.json();
        if (userData?.user?.name) {
          setUserName(userData.user.name);
        }
      }

      if (bookingsRes.ok) {
        const data = await bookingsRes.json();
        setBookings(data.bookings || []);
      }
    } catch (err) {
      console.error("Failed to load customer dashboard data", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Derived real-time metrics
  const totalBookings = bookings.length;
  const inTransitCount = bookings.filter((b) =>
    ["IN_TRANSIT", "OUT_FOR_DELIVERY", "PICKED_UP"].includes(b.shipment?.status || b.status)
  ).length;
  const deliveredCount = bookings.filter(
    (b) => b.shipment?.status === "DELIVERED"
  ).length;
  const rtoCount = bookings.filter(
    (b) => b.shipment?.status === "RTO"
  ).length;

  const recentBookings = bookings.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            Welcome Back{userName ? `, ${userName}` : ""}
          </h1>
          <p className="text-sm text-text-secondary">
            Manage your parcel bookings, monitor active dispatches, and track shipments in real-time.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
            <RefreshCw className={`w-3.5 h-3.5 mr-1 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
          <Link href="/book">
            <Button variant="accent" size="sm">
              <Plus className="w-4 h-4 mr-1.5" /> Book New Parcel
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-muted uppercase">Total Bookings</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-brand-primary flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-text-primary mt-2">
            {loading ? "…" : totalBookings}
          </div>
          <div className="text-xs text-text-muted mt-1">All-time parcels</div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-muted uppercase">In Transit</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-brand-accent flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-text-primary mt-2">
            {loading ? "…" : inTransitCount}
          </div>
          <div className="text-xs text-amber-600 mt-1 font-medium">Currently dispatched</div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-muted uppercase">Delivered</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-text-primary mt-2">
            {loading ? "…" : deliveredCount}
          </div>
          <div className="text-xs text-emerald-600 mt-1 font-medium">Successfully received</div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-muted uppercase">RTO / Return</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <RotateCcw className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-text-primary mt-2">
            {loading ? "…" : rtoCount}
          </div>
          <div className="text-xs text-text-muted mt-1">Returned shipments</div>
        </Card>
      </div>

      {/* Recent Shipments */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Shipments</CardTitle>
            <p className="text-xs text-text-secondary mt-0.5">Your latest booked parcels and active tracking</p>
          </div>
          {bookings.length > 0 && (
            <Link href="/customer/bookings" className="text-xs font-semibold text-brand-primary hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="py-12 text-center text-xs text-text-muted">
              <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-brand-primary" />
              Loading your shipments…
            </div>
          ) : recentBookings.length === 0 ? (
            <div className="py-12 text-center text-xs text-text-muted space-y-3">
              <Package className="w-10 h-10 mx-auto text-text-muted/60" />
              <div>
                <p className="font-semibold text-text-primary text-sm">No shipments booked yet</p>
                <p className="text-xs text-text-secondary mt-0.5 max-w-sm mx-auto">
                  You haven&apos;t booked any parcels yet. Click below to create your first delivery booking with door pickup!
                </p>
              </div>
              <div>
                <Link href="/book">
                  <Button variant="primary" size="sm">
                    <Plus className="w-4 h-4 mr-1" /> Book Your First Parcel
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-surface-subtle border-b border-border-default text-xs uppercase text-text-muted">
                  <tr>
                    <th className="px-6 py-3 font-semibold">Booking ID</th>
                    <th className="px-6 py-3 font-semibold">Destination</th>
                    <th className="px-6 py-3 font-semibold">Courier / AWB</th>
                    <th className="px-6 py-3 font-semibold">Amount / Mode</th>
                    <th className="px-6 py-3 font-semibold">Status</th>
                    <th className="px-6 py-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-default">
                  {recentBookings.map((b) => {
                    const trackingToken = b.shipment?.tracking_token || b.shipment?.awb || b.booking_number;
                    const amountPaise = b.final_total_paise || b.charges?.total || b.estimated_total_paise || 0;
                    return (
                      <tr key={b.id} className="hover:bg-surface-subtle transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-brand-primary">
                          <Link href={`/customer/bookings/${b.id}`} className="hover:underline">
                            {b.booking_number}
                          </Link>
                          <div className="text-[10px] text-text-muted font-sans font-normal">
                            {formatDateTimeIST(b.created_at)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-text-primary">{b.receiver_name}</div>
                          <div className="text-xs text-text-secondary">
                            {b.receiver_city}{b.receiver_state ? `, ${b.receiver_state}` : ""}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {b.shipment ? (
                            <div>
                              <div className="font-mono text-xs font-semibold text-text-primary">
                                {b.shipment.awb || "Pending AWB"}
                              </div>
                              <div className="text-[11px] text-text-muted">
                                {b.shipment.courier_partner?.name || "In-House"}
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-text-muted flex items-center gap-1">
                              <Clock className="w-3 h-3" /> Awaiting Review
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-text-primary">
                            {amountPaise > 0 ? formatPaiseToRupees(amountPaise) : "Pending Rate"}
                          </div>
                          <div className="text-[10px] text-text-muted uppercase font-medium">
                            {b.payment_type === "COD" ? `COD (₹${Math.round(b.cod_amount / 100)})` : "Prepaid"}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={b.shipment?.status || b.status} />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link href={`/track/${trackingToken}`}>
                            <Button variant="outline" size="sm">
                              Track <ExternalLink className="w-3 h-3 ml-1" />
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
