"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import {
  UserCheck,
  ShieldCheck,
  Plus,
  Check,
  X,
  Eye,
  EyeOff,
  User,
  Mail,
  Phone,
  Lock,
  Sliders,
  AlertCircle,
  Key,
  CheckCircle2,
  ShieldAlert,
} from "lucide-react";

interface StaffMember {
  id: string;
  name: string;
  email: string;
  mobile: string;
  role: "SUPER_ADMIN" | "ADMIN" | "STAFF" | string;
  status: "ACTIVE" | "DISABLED";
  last_login: string;
  overrides?: Record<string, boolean>;
}

// All Permission Keys from Feature Specification §50
const PERMISSION_GROUPS = [
  {
    group: "Bookings",
    permissions: [
      { key: "booking.view", label: "View Bookings", defaultRoles: ["SUPER_ADMIN", "ADMIN", "STAFF"] },
      { key: "booking.create", label: "Create Direct Consignments", defaultRoles: ["SUPER_ADMIN", "ADMIN", "STAFF"] },
      { key: "booking.edit", label: "Edit Booking Information", defaultRoles: ["SUPER_ADMIN", "ADMIN", "STAFF"] },
      { key: "booking.approve", label: "Verify Dimensions & Approve Rate", defaultRoles: ["SUPER_ADMIN", "ADMIN"] },
      { key: "booking.reject", label: "Reject Booking Requests", defaultRoles: ["SUPER_ADMIN", "ADMIN"] },
      { key: "booking.cancel", label: "Cancel Approved Bookings", defaultRoles: ["SUPER_ADMIN", "ADMIN"] },
    ],
  },
  {
    group: "Shipments & Couriers",
    permissions: [
      { key: "shipment.view", label: "View Active Shipments & Tracking", defaultRoles: ["SUPER_ADMIN", "ADMIN", "STAFF"] },
      { key: "shipment.process", label: "Generate AWB & Dispatch", defaultRoles: ["SUPER_ADMIN", "ADMIN", "STAFF"] },
      { key: "shipment.label", label: "Print & Download Thermal Labels", defaultRoles: ["SUPER_ADMIN", "ADMIN", "STAFF"] },
      { key: "shipment.cancel", label: "Void & Cancel Dispatches", defaultRoles: ["SUPER_ADMIN", "ADMIN"] },
      { key: "courier.view", label: "View Carrier Partners", defaultRoles: ["SUPER_ADMIN", "ADMIN"] },
      { key: "courier.manage", label: "Configure Adapters & API Keys", defaultRoles: ["SUPER_ADMIN"] },
    ],
  },
  {
    group: "Customers & Accounts",
    permissions: [
      { key: "customer.view", label: "View Customer Directory", defaultRoles: ["SUPER_ADMIN", "ADMIN", "STAFF"] },
      { key: "customer.create", label: "Register New Customers", defaultRoles: ["SUPER_ADMIN", "ADMIN", "STAFF"] },
      { key: "customer.edit", label: "Edit Customer Profiles & GST", defaultRoles: ["SUPER_ADMIN", "ADMIN"] },
    ],
  },
  {
    group: "Financials & Settlements",
    permissions: [
      { key: "cod.view", label: "View COD Collections", defaultRoles: ["SUPER_ADMIN", "ADMIN"] },
      { key: "cod.manage", label: "Reconcile Courier UTR Batches", defaultRoles: ["SUPER_ADMIN"] },
      { key: "payment.view", label: "View Shipping Charge Payments", defaultRoles: ["SUPER_ADMIN", "ADMIN"] },
      { key: "payment.manage", label: "Record Offline & Gateway Payments", defaultRoles: ["SUPER_ADMIN"] },
    ],
  },
  {
    group: "Communications & Reports",
    permissions: [
      { key: "notification.manage", label: "Manage Notification Templates & Logs", defaultRoles: ["SUPER_ADMIN"] },
      { key: "reports.view", label: "Generate Operations & Revenue Reports", defaultRoles: ["SUPER_ADMIN", "ADMIN"] },
      { key: "support.view", label: "View Customer Dispute Tickets", defaultRoles: ["SUPER_ADMIN", "ADMIN", "STAFF"] },
      { key: "support.manage", label: "Resolve & Reassign Tickets", defaultRoles: ["SUPER_ADMIN", "ADMIN"] },
    ],
  },
  {
    group: "System Administration",
    permissions: [
      { key: "settings.view", label: "View System & Profile Settings", defaultRoles: ["SUPER_ADMIN", "ADMIN"] },
      { key: "settings.manage", label: "Edit Company Profile & Gateways", defaultRoles: ["SUPER_ADMIN"] },
      { key: "users.manage", label: "Manage Staff, Roles & Overrides", defaultRoles: ["SUPER_ADMIN"] },
      { key: "roles.manage", label: "Define Custom System Roles", defaultRoles: ["SUPER_ADMIN"] },
    ],
  },
];

