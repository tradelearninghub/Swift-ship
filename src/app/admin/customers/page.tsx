"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Search, Building2, User, Eye, Phone, Mail, Plus } from "lucide-react";

export default function AdminCustomersPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const customers = [
    {
      id: "cust-1",
      name: "Rahul Sharma",
      mobile: "9876543210",
      email: "rahul.sharma@example.com",
      account_type: "INDIVIDUAL",
      status: "ACTIVE",
      total_bookings: 8,
      total_spent_rupees: 1650,
      city: "Jaipur, Rajasthan",
      created_at: "2026-08-10",
    },
    {
      id: "cust-2",
      name: "Pooja Verma",
      mobile: "9823412345",
      email: "pooja.v@example.com",
      account_type: "INDIVIDUAL",
      status: "ACTIVE",
      total_bookings: 3,
      total_spent_rupees: 650,
      city: "Jaipur, Rajasthan",
      created_at: "2026-08-22",
    },
    {
      id: "cust-3",
      name: "Karan Johar Enterprises",
      mobile: "9876543210",
      email: "sales@kjenterprises.in",
      account_type: "BUSINESS",
      gstin: "08AAAAA0000A1Z5",
      status: "ACTIVE",
      total_bookings: 42,
      total_spent_rupees: 9400,
      city: "Jaipur, Rajasthan",
      created_at: "2026-07-15",
    },
  ];

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.mobile.includes(searchQuery) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Customer Accounts & CRM</h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Manage individual shippers and verified B2B business customer profiles (§17a).
          </p>
        </div>
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
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-subtle border-b border-border-default uppercase text-text-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">Customer Name</th>
                <th className="px-4 py-3 font-semibold">Account Type</th>
                <th className="px-4 py-3 font-semibold">Contact Info</th>
                <th className="px-4 py-3 font-semibold">City</th>
                <th className="px-4 py-3 font-semibold">Total Bookings</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-default">
              {filtered.map((c) => (
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
                    <div className="text-text-muted text-[11px]">{c.email}</div>
                  </td>
                  <td className="px-4 py-3 text-text-secondary">{c.city}</td>
                  <td className="px-4 py-3 font-mono font-bold text-text-primary">
                    {c.total_bookings} dispatches
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
      </Card>
    </div>
  );
}
