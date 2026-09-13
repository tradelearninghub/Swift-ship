"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { StateView } from "@/components/ui/StateView";
import {
  LifeBuoy,
  Eye,
  RefreshCw,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  MessageSquare,
  User,
  Phone,
  Mail,
} from "lucide-react";

export default function AdminSupportPage() {
  const [viewState, setViewState] = useState<"populated" | "loading" | "empty" | "error">("loading");
  const [tickets, setTickets] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [newStatus, setNewStatus] = useState("IN_PROGRESS");
  const [adminNote, setAdminNote] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const fetchTickets = useCallback(async () => {
    setViewState("loading");
    try {
      const url = statusFilter === "ALL" ? "/api/admin/support" : `/api/admin/support?status=${statusFilter}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to load tickets");
      const data = await res.json();
      const list = data.tickets || [];
      setTickets(list);
      setViewState(list.length === 0 ? "empty" : "populated");
    } catch {
      setViewState("error");
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleOpenTicket = (t: any) => {
    setSelectedTicket(t);
    setNewStatus(t.status || "OPEN");
    setAdminNote("");
    setActionError(null);
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;

    setIsUpdating(true);
    setActionError(null);

    try {
      const res = await fetch("/api/admin/support", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedTicket.id,
          status: newStatus,
          note: adminNote.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update ticket status");
      }

      setSelectedTicket(null);
      fetchTickets();
    } catch (err: any) {
      setActionError(err.message || "Network error while updating ticket");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteTicket = async (id: string) => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/admin/support?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete ticket");
      setDeleteConfirmId(null);
      if (selectedTicket?.id === id) setSelectedTicket(null);
      fetchTickets();
    } catch (err: any) {
      alert(err.message || "Failed to delete ticket");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Support & Contact Inquiries</h1>
          <p className="text-xs text-text-secondary mt-0.5">
            View customer messages, website contact inquiries, dispute tickets, and manage resolutions.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchTickets}>
          <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Refresh
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 text-xs font-semibold">
        {[
          { key: "ALL", label: "All Tickets" },
          { key: "OPEN", label: "Open / New" },
          { key: "IN_PROGRESS", label: "In Progress" },
          { key: "RESOLVED", label: "Resolved" },
          { key: "CLOSED", label: "Closed" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              statusFilter === tab.key
                ? "bg-brand-primary text-white font-bold shadow-sm"
                : "bg-surface-base text-text-secondary hover:text-text-primary border border-border-default"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <Card>
        <StateView
          state={viewState}
          emptyTitle="No support tickets found"
          emptyDescription="No customer inquiries or support tickets match the selected status."
          onRetry={fetchTickets}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-subtle border-b border-border-default uppercase text-text-muted">
                <tr>
                  <th className="px-4 py-3 font-semibold">Ticket ID</th>
                  <th className="px-4 py-3 font-semibold">Issue Category</th>
                  <th className="px-4 py-3 font-semibold">Subject & Message</th>
                  <th className="px-4 py-3 font-semibold">Raised By / Contact</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-default">
                {tickets.map((t) => (
                  <tr key={t.id} className="hover:bg-surface-subtle transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-brand-primary">
                      {t.ticket_number || `TKT-${t.id.slice(0, 8).toUpperCase()}`}
                    </td>
                    <td className="px-4 py-3">
                      <span className="bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded font-bold text-[10px] uppercase">
                        {(t.category || t.type || "Inquiry").replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 max-w-sm">
                      <div className="font-bold text-text-primary">{t.subject}</div>
                      <div className="text-[11px] text-text-secondary truncate mt-0.5">
                        {t.description}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-text-primary">
                        {t.raised_by_name || t.raiser?.name || "Website Guest"}
                      </div>
                      <div className="text-[11px] text-text-muted font-mono">
                        {t.raised_by_mobile || t.raiser?.mobile || t.raised_by_email || "—"}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-text-muted whitespace-nowrap">
                      {new Date(t.created_at).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={t.status} />
                    </td>
                    <td className="px-4 py-3 text-right space-x-1 whitespace-nowrap">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenTicket(t)}
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" /> View & Update
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-rose-600 hover:bg-rose-50"
                        onClick={() => setDeleteConfirmId(t.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </StateView>
      </Card>

      {/* Ticket Details & Update Modal */}
      {selectedTicket && (
        <Modal
          isOpen={!!selectedTicket}
          onClose={() => setSelectedTicket(null)}
          title={`Ticket ${selectedTicket.ticket_number || selectedTicket.id.slice(0, 8).toUpperCase()}`}
          description="View full inquiry details and update resolution status"
          maxWidth="md"
        >
          <form onSubmit={handleUpdateStatus} className="space-y-4 pt-2">
            {actionError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            {/* Sender / Contact Card */}
            <div className="p-3 bg-surface-subtle border border-border-default rounded-xl space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <div className="font-bold text-text-primary flex items-center gap-1.5">
                  <User className="w-4 h-4 text-brand-primary" />
                  {selectedTicket.raised_by_name || selectedTicket.raiser?.name || "Customer / Guest"}
                </div>
                <StatusBadge status={selectedTicket.status} />
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-text-muted">
                {selectedTicket.raised_by_email && (
                  <span className="flex items-center gap-1">
                    <Mail className="w-3 h-3 text-slate-400" />
                    <a href={`mailto:${selectedTicket.raised_by_email}`} className="hover:underline text-brand-primary">
                      {selectedTicket.raised_by_email}
                    </a>
                  </span>
                )}
                {selectedTicket.raised_by_mobile && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <a href={`tel:${selectedTicket.raised_by_mobile}`} className="hover:underline text-brand-primary">
                      +91 {selectedTicket.raised_by_mobile}
                    </a>
                  </span>
                )}
              </div>
            </div>

            {/* Inquiry Content */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-text-primary">Subject:</label>
              <div className="p-2.5 bg-surface-base border border-border-default rounded-lg text-xs font-semibold text-text-primary">
                {selectedTicket.subject}
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-text-primary">Full Message Content:</label>
              <div className="p-3 bg-surface-base border border-border-default rounded-lg text-xs text-text-secondary whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                {selectedTicket.description}
              </div>
            </div>

            {/* Status Selector */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-text-primary">Update Status:</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full h-9 px-3 text-xs bg-surface-base border border-border-default rounded-lg focus:ring-1 focus:ring-brand-primary font-medium"
              >
                <option value="OPEN">OPEN (Unresolved)</option>
                <option value="IN_PROGRESS">IN PROGRESS (Under Investigation)</option>
                <option value="RESOLVED">RESOLVED (Action Completed)</option>
                <option value="CLOSED">CLOSED (Archived)</option>
              </select>
            </div>

            {/* Admin Note */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-text-primary">
                Internal Staff Note (Optional):
              </label>
              <textarea
                rows={2}
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="Add internal resolution comments or response notes..."
                className="w-full px-3 py-2 text-xs bg-surface-base border border-border-default rounded-lg focus:ring-1 focus:ring-brand-primary"
              />
            </div>

            {/* Existing Notes Timeline if any */}
            {selectedTicket.notes && selectedTicket.notes.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-border-default">
                <span className="text-xs font-bold text-text-primary">Resolution Activity:</span>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {selectedTicket.notes.map((n: any) => (
                    <div key={n.id} className="p-2 bg-slate-50 border border-slate-200 rounded text-xs">
                      <div className="flex justify-between text-[10px] text-text-muted">
                        <span className="font-semibold text-text-primary">{n.author?.name || "Staff"}</span>
                        <span>{new Date(n.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                      <p className="mt-1 text-slate-700">{n.note}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex justify-end gap-2 pt-3 border-t border-border-default">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSelectedTicket(null)}
                disabled={isUpdating}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isUpdating}
              >
                Save Status & Notes
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <Modal
          isOpen={!!deleteConfirmId}
          onClose={() => setDeleteConfirmId(null)}
          title="Delete Support Ticket"
          description="Are you sure you want to permanently remove this ticket?"
          maxWidth="sm"
        >
          <div className="space-y-4 pt-2">
            <p className="text-xs text-text-secondary leading-relaxed">
              This action cannot be undone. The ticket and its associated resolution notes will be deleted from the database.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteConfirmId(null)}
                disabled={isUpdating}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleDeleteTicket(deleteConfirmId)}
                isLoading={isUpdating}
              >
                Confirm Delete
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
