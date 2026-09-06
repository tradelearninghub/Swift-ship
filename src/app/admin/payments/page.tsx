"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { CreditCard, CheckCircle2, RefreshCw, DollarSign } from "lucide-react";
import { MOCK_BOOKINGS } from "@/lib/mockData";
import { formatPaiseToRupees } from "@/lib/utils";

export default function AdminPaymentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Shipping Charge Payments</h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Monitor customer freight payments, manual counter collections, and gateway reconciliations (§36).
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="text-xs font-bold uppercase text-text-muted">Total Freight Invoiced</div>
          <div className="text-2xl font-bold text-text-primary mt-1">₹42,800</div>
        </Card>
        <Card className="p-4 border-emerald-200 bg-emerald-50/40">
          <div className="text-xs font-bold uppercase text-emerald-800">Paid & Collected</div>
          <div className="text-2xl font-bold text-emerald-800 mt-1">₹38,500</div>
        </Card>
        <Card className="p-4 border-amber-200 bg-amber-50/40">
          <div className="text-xs font-bold uppercase text-amber-800">Pending Payment</div>
          <div className="text-2xl font-bold text-amber-800 mt-1">₹4,300</div>
        </Card>
      </div>

      <Card>
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
              {MOCK_BOOKINGS.filter((b) => b.charges).map((b) => (
                <tr key={b.id} className="hover:bg-surface-subtle transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-brand-primary">
                    {b.booking_number}
                  </td>
                  <td className="px-4 py-3 font-medium text-text-primary">{b.customer_name}</td>
                  <td className="px-4 py-3 font-mono font-bold">
                    {formatPaiseToRupees(b.charges!.total)}
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
      </Card>
    </div>
  );
}