export default function AdminStaffPage() {
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Staff Modal State
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<"STAFF" | "ADMIN" | "SUPER_ADMIN">("STAFF");
  const [addError, setAddError] = useState("");
  const [savingNewStaff, setSavingNewStaff] = useState(false);

  // Permission Override Modal State
  const [overrideModalOpen, setOverrideModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [activeOverrides, setActiveOverrides] = useState<Record<string, boolean>>({});
  const [savingOverrides, setSavingOverrides] = useState(false);

  // Load staff list from API
  const loadStaff = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/staff");
      const data = await res.json();
      if (data.staff) {
        setStaffList(data.staff);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStaff();
  }, []);

  // Toggle Active/Inactive status (§3 Active/Inactive Toggle per staff member)
  const handleToggleStatus = async (staffId: string, currentStatus: "ACTIVE" | "DISABLED") => {
    const newStatus = currentStatus === "ACTIVE" ? "DISABLED" : "ACTIVE";

    // Optimistic UI update
    setStaffList((prev) =>
      prev.map((s) => (s.id === staffId ? { ...s, status: newStatus } : s))
    );

    try {
      await fetch(`/api/admin/staff/${staffId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch {
      // Rollback on failure
      loadStaff();
    }
  };

  // Open Overrides Grid Modal
  const openOverridesModal = (staff: StaffMember) => {
    setSelectedStaff(staff);
    setActiveOverrides(staff.overrides || {});
    setOverrideModalOpen(true);
  };

  // Toggle individual permission override
  const handleToggleOverride = (permKey: string, defaultValue: boolean) => {
    setActiveOverrides((prev) => {
      const current = prev[permKey];
      if (current === undefined) {
        // If not overridden yet, flip from default
        return { ...prev, [permKey]: !defaultValue };
      } else if (current !== defaultValue) {
        // If already set to non-default, reset back to inherit default (delete override)
        const updated = { ...prev };
        delete updated[permKey];
        return updated;
      } else {
        // If set to default, flip
        return { ...prev, [permKey]: !defaultValue };
      }
    });
  };

  // Save permission overrides
  const handleSaveOverrides = async () => {
    if (!selectedStaff) return;
    setSavingOverrides(true);

    try {
      await fetch(`/api/admin/staff/${selectedStaff.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ overrides: activeOverrides }),
      });

      setStaffList((prev) =>
        prev.map((s) =>
          s.id === selectedStaff.id ? { ...s, overrides: activeOverrides } : s
        )
      );
      setOverrideModalOpen(false);
    } catch {
      // Error handling
    } finally {
      setSavingOverrides(false);
    }
  };

  // Submit Add New Staff Form
  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError("");

    if (!name.trim() || !email.trim() || !mobile.trim() || !password) {
      setAddError("All fields are required.");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(mobile.trim())) {
      setAddError("Mobile number must be a valid 10-digit Indian number.");
      return;
    }

    if (password.length < 6) {
      setAddError("Password must be at least 6 characters.");
      return;
    }

    setSavingNewStaff(true);
    try {
      const res = await fetch("/api/admin/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          mobile: mobile.trim(),
          password,
          role,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setAddError(data.error || "Failed to create staff member.");
      } else {
        setStaffList((prev) => [data.staff, ...prev]);
        setAddModalOpen(false);
        // Reset
        setName("");
        setEmail("");
        setMobile("");
        setPassword("");
        setRole("STAFF");
      }
    } catch (err: any) {
      setAddError(err.message || "Failed to submit.");
    } finally {
      setSavingNewStaff(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Staff & Role Permissions (§48 & §50)</h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Manage operational team members, configure granular permission overrides, and enforce active server-side access control.
          </p>
        </div>

        <Button variant="accent" size="sm" onClick={() => setAddModalOpen(true)}>
          <Plus className="w-4 h-4 mr-1.5" /> Add New Staff Member
        </Button>
      </div>

      {/* Staff List Table Card */}
      <Card>
        <CardHeader className="py-4 bg-surface-subtle flex flex-row items-center justify-between border-b border-border-default">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-brand-primary" />
            <CardTitle className="text-sm font-bold text-text-primary">
              Operational Team Members ({staffList.length})
            </CardTitle>
          </div>
          <div className="text-[11px] text-text-muted">
            Strict server-side RBAC enforced (§53)
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-subtle border-b border-border-default uppercase text-text-muted">
                <tr>
                  <th className="px-5 py-3 font-semibold">Staff Member</th>
                  <th className="px-5 py-3 font-semibold">Contact Info</th>
                  <th className="px-5 py-3 font-semibold">Assigned Role</th>
                  <th className="px-5 py-3 font-semibold">Custom Overrides</th>
                  <th className="px-5 py-3 font-semibold text-center">Active Status (§48)</th>
                  <th className="px-5 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-default">
                {staffList.map((member) => {
                  const isActive = member.status === "ACTIVE";
                  const overrideCount = Object.keys(member.overrides || {}).length;

                  return (
                    <tr
                      key={member.id}
                      className={`hover:bg-surface-subtle transition-colors ${
                        !isActive ? "bg-slate-50/50 opacity-75" : ""
                      }`}
                    >
                      {/* Name & Avatar */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white text-xs ${
                              isActive ? "bg-slate-900" : "bg-slate-400"
                            }`}
                          >
                            {member.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-text-primary text-sm flex items-center gap-1.5">
                              {member.name}
                              {member.role === "SUPER_ADMIN" && (
                                <span className="text-[9px] font-bold uppercase bg-amber-100 text-amber-900 px-1 py-0.2 rounded border border-amber-300">
                                  Owner
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-text-muted">Last login: {member.last_login}</div>
                          </div>
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td className="px-5 py-3.5">
                        <div className="font-medium text-text-primary">{member.email}</div>
                        <div className="text-[11px] font-mono text-text-muted">{member.mobile}</div>
                      </td>

                      {/* Role Badge */}
                      <td className="px-5 py-3.5">
                        <span
                          className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${
                            member.role === "SUPER_ADMIN"
                              ? "bg-purple-50 text-purple-700 border-purple-200"
                              : member.role === "ADMIN"
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : "bg-slate-100 text-slate-700 border-slate-300"
                          }`}
                        >
                          {member.role.replace("_", " ")}
                        </span>
                      </td>

                      {/* Custom Overrides */}
                      <td className="px-5 py-3.5">
                        {overrideCount > 0 ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-primary bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                            <Sliders className="w-3 h-3" /> {overrideCount} custom override{overrideCount > 1 ? "s" : ""}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Role default</span>
                        )}
                      </td>

                      {/* Active / Inactive Toggle Switch (§3) */}
                      <td className="px-5 py-3.5 text-center">
                        <div className="inline-flex items-center gap-2">
                          <span className="text-[10px] font-bold text-text-muted">
                            {isActive ? "ACTIVE" : "OFF"}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(member.id, member.status)}
                            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-1 ${
                              isActive ? "bg-emerald-600" : "bg-slate-300"
                            }`}
                            role="switch"
                            aria-checked={isActive}
                          >
                            <span
                              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                                isActive ? "translate-x-4" : "translate-x-0"
                              }`}
                            />
                          </button>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openOverridesModal(member)}
                        >
                          <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                          Permissions & Overrides
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ============================================================== */}
      {/* 1. ADD NEW STAFF MODAL                                         */}
      {/* ============================================================== */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Add New Staff Member"
        description="Create a new administrative or operational team account. Permissions can be customized after creation."
        maxWidth="md"
      >
        <form onSubmit={handleAddStaff} className="space-y-4 text-xs">
          {addError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{addError}</span>
            </div>
          )}

          {/* Full Name */}
          <div className="space-y-1">
            <label className="font-semibold text-text-secondary">Full Name</label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. Rahul Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-8 pl-8 pr-3 bg-surface-subtle border border-border-default rounded-lg text-xs focus:border-brand-primary focus:outline-none"
              />
              <User className="w-3.5 h-3.5 text-text-muted absolute left-2.5 top-2.5" />
            </div>
          </div>

          {/* Email Address */}
          <div className="space-y-1">
            <label className="font-semibold text-text-secondary">Email Address (Login Username)</label>
            <div className="relative">
              <input
                type="email"
                placeholder="rahul@sscourierservice.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-8 pl-8 pr-3 bg-surface-subtle border border-border-default rounded-lg text-xs focus:border-brand-primary focus:outline-none"
              />
              <Mail className="w-3.5 h-3.5 text-text-muted absolute left-2.5 top-2.5" />
            </div>
          </div>

          {/* Mobile Number */}
          <div className="space-y-1">
            <label className="font-semibold text-text-secondary">10-Digit Mobile Number</label>
            <div className="relative">
              <input
                type="tel"
                placeholder="9829012345"
                maxLength={10}
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                className="w-full h-8 pl-8 pr-3 bg-surface-subtle border border-border-default rounded-lg text-xs font-mono focus:border-brand-primary focus:outline-none"
              />
              <Phone className="w-3.5 h-3.5 text-text-muted absolute left-2.5 top-2.5" />
            </div>
          </div>

          {/* Password with Eye Show/Hide Toggle */}
          <div className="space-y-1">
            <label className="font-semibold text-text-secondary">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-8 pl-8 pr-9 bg-surface-subtle border border-border-default rounded-lg text-xs focus:border-brand-primary focus:outline-none"
              />
              <Lock className="w-3.5 h-3.5 text-text-muted absolute left-2.5 top-2.5" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-2 text-text-muted hover:text-text-primary focus:outline-none"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Role Selection */}
          <div className="space-y-1">
            <label className="font-semibold text-text-secondary">Assign Base Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              className="w-full h-8 px-2.5 bg-surface-subtle border border-border-default rounded-lg text-xs focus:border-brand-primary focus:outline-none"
            >
              <option value="STAFF">STAFF — Bookings, Shipments & Customer View</option>
              <option value="ADMIN">ADMIN — Full Operations, Review, COD & Reports</option>
              <option value="SUPER_ADMIN">SUPER ADMIN — Complete System & Settings Control</option>
            </select>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border-default">
            <Button variant="outline" size="sm" type="button" onClick={() => setAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="accent" size="sm" type="submit" disabled={savingNewStaff}>
              {savingNewStaff ? "Creating Account..." : "Create Staff Account"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ============================================================== */}
      {/* 2. PERMISSION OVERRIDES GRID MODAL (§50)                       */}
      {/* ============================================================== */}
      {selectedStaff && (
        <Modal
          isOpen={overrideModalOpen}
          onClose={() => setOverrideModalOpen(false)}
          title={`Permission Overrides — ${selectedStaff.name}`}
          description={`Grant or deny individual capabilities beyond the ${selectedStaff.role} role default. Stored in staff_permission_overrides.`}
          maxWidth="4xl"
        >
          <div className="space-y-5 text-xs">
            {/* Header info badge */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
              <div>
                <span className="font-bold text-brand-primary">Base Role: {selectedStaff.role}</span>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Green checked = Explicitly Granted • Gray = Role Default • Red X = Explicitly Denied
                </p>
              </div>
              <span className="font-mono text-[11px] bg-white text-slate-700 px-2 py-1 rounded border border-blue-200">
                {Object.keys(activeOverrides).length} Active Overrides
              </span>
            </div>

            {/* Granular Permission Groups Grid */}
            <div className="max-h-[55vh] overflow-y-auto space-y-4 pr-1">
              {PERMISSION_GROUPS.map((grp) => (
                <div key={grp.group} className="border border-border-default rounded-xl overflow-hidden">
                  <div className="bg-surface-subtle px-4 py-2 font-bold text-text-primary text-xs uppercase tracking-wider border-b border-border-default">
                    {grp.group}
                  </div>
                  <div className="divide-y divide-border-default bg-white">
                    {grp.permissions.map((p) => {
                      const isDefaultGranted =
                        selectedStaff.role === "SUPER_ADMIN" ||
                        p.defaultRoles.includes(selectedStaff.role);

                      const overrideVal = activeOverrides[p.key];
                      const isOverridden = overrideVal !== undefined;
                      const effectiveGranted = isOverridden ? overrideVal : isDefaultGranted;

                      return (
                        <div
                          key={p.key}
                          className="px-4 py-2.5 flex items-center justify-between hover:bg-surface-subtle transition-colors"
                        >
                          <div>
                            <div className="font-semibold text-text-primary flex items-center gap-2">
                              {p.label}
                              {isOverridden && (
                                <span
                                  className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded ${
                                    overrideVal
                                      ? "bg-emerald-100 text-emerald-800"
                                      : "bg-rose-100 text-rose-800"
                                  }`}
                                >
                                  {overrideVal ? "Force Granted" : "Force Denied"}
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] font-mono text-text-muted">
                              {p.key} • (Default: {isDefaultGranted ? "Allowed" : "Restricted"})
                            </div>
                          </div>

                          {/* Override Controls */}
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleToggleOverride(p.key, isDefaultGranted)}
                              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all border ${
                                effectiveGranted
                                  ? "bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100"
                                  : "bg-rose-50 border-rose-300 text-rose-800 hover:bg-rose-100"
                              }`}
                            >
                              {effectiveGranted ? "✓ GRANTED" : "✕ DENIED"}
                            </button>

                            {isOverridden && (
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveOverrides((prev) => {
                                    const c = { ...prev };
                                    delete c[p.key];
                                    return c;
                                  });
                                }}
                                className="text-[10px] text-text-muted hover:text-text-primary px-1.5 py-1 underline"
                              >
                                Reset
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-border-default">
              <button
                type="button"
                onClick={() => setActiveOverrides({})}
                className="text-xs text-text-muted hover:text-text-primary underline"
              >
                Clear All Overrides
              </button>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setOverrideModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSaveOverrides}
                  disabled={savingOverrides}
                >
                  {savingOverrides ? "Saving..." : "Save Overrides to Database"}
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
