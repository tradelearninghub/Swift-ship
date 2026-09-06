"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { BarChart3, Download, Calendar, Filter, FileSpreadsheet } from "lucide-react";

export default function AdminReportsPage() {
  const [reportType, setReportType] = useState("BOOKINGS");

  const reports = [
    { key: "BOOKINGS", label: "Booking Volume Report", desc: "Total bookings, source breakdown, approval conversion rates." },
    { key: "SHIPMENTS", label: "Shipment & Delivery Report", desc: "Transit speeds, on-time delivery percentages, SLA compliance." },
    { key: "COURIER", label: "Carrier Partner Performance", desc: "Comparative latency, weight disputes, delivery success rates by carrier." },
    { key: "COD", label: "COD Collection & Remittance", desc: "Cash collected at doorstep vs courier UTR batch reconciliations." },
    { key: "REVENUE", label: "Freight Revenue & Margins", desc: "Total customer shipping charges invoiced vs carrier cost estimates." },
    { key: "RTO", label: "RTO & Exception Analysis", desc: "Return-to-origin breakdown by failure reason and destination zone." },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Operational & Financial Reports</h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Export detailed multi-carrier logistics analytics, revenue summaries, and COD audits (§59).
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={() => alert("Downloading CSV export...")}>
          <Download className="w-4 h-4 mr-1.5" /> Export Current Report (CSV)
        </Button>
      </div>

      {/* Report Types Bar */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
        {reports.map((r) => (
          <button
            key={r.key}
            onClick={() => setReportType(r.key)}
            className={`p-3 rounded-xl border text-left text-xs transition-all ${
              reportType === r.key
                ? "bg-brand-primary text-white border-brand-primary font-bold shadow-sm"
                : "bg-surface-base border-border-default text-text-secondary hover:bg-surface-subtle"
            }`}
          >
            <div className="font-bold">{r.label}</div>
          </button>
        ))}
      </div>

      {/* Report Preview Canvas */}
      <Card className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border-default pb-4">
          <div>
            <h3 className="text-base font-bold text-text-primary">
              {reports.find((r) => r.key === reportType)?.label}
            </h3>
            <p className="text-xs text-text-secondary mt-0.5">
              {reports.find((r) => r.key === reportType)?.desc}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-text-muted">
            <Calendar className="w-3.5 h-3.5" /> Date Range: Last 30 Days
          </div>
        </div>

        {/* Mock Data Table Preview */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-subtle border-b border-border-default uppercase text-text-muted">
              <tr>
                <th className="px-4 py-2.5 font-semibold">Metric Dimension</th>
                <th className="px-4 py-2.5 font-semibold">Total Volume</th>
                <th className="px-4 py-2.5 font-semibold">Success Rate</th>
                <th className="px-4 py-2.5 font-semibold">Average TAT</th>
                <th className="px-4 py-2.5 font-semibold text-right">Revenue / Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-default">
              <tr className="hover:bg-surface-subtle">
                <td className="px-4 py-3 font-semibold text-text-primary">Delhivery Express</td>
                <td className="px-4 py-3 font-mono">1,420 parcels</td>
                <td className="px-4 py-3 text-emerald-700 font-bold">99.2%</td>
                <td className="px-4 py-3 font-mono">2.1 Days</td>
                <td className="px-4 py-3 text-right font-mono font-bold">₹2,84,000</td>
              </tr>
              <tr className="hover:bg-surface-subtle">
                <td className="px-4 py-3 font-semibold text-text-primary">Blue Dart Aviation</td>
                <td className="px-4 py-3 font-mono">890 parcels</td>
                <td className="px-4 py-3 text-emerald-700 font-bold">99.8%</td>
                <td className="px-4 py-3 font-mono">1.4 Days</td>
                <td className="px-4 py-3 text-right font-mono font-bold">₹1,95,800</td>
              </tr>
              <tr className="hover:bg-surface-subtle">
                <td className="px-4 py-3 font-semibold text-text-primary">DTDC Surface</td>
                <td className="px-4 py-3 font-mono">610 parcels</td>
                <td className="px-4 py-3 text-amber-700 font-bold">96.5%</td>
                <td className="px-4 py-3 font-mono">3.4 Days</td>
                <td className="px-4 py-3 text-right font-mono font-bold">₹91,500</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
