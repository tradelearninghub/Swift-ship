"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Card } from "@/components/ui/Card";
import { StateView } from "@/components/ui/StateView";
import { Search, Building2, User, Eye, RefreshCw } from "lucide-react";

export default function AdminCustomersPage() {
  const [viewState, setViewState] = useState<"populated" | "loading" | "empty" | "error">("loading");
  const [customers, setCustomers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

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
                      <Button variant="outline" size="sm">
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
    </div>
  );
}
