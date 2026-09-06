import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import {
  Package,
  Clock,
  Truck,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  DollarSign,
  ArrowRight,
  Plus,
} from "lucide-react";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Action Required Banner / Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Operations Overview</h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Monitor real-time booking queue, courier API status, and daily logistics workflow.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/bookings/new">
            <Button variant="primary" size="sm">
              <Plus className="w-4 h-4 mr-1" /> New Booking (Staff)
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <Card className="p-3">
          <div className="text-[11px] font-semibold text-text-muted uppercase">Today&apos;s Bookings</div>
          <div className="text-xl font-bold text-text-primary mt-1">24</div>
        </Card>
        <Card className="p-3 border-amber-200 bg-amber-50/50">
          <div className="text-[11px] font-semibold text-amber-700 uppercase">New Requests</div>
          <div className="text-xl font-bold text-amber-700 mt-1">6</div>
        </Card>
        <Card className="p-3">
          <div className="text-[11px] font-semibold text-text-muted uppercase">Processing</div>
          <div className="text-xl font-bold text-blue-700 mt-1">14</div>
        </Card>
        <Card className="p-3">
          <div className="text-[11px] font-semibold text-text-muted uppercase">In Transit</div>
          <div className="text-xl font-bold text-blue-700 mt-1">42</div>
        </Card>
        <Card className="p-3">
          <div className="text-[11px] font-semibold text-text-muted uppercase">Delivered</div>
          <div className="text-xl font-bold text-emerald-700 mt-1">128</div>
        </Card>
        <Card className="p-3">
          <div className="text-[11px] font-semibold text-text-muted uppercase">RTO / Returns</div>
          <div className="text-xl font-bold text-rose-700 mt-1">3</div>
        </Card>
        <Card className="p-3">
          <div className="text-[11px] font-semibold text-text-muted uppercase">COD Pending</div>
          <div className="text-xl font-bold text-slate-800 mt-1">₹45,200</div>
        </Card>
        <Card className="p-3">
          <div className="text-[11px] font-semibold text-text-muted uppercase">COD Settled</div>
          <div className="text-xl font-bold text-emerald-700 mt-1">₹1,82,400</div>
        </Card>
      </div>

      {/* Action Required Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between py-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600" />
                <CardTitle className="text-sm">Pending Review Queue (Customer Requests)</CardTitle>
              </div>
              <Link href="/admin/bookings?status=REQUESTED" className="text-xs text-brand-primary font-medium hover:underline">
                View All
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface-subtle border-b border-border-default uppercase text-text-muted">
                    <tr>
                      <th className="px-4 py-2.5 font-semibold">Booking ID</th>
                      <th className="px-4 py-2.5 font-semibold">Customer</th>
                      <th className="px-4 py-2.5 font-semibold">Route</th>
                      <th className="px-4 py-2.5 font-semibold">Declared Weight</th>
                      <th className="px-4 py-2.5 font-semibold">Type</th>
                      <th className="px-4 py-2.5 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-default">
                    <tr className="hover:bg-surface-subtle transition-colors">
                      <td className="px-4 py-3 font-mono font-medium text-brand-primary">BK-1031</td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-text-primary">Rahul Sharma</div>
                        <div className="text-[11px] text-text-muted">9876543210</div>
                      </td>
                      <td className="px-4 py-3">Jaipur (302022) → Bengaluru (560001)</td>
                      <td className="px-4 py-3">2.50 kg (L25 W20 H15)</td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
                          COD ₹3,500
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link href="/admin/bookings/BK-1031/review">
                          <Button variant="accent" size="sm">Review & Rate</Button>
                        </Link>
                      </td>
                    </tr>
                    <tr className="hover:bg-surface-subtle transition-colors">
                      <td className="px-4 py-3 font-mono font-medium text-brand-primary">BK-1030</td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-text-primary">Pooja Verma</div>
                        <div className="text-[11px] text-text-muted">9823412345</div>
                      </td>
                      <td className="px-4 py-3">Jaipur (302001) → Delhi (110001)</td>
                      <td className="px-4 py-3">0.80 kg (L15 W10 H5)</td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[11px]">
                          Prepaid
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link href="/admin/bookings/BK-1030/review">
                          <Button variant="accent" size="sm">Review & Rate</Button>
                        </Link>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System & Courier Status */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm">Courier Partner Status</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="font-semibold text-text-primary">Delhivery</span>
                </div>
                <span className="text-[11px] text-emerald-700 font-medium">API Active • 99.8%</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="font-semibold text-text-primary">DTDC Express</span>
                </div>
                <span className="text-[11px] text-emerald-700 font-medium">API Active • 99.2%</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="font-semibold text-text-primary">Blue Dart</span>
                </div>
                <span className="text-[11px] text-emerald-700 font-medium">API Active • 98.9%</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-slate-400" />
                  <span className="font-semibold text-text-primary">XpressBees</span>
                </div>
                <span className="text-[11px] text-slate-500 font-medium">Manual Fallback</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
