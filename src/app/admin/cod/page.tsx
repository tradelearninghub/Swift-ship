"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { MOCK_COD_SETTLEMENTS, MOCK_BOOKINGS } from "@/lib/mockData";
import { formatPaiseToRupees } from "@/lib/utils";
import { DollarSign, Layers, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";

export default function AdminCodPage() {
  const codBookings = MOCK_BOOKINGS.filter((b) => b.payment_type === "COD");

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Cash on Delivery (COD) Settlements</h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Track doorstep cash collections, carrier remittance UTRs, and batch discrepancy reconciliation (§35).
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="text-xs text-text-muted font-bold uppercase">Total COD Dispatched</div>
          <div className="text-2xl font-bold text-text-primary mt-1">₹5,50,000</div>
          <div className="text-xs text-text-secondary mt-1">Across all active COD bookings</div>
        </Card>

        <Card className="p-4 border-amber-200 bg-amber-50/40">
          <div className="text-xs text-amber-800 font-bold uppercase">Pending Courier Remittance</div>
          <div className="text-2xl font-bold text-amber-800 mt-1">₹45,200</div>
          <div className="text-xs text-amber-700 mt-1">Awaiting UTR settlement batch</div>
        </Card>

        <Card className="p-4 border-emerald-200 bg-emerald-50/40">
          <div className="text-xs text-emerald-800 font-bold uppercase">Reconciled & Paid Out</div>
          <div className="text-2xl font-bold text-emerald-800 mt-1">₹5,04,800</div>
          <div className="text-xs text-emerald-700 mt-1">100% matched with bank statements</div>
        </Card>
      </div>

      {/* Weekly Settlement Batches (§35 Improvement) */}
      <Card>
        <CardHeader className="py-3 bg-surface-subtle">
          <CardTitle className="text-xs uppercase tracking-wider text-text-muted flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-brand-primary" /> Carrier Remittance Batches & UTR References (§35)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-subtle border-b border-border-default uppercase text-text-muted">
                <tr>
                  <th className="px-4 py-3 font-semibold">Courier Partner</th>
                  <th className="px-4 py-3 font-semibold">UTR Reference</th>
                  <th className="px-4 py-3 font-semibold">Reported Amount</th>
                  <th className="px-4 py-3 font-semibold">Reconciled Amount</th>
                  <th className="px-4 py-3 font-semibold">Transactions</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-default">
                {MOCK_COD_SETTLEMENTS.map((batch) => (
                  <tr key={batch.id} className="hover:bg-surface-subtle transition-colors">
                    <td className="px-4 py-3 font-bold text-text-primary">
                      {batch.courier_partner_name}
                    </td>
                    <td className="px-4 py-3 font-mono font-semibold text-brand-primary">
                      {batch.reference_utr}
                    </td>
                    <td className="px-4 py-3 font-mono font-bold">
                      {formatPaiseToRupees(batch.total_amount)}
                    </td>
                    <td className="px-4 py-3 font-mono">
                      {formatPaiseToRupees(batch.reconciled_amount)}
                    </td>
                    <td className="px-4 py-3">{batch.transaction_count} shipments</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          batch.status === "RECONCILED"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                      >
                        {batch.status === "RECONCILED" ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <AlertTriangle className="w-3 h-3" />
                        )}
                        {batch.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="outline" size="sm">
                        Audit Batch <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
