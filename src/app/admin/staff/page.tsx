"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { UserCheck, ShieldCheck, Plus, Check, X } from "lucide-react";

export default function AdminStaffPage() {
  const staffMembers = [
    {
      id: "usr-1",
      name: "Sanjay Singhania",
      email: "sanjay@swiftship.com",
      role: "SUPER_ADMIN",
      status: "ACTIVE",
      last_login: "Today 11:20 AM",
    },
    {
      id: "usr-2",
      name: "Vikram Rathore",
      email: "vikram.r@swiftship.com",
      role: "ADMIN",
      status: "ACTIVE",
      last_login: "Today 09:45 AM",
    },
    {
      id: "usr-3",
      name: "Neha Joshi",
      email: "neha.j@swiftship.com",
      role: "STAFF",
      status: "ACTIVE",
      last_login: "Yesterday",
    },
  ];

  const permissions = [
    { key: "booking.view", label: "View Bookings" },
    { key: "booking.create", label: "Create Direct Bookings" },
    { key: "booking.approve", label: "Review & Rate Bookings" },
    { key: "shipment.process", label: "Generate AWB / Dispatch" },
    { key: "courier.manage", label: "Manage Couriers & APIs" },
    { key: "cod.manage", label: "Reconcile COD Batches" },
    { key: "settings.manage", label: "Edit System Settings" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Staff & Role Permissions</h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Manage operational team members and enforce granular role-based access control (§50).
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Staff Members List */}
        <div className="lg:col-span-5 space-y-4">
          <Card>
            <CardHeader className="py-3 bg-surface-subtle">
              <CardTitle className="text-xs uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-brand-primary" /> Active Team Members
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border-default text-xs">
                {staffMembers.map((member) => (
                  <div key={member.id} className="p-4 space-y-1 hover:bg-surface-subtle cursor-pointer transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-text-primary">{member.name}</div>
                      <span className="text-[10px] font-mono font-bold uppercase bg-blue-50 text-brand-primary px-2 py-0.5 rounded border border-blue-200">
                        {member.role.replace("_", " ")}
                      </span>
                    </div>
                    <div className="text-text-muted">{member.email}</div>
                    <div className="text-[11px] text-text-secondary pt-1 flex items-center justify-between">
                      <span>Last Login: {member.last_login}</span>
                      <StatusBadge status={member.status} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Granular Permission Matrix Grid (§50) */}
        <div className="lg:col-span-7">
          <Card>
            <CardHeader className="py-3 bg-surface-subtle flex flex-row items-center justify-between">
              <CardTitle className="text-xs uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Permission Matrix by Role (§50)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface-subtle border-b border-border-default uppercase text-text-muted">
                    <tr>
                      <th className="px-4 py-2.5 font-semibold">Permission Key</th>
                      <th className="px-4 py-2.5 font-semibold text-center">Super Admin</th>
                      <th className="px-4 py-2.5 font-semibold text-center">Admin</th>
                      <th className="px-4 py-2.5 font-semibold text-center">Staff</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-default">
                    {permissions.map((p, idx) => (
                      <tr key={p.key} className="hover:bg-surface-subtle transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-semibold text-text-primary">{p.label}</div>
                          <div className="text-[10px] font-mono text-text-muted">{p.key}</div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                        </td>
                        <td className="px-4 py-3 text-center">
                          {idx === 4 || idx === 6 ? (
                            <X className="w-4 h-4 text-slate-300 mx-auto" />
                          ) : (
                            <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {idx < 3 ? (
                            <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                          ) : (
                            <X className="w-4 h-4 text-slate-300 mx-auto" />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
