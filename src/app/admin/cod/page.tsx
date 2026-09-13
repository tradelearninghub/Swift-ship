"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { StateView } from "@/components/ui/StateView";
import { formatPaiseToRupees } from "@/lib/utils";
import { DollarSign, Layers, CheckCircle2, AlertTriangle, ArrowRight, RefreshCw } from "lucide-react";

export default function AdminCodPage() {
  const [viewState, setViewState] = useState<"populated" | "loading" | "empty" | "error">("loading");
  const [totals, setTotals] = useState({
    total_cod_dispatched: 0,
    pending_remittance: 0,
    reconciled_paid: 0,
    total_cod_bookings: 0,
  });
  const [batches, setBatches] = useState<any[]>([]);

  const fetchCod = useCallback(async () => {
    setViewState("loading");
    try {
      const res = await fetch("/api/admin/cod");
      if (!res.ok) throw new Error("Failed to fetch COD data");
      const data = await res.json();
      setTotals(data.totals || {});
      const list = data.batches || [];
      setBatches(list);
      setViewState(list.length === 0 ? "empty" : "populated");
    } catch {
      setViewState("error");
    }
  }, []);

  useEffect(() => {
    fetchCod();
  }, [fetchCod]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Cash on Delivery (COD) Settlements</h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Track doorstep cash collections, carrier remittance UTRs, and batch discrepancy reconciliation.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchCod}>
          <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Refresh
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="text-xs text-text-muted font-bold uppercase">Total COD Dispatched</div>
          <div className="text-2xl font-bold text-text-primary mt-1">
            {formatPaiseToRupees(totals.total_cod_dispatched)}
          </div>
          <div className="text-xs text-text-secondary mt-1">
            Across {totals.total_cod_bookings} COD bookings
          </div>
        </Card>

        <Card className="p-4 border-amber-200 bg-amber-50/40">
          <div className="text-xs text-amber-800 font-bold uppercase">Pending Courier Remittance</div>
          <div className="text-2xl font-bold text-amber-800 mt-1">
            {formatPaiseToRupees(totals.pending_remittance)}
          </div>
          <div className="text-xs text-amber-700 mt-1">Awaiting UTR settlement batch</div>
        </Card>

        <Card className="p-4 border-emerald-200 bg-emerald-50/40">
          <div className="text-xs text-emerald-800 font-bold uppercase">Reconciled & Paid Out</div>
          <div className="text-2xl font-bold text-emerald-800 mt-1">
            {formatPaiseToRupees(totals.reconciled_paid)}
          </div>
          <div className="text-xs text-emerald-700 mt-1">Matched with bank statements</div>
        </Card>
      </div>

      {/* Settlement Batches */}
      <Card>
        <CardHeader className="py-3 bg-surface-subtle">
          <CardTitle className="text-xs uppercase tracking-wider text-text-muted flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-brand-primary" /> Carrier Remittance Batches & UTR References
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <StateView
            state={viewState}
            emptyTitle="No settlement batches"
            emptyDescription="No COD settlement batches have been recorded yet."
            onRetry={fetchCod}
          >
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
                  {batches.map((batch) => (
                    <tr key={batch.id} className="hover:bg-surface-subtle transition-colors">
                      <td className="px-4 py-3 font-bold text-text-primary">
                        {batch.courier_partner?.name || "Unknown"}
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
                      <td className="px-4 py-3">
                        {batch._count?.cod_transactions ?? 0} shipments
                      </td>
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
          </StateView>
        </CardContent>
      </Card>
    </div>
  );
}
