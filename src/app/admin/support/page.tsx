"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { MOCK_SUPPORT_TICKETS } from "@/lib/mockData";
import { LifeBuoy, AlertCircle, Plus, MessageSquare, Eye } from "lucide-react";

export default function AdminSupportPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Support & Dispute Tickets</h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Manage customer complaints, weight disputes, delayed transit investigations, and damages (§49).
          </p>
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-subtle border-b border-border-default uppercase text-text-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">Ticket ID</th>
                <th className="px-4 py-3 font-semibold">Booking Ref</th>
                <th className="px-4 py-3 font-semibold">Issue Category</th>
                <th className="px-4 py-3 font-semibold">Subject & Description</th>
                <th className="px-4 py-3 font-semibold">Raised By</th>
                <th className="px-4 py-3 font-semibold">Assignee</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-default">
              {MOCK_SUPPORT_TICKETS.map((t) => (
                <tr key={t.id} className="hover:bg-surface-subtle transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-brand-primary">
                    {t.ticket_number}
                  </td>
                  <td className="px-4 py-3 font-mono font-semibold">
                    {t.booking_number || "General"}
                  </td>
                  <td className="px-4 py-3">
                    <span className="bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded font-bold text-[10px] uppercase">
                      {t.type.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3 max-w-xs">
                    <div className="font-bold text-text-primary">{t.subject}</div>
                    <div className="text-[11px] text-text-secondary truncate mt-0.5">
                      {t.description}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium">{t.raised_by_name}</td>
                  <td className="px-4 py-3 text-text-muted">{t.assigned_to_name}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={t.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="outline" size="sm">
                      <Eye className="w-3.5 h-3.5 mr-1" /> Resolve
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
