"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { StateView } from "@/components/ui/StateView";
import { LifeBuoy, Eye, RefreshCw } from "lucide-react";

export default function AdminSupportPage() {
  const [viewState, setViewState] = useState<"populated" | "loading" | "empty" | "error">("loading");
  const [tickets, setTickets] = useState<any[]>([]);

  const fetchTickets = useCallback(async () => {
    setViewState("loading");
    try {
      const res = await fetch("/api/admin/support");
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      const list = data.tickets || [];
      setTickets(list);
      setViewState(list.length === 0 ? "empty" : "populated");
    } catch {
      setViewState("error");
    }
  }, []);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Support & Dispute Tickets</h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Manage customer complaints, weight disputes, delayed transit investigations, and damage claims.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchTickets}>
          <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Refresh
        </Button>
      </div>

      <Card>
        <StateView
          state={viewState}
          emptyTitle="No support tickets"
          emptyDescription="No customer support or dispute tickets have been raised yet."
          onRetry={fetchTickets}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-subtle border-b border-border-default uppercase text-text-muted">
                <tr>
                  <th className="px-4 py-3 font-semibold">Ticket ID</th>
                  <th className="px-4 py-3 font-semibold">Booking Ref</th>
                  <th className="px-4 py-3 font-semibold">Issue Category</th>
                  <th className="px-4 py-3 font-semibold">Subject & Description</th>
                  <th className="px-4 py-3 font-semibold">Raised By</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-default">
                {tickets.map((t) => (
                  <tr key={t.id} className="hover:bg-surface-subtle transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-brand-primary">
                      {t.ticket_number}
                    </td>
                    <td className="px-4 py-3 font-mono font-semibold">
                      {t.booking?.booking_number || "General"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded font-bold text-[10px] uppercase">
                        {(t.category || t.type || "General").replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      <div className="font-bold text-text-primary">{t.subject}</div>
                      <div className="text-[11px] text-text-secondary truncate mt-0.5">
                        {t.description}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {t.customer?.name || t.raised_by_name || "Customer"}
                    </td>
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
        </StateView>
      </Card>
    </div>
  );
}
