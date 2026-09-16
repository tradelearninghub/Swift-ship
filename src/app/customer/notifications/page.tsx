"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  Bell,
  CheckCircle2,
  Truck,
  AlertCircle,
  Clock,
  Package,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { formatDateTimeIST } from "@/lib/datetime";

export default function CustomerNotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/bookings?limit=20");
      if (res.ok) {
        const data = await res.json();
        const list: any[] = [];
        for (const b of data.bookings || []) {
          // Add booking event
          list.push({
            id: `bk-${b.id}`,
            title: `Booking #${b.booking_number} — ${b.status.replace(/_/g, " ")}`,
            message: `Consignment to ${b.receiver_name} (${b.receiver_city}) is currently ${b.status.toLowerCase().replace(/_/g, " ")}.`,
            timestamp: b.updated_at || b.created_at,
            type: b.status === "APPROVED" ? "success" : b.status === "REJECTED" ? "danger" : "info",
            link: `/customer/bookings/${b.id}`,
          });

          // Add shipment event if available
          if (b.shipment?.awb) {
            list.push({
              id: `sh-${b.shipment.id}`,
              title: `Shipment Allocated — AWB ${b.shipment.awb}`,
              message: `Carrier ${b.shipment.courier_partner?.name || "SS Courier Fleet"} assigned. Status: ${b.shipment.status.replace(/_/g, " ")}.`,
              timestamp: b.shipment.updated_at || b.shipment.created_at,
              type: b.shipment.status === "DELIVERED" ? "success" : "info",
              link: `/track/${b.shipment.tracking_token || b.shipment.awb}`,
            });
          }
        }
        // Sort descending by timestamp
        list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setNotifications(list);
      }
    } catch (err) {
      console.error("Failed to load notifications", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Notifications Center</h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Real-time operational alerts on your parcel bookings, transit milestones, and carrier updates.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchNotifications} disabled={loading}>
          <RefreshCw className={`w-3.5 h-3.5 mr-1 ${loading ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </div>

      {loading ? (
        <div className="py-16 text-center text-xs text-text-muted">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-primary" />
          Loading notifications…
        </div>
      ) : notifications.length === 0 ? (
        <Card className="p-12 text-center text-xs text-text-muted space-y-2">
          <Bell className="w-10 h-10 mx-auto text-text-muted/50" />
          <p className="font-semibold text-text-primary text-sm">You&apos;re all caught up!</p>
          <p className="max-w-sm mx-auto text-text-secondary">
            No new activity or consignment status updates at this moment. Notifications will appear here automatically when your parcels move.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <Card key={n.id} className="p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-start gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    n.type === "success"
                      ? "bg-emerald-50 text-emerald-600"
                      : n.type === "danger"
                      ? "bg-rose-50 text-rose-600"
                      : "bg-blue-50 text-brand-primary"
                  }`}
                >
                  {n.type === "success" ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : n.type === "danger" ? (
                    <AlertCircle className="w-4 h-4" />
                  ) : (
                    <Truck className="w-4 h-4" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-bold text-text-primary truncate">{n.title}</h3>
                    <span className="text-[11px] text-text-muted shrink-0">
                      {formatDateTimeIST(n.timestamp)}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                    {n.message}
                  </p>
                  {n.link && (
                    <div className="mt-2">
                      <Link
                        href={n.link}
                        className="inline-flex items-center gap-1 text-[11px] text-brand-primary font-semibold hover:underline"
                      >
                        View Details <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
