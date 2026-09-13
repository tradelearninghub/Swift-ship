"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Card } from "@/components/ui/Card";
import { StateView } from "@/components/ui/StateView";
import { Modal } from "@/components/ui/Modal";
import { Search, Building2, User, Eye, RefreshCw, Package, ExternalLink } from "lucide-react";
import { formatDateTimeIST } from "@/lib/datetime";
import { formatPaiseToRupees } from "@/lib/utils";

export default function AdminCustomersPage() {
  const [viewState, setViewState] = useState<"populated" | "loading" | "empty" | "error">("loading");
  const [customers, setCustomers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Customer History Modal State
  const [historyCustomer, setHistoryCustomer] = useState<any | null>(null);
  const [customerBookings, setCustomerBookings] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const openHistory = async (customer: any) => {
    setHistoryCustomer(customer);
    setLoadingHistory(true);
    setCustomerBookings([]);
    try {
      const res = await fetch(`/api/bookings?customer_id=${customer.id}&limit=50`);
      if (res.ok) {
        const data = await res.json();
        setCustomerBookings(data.bookings || []);
      }
    } catch (e) {
      console.error("Failed to fetch customer bookings", e);
    } finally {
      setLoadingHistory(false);
    }
  };

  const fetchCustomers = useCallback(async () => {
    setViewState("loading");
    try {
      const params = new URLSearchParams({ limit: "100" });
      if (searchQuery) params.set("q", searchQuery);

      const res = await fetch(`/api/admin/customers?${params}`);
      if (!res.ok) throw new Error("Failed to fetch customers");
      const data = await res.json();
      const list = data.customers || [];
      setCustomers(list);
      setViewState(list.length === 0 ? "empty" : "populated");
    } catch {
      setViewState("error");
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Customer Accounts & CRM</h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Manage individual shippers and verified B2B business customer profiles.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchCustomers}>
          <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Refresh
        </Button>
      </div>

      <Card className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="Search customer name, mobile, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-3 text-xs bg-surface-subtle border border-border-default rounded-lg focus:border-brand-primary focus:outline-none"
            />
            <Search className="w-4 h-4 text-text-muted absolute left-3 top-2.5" />
          </div>
        </div>
      </Card>

      <Card>
        <StateView
          state={viewState}
          emptyTitle="No customers found"
          emptyDescription="No registered customer accounts found in the database."
          onRetry={fetchCustomers}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-subtle border-b border-border-default uppercase text-text-muted">
                <tr>
                  <th className="px-4 py-3 font-semibold">Customer Name</th>
                  <th className="px-4 py-3 font-semibold">Account Type</th>
                  <th className="px-4 py-3 font-semibold">Contact Info</th>
                  <th className="px-4 py-3 font-semibold">Total Bookings</th>
                  <th className="px-4 py-3 font-semibold">Member Since</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-default">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-surface-subtle transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-bold text-text-primary">{c.name}</div>
                      {c.gstin && (
                        <div className="text-[10px] text-brand-primary font-mono font-semibold">
                          GSTIN: {c.gstin}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          c.account_type === "BUSINESS"
                            ? "bg-purple-50 text-purple-700 border border-purple-200"
                            : "bg-slate-100 text-slate-700 border border-slate-200"
                        }`}
                      >
                        {c.account_type === "BUSINESS" ? (
                          <Building2 className="w-3 h-3" />
                        ) : (
                          <User className="w-3 h-3" />
                        )}
                        {c.account_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 space-y-0.5">
                      <div className="font-mono text-text-primary">{c.mobile}</div>
                      <div className="text-text-muted text-[11px]">{c.email || "—"}</div>
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-text-primary">
                      {c._count?.bookings ?? 0} bookings
                    </td>
                    <td className="px-4 py-3 text-text-secondary">
                      {new Date(c.created_at).toLocaleDateString("en-IN")}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openHistory(c)}
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" /> View History
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </StateView>
      </Card>

      {/* Customer Booking History Modal */}
      <Modal
        isOpen={!!historyCustomer}
        onClose={() => setHistoryCustomer(null)}
        title={historyCustomer ? `Order History: ${historyCustomer.name}` : "Customer Order History"}
        maxWidth="xl"
      >
        <div className="space-y-4">
          {historyCustomer && (
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-surface-subtle border border-border-default rounded-xl text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-text-primary">Phone:</span>
                <span className="font-mono text-text-secondary">{historyCustomer.mobile}</span>
                {historyCustomer.email && (
                  <>
                    <span className="text-border-default">•</span>
                    <span className="text-text-muted">{historyCustomer.email}</span>
                  </>
                )}
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-primary/10 text-brand-primary uppercase">
                {historyCustomer.account_type} Account
              </span>
            </div>
          )}

          {loadingHistory ? (
            <div className="py-12 text-center text-xs text-text-muted">
              <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-brand-primary" />
              Loading booking history...
            </div>
          ) : customerBookings.length === 0 ? (
            <div className="py-12 text-center text-xs text-text-muted">
              <Package className="w-8 h-8 mx-auto mb-2 text-text-muted/60" />
              <p className="font-semibold text-text-primary">No bookings found</p>
              <p className="mt-0.5">This customer has no recorded parcel bookings yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto max-h-[60vh]">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-subtle border-b border-border-default uppercase text-text-muted sticky top-0">
                  <tr>
                    <th className="px-3 py-2 font-semibold">Booking / Date</th>
                    <th className="px-3 py-2 font-semibold">Destination</th>
                    <th className="px-3 py-2 font-semibold">Courier / AWB</th>
                    <th className="px-3 py-2 font-semibold">Amount / Mode</th>
                    <th className="px-3 py-2 font-semibold">Status</th>
                    <th className="px-3 py-2 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-default">
                  {customerBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-surface-subtle transition-colors">
                      <td className="px-3 py-2.5">
                        <div className="font-mono font-bold text-brand-primary">
                          {b.booking_number}
                        </div>
                        <div className="text-[10px] text-text-muted">
                          {formatDateTimeIST(b.created_at)}
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="font-medium text-text-primary">{b.receiver_name}</div>
                        <div className="text-[10px] text-text-secondary">
                          {b.receiver_city}, {b.receiver_state}
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        {b.shipment ? (
                          <div>
                            <div className="font-mono font-semibold text-text-primary">
                              {b.shipment.awb || "Pending AWB"}
                            </div>
                            <div className="text-[10px] text-text-secondary">
                              {b.shipment.courier_partner?.name || "In-House"}
                            </div>
                          </div>
                        ) : (
                          <span className="text-[10px] text-text-muted">Unassigned</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="font-bold text-text-primary">
                          {b.final_total_paise
                            ? formatPaiseToRupees(b.final_total_paise)
                            : b.estimated_total_paise
                            ? formatPaiseToRupees(b.estimated_total_paise)
                            : "₹0"}
                        </div>
                        <div className="text-[10px] text-text-muted">
                          {b.payment_type || "PREPAID"}
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        <StatusBadge status={b.status} />
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <Link
                          href={`/track/${b.shipment?.awb || b.booking_number}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 text-[11px] text-brand-primary hover:underline font-medium"
                        >
                          Track <ExternalLink className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
