"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Bell, CheckCircle2, Truck, AlertCircle, Clock } from "lucide-react";

export default function CustomerNotificationsPage() {
  const notifications = [
    {
      id: "notif-1",
      title: "Shipment Dispatched — In Transit",
      message: "Consignment BK-1025 (Delhivery AWB: DEL98234123) has departed Ahmedabad Transit Gateway towards Mumbai.",
      timestamp: "2 hours ago",
      icon: Truck,
      type: "info",
    },
    {
      id: "notif-2",
      title: "Booking Request Approved",
      message: "Staff reviewed booking BK-1025. Verified shipping charge set to ₹200.00. Assigned carrier: Delhivery.",
      timestamp: "Yesterday",
      icon: CheckCircle2,
      type: "success",
    },
    {
      id: "notif-3",
      title: "Shipment Delivered Successfully",
      message: "Consignment BK-1018 (Blue Dart AWB: BLU77491021) was delivered to recipient in Noida.",
      timestamp: "3 days ago",
      icon: CheckCircle2,
      type: "success",
    },
    {
      id: "notif-4",
      title: "Booking Request Received",
      message: "We have received your booking request BK-1031. It will be reviewed by our hub team shortly.",
      timestamp: "4 days ago",
      icon: Clock,
      type: "neutral",
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Notifications Center</h1>
        <p className="text-xs text-text-secondary mt-0.5">
          Real-time alerts on your parcel bookings, transit milestones, and payment receipts.
        </p>
      </div>

      <div className="space-y-3">
        {notifications.map((n) => {
          const Icon = n.icon;
          return (
            <Card key={n.id} className="p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-brand-primary flex items-center justify-center shrink-0 mt-0.5">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-text-primary">{n.title}</h4>
                    <span className="text-[11px] text-text-muted font-mono">{n.timestamp}</span>
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed">{n.message}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
