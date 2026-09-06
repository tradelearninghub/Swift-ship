import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Package, Truck, CheckCircle2, RotateCcw, Plus, ArrowRight } from "lucide-react";

export default function CustomerDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Welcome Back</h1>
          <p className="text-sm text-text-secondary">
            Manage your parcel bookings, monitor active dispatches, and track shipments in real-time.
          </p>
        </div>
        <Link href="/book">
          <Button variant="accent" size="md">
            <Plus className="w-4 h-4 mr-1.5" /> Book New Parcel
          </Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-muted uppercase">Total Bookings</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-brand-primary flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-text-primary mt-2">12</div>
          <div className="text-xs text-text-muted mt-1">All-time parcels</div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-muted uppercase">In Transit</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-brand-accent flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-text-primary mt-2">3</div>
          <div className="text-xs text-amber-600 mt-1 font-medium">Currently dispatched</div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-muted uppercase">Delivered</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-text-primary mt-2">8</div>
          <div className="text-xs text-emerald-600 mt-1 font-medium">Successfully received</div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-muted uppercase">RTO / Return</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <RotateCcw className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-text-primary mt-2">1</div>
          <div className="text-xs text-text-muted mt-1">Returned shipments</div>
        </Card>
      </div>

      {/* Recent Shipments */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Shipments</CardTitle>
            <p className="text-xs text-text-secondary mt-0.5">Your latest booked parcels and active tracking</p>
          </div>
          <Link href="/customer/bookings" className="text-xs font-semibold text-brand-primary hover:underline flex items-center gap-1">
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-subtle border-b border-border-default text-xs uppercase text-text-muted">
                <tr>
                  <th className="px-6 py-3 font-semibold">Booking ID</th>
                  <th className="px-6 py-3 font-semibold">Route</th>
                  <th className="px-6 py-3 font-semibold">Courier / AWB</th>
                  <th className="px-6 py-3 font-semibold">Payment</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                  <th className="px-6 py-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-default">
                <tr className="hover:bg-surface-subtle transition-colors">
                  <td className="px-6 py-4 font-mono font-medium text-brand-primary">BK-1025</td>
                  <td className="px-6 py-4">Jaipur → Mumbai</td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-text-primary">Delhivery</div>
                    <div className="text-xs font-mono text-text-muted">DEL98234123</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                      COD (₹2,000)
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status="IN_TRANSIT" />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href="/track?q=BK-1025">
                      <Button variant="outline" size="sm">Track</Button>
                    </Link>
                  </td>
                </tr>
                <tr className="hover:bg-surface-subtle transition-colors">
                  <td className="px-6 py-4 font-mono font-medium text-brand-primary">BK-1018</td>
                  <td className="px-6 py-4">Jaipur → Delhi</td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-text-primary">Blue Dart</div>
                    <div className="text-xs font-mono text-text-muted">BLU77491021</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      Prepaid
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status="DELIVERED" />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href="/track?q=BK-1018">
                      <Button variant="outline" size="sm">Track</Button>
                    </Link>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
