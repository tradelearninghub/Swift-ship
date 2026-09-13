"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { StateView } from "@/components/ui/StateView";
import { CreditCard, RefreshCw } from "lucide-react";
import { formatPaiseToRupees } from "@/lib/utils";

export default function AdminPaymentsPage() {
  const [viewState, setViewState] = useState<"populated" | "loading" | "empty" | "error">("loading");
  const [bookings, setBookings] = useState<any[]>([]);
  const [totals, setTotals] = useState({ invoiced: 0, paid: 0, pending: 0 });

  const fetchPayments = useCallback(async () => {
    setViewState("loading");
    try {
      const res = await fetch("/api/bookings?limit=100");
      if (!res.ok) throw new Error("Failed to fetch bookings");
      const data = await res.json();
      const list = (data.bookings || []).filter((b: any) => b.charges);
      setBookings(list);

      // Compute totals
      const invoiced = list.reduce((sum: number, b: any) => sum + (b.charges?.total || 0), 0);
      setTotals({ invoiced, paid: invoiced, pending: 0 }); // All collected at counter for now

      setViewState(list.length === 0 ? "empty" : "populated");
    } catch {
      setViewState("error");
    }
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Shipping Charge Payments</h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Monitor customer freight payments, manual counter collections, and gateway reconciliations.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchPayments}>
          <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="text-xs font-bold uppercase text-text-muted">Total Freight Invoiced</div>
          <div className="text-2xl font-bold text-text-primary mt-1">
            {formatPaiseToRupees(totals.invoiced)}
          </div>
        </Card>
        <Card className="p-4 border-emerald-200 bg-emerald-50/40">
          <div className="text-xs font-bold uppercase text-emerald-800">Paid & Collected</div>
          <div className="text-2xl font-bold text-emerald-800 mt-1">
            {formatPaiseToRupees(totals.paid)}
          </div>
        </Card>
        <Card className="p-4 border-amber-200 bg-amber-50/40">
          <div className="text-xs font-bold uppercase text-amber-800">Pending Payment</div>
          <div className="text-2xl font-bold text-amber-800 mt-1">
            {formatPaiseToRupees(totals.pending)}
          </div>
        </Card>
      </div>

      <Card>
        <StateView
          state={viewState}
          emptyTitle="No payment records"
          emptyDescription="No bookings with shipping charges have been recorded yet."
          onRetry={fetchPayments}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-subtle border-b border-border-default uppercase text-text-muted">
                <tr>
                  <th className="px-4 py-3 font-semibold">Booking Ref</th>
                  <th className="px-4 py-3 font-semibold">Customer</th>
                  <th className="px-4 py-3 font-semibold">Amount</th>
                  <th className="px-4 py-3 font-semibold">Payment Method</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-default">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-surface-subtle transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-brand-primary">
                      {b.booking_number}
                    </td>
                    <td className="px-4 py-3 font-medium text-text-primary">
                      {b.customer?.name || b.sender_name}
                    </td>
                    <td className="px-4 py-3 font-mono font-bold">
                      {formatPaiseToRupees(b.charges.total)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[11px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                        Manual Cash / UPI at Intake
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status="PAID" />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="outline" size="sm">
                        Receipt
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
