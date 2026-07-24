"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Trash2, Users, Mail, Phone, Briefcase, Calendar } from "lucide-react";
import { Lead } from "@/lib/schema";

const SERVICE_COLORS: Record<string, string> = {
  "Web Development": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  SaaS: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  "E-commerce": "bg-green-500/10 text-green-400 border-green-500/20",
  Other: "bg-slate-500/10 text-slate-400 border-slate-500/20",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function LeadsTable({ initialLeads }: { initialLeads: Lead[] }) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null); // lead id
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);
  const [loading, setLoading] = useState<string | null>(null); // "all" | lead id

  async function handleDelete(id: string) {
    setLoading(id);
    try {
      const res = await fetch(`/api/leads/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      setLeads((prev) => prev.filter((l) => l.id !== id));
      toast.success("Lead deleted");
    } catch {
      toast.error("Failed to delete lead");
    } finally {
      setLoading(null);
      setConfirmDelete(null);
    }
  }

  async function handleDeleteAll() {
    setLoading("all");
    try {
      const res = await fetch("/api/leads", { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      setLeads([]);
      toast.success("All leads deleted");
    } catch {
      toast.error("Failed to delete leads");
    } finally {
      setLoading(null);
      setConfirmDeleteAll(false);
    }
  }

  return (
    <>
      {/* Confirmation modals */}
      {confirmDelete && (
        <Modal
          message="Are you sure you want to delete this lead?"
          onConfirm={() => handleDelete(confirmDelete)}
          onCancel={() => setConfirmDelete(null)}
          loading={loading === confirmDelete}
        />
      )}
      {confirmDeleteAll && (
        <Modal
          message="This will delete ALL leads permanently. Are you sure?"
          onConfirm={handleDeleteAll}
          onCancel={() => setConfirmDeleteAll(false)}
          loading={loading === "all"}
          danger
        />
      )}

      {leads.length === 0 ? (
        <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-16 text-center">
          <Users className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 font-medium">No leads yet</p>
          <p className="text-slate-600 text-sm mt-1">Submit the contact form to see leads here</p>
        </div>
      ) : (
        <div className="bg-slate-900/40 border border-white/5 rounded-2xl overflow-hidden">
          {/* Delete All button */}
          <div className="flex justify-end px-6 py-3 border-b border-white/5">
            <button
              onClick={() => setConfirmDeleteAll(true)}
              className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/40 bg-red-500/5 hover:bg-red-500/10 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete All Leads
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5 bg-slate-900/60">
                  <th className="text-left px-6 py-4 text-xs text-slate-400 font-semibold uppercase tracking-wider">
                    <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> Name</span>
                  </th>
                  <th className="text-left px-6 py-4 text-xs text-slate-400 font-semibold uppercase tracking-wider">
                    <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> Email</span>
                  </th>
                  <th className="text-left px-6 py-4 text-xs text-slate-400 font-semibold uppercase tracking-wider">
                    <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> WhatsApp</span>
                  </th>
                  <th className="text-left px-6 py-4 text-xs text-slate-400 font-semibold uppercase tracking-wider">
                    <span className="flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5" /> Service</span>
                  </th>
                  <th className="text-left px-6 py-4 text-xs text-slate-400 font-semibold uppercase tracking-wider">Message</th>
                  <th className="text-left px-6 py-4 text-xs text-slate-400 font-semibold uppercase tracking-wider">
                    <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Date</span>
                  </th>
                  <th className="px-6 py-4" />
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {[...leads].reverse().map((lead) => (
                  <tr key={lead.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-white font-medium">{lead.fullName}</span>
                    </td>
                    <td className="px-6 py-4">
                      <a href={`mailto:${lead.email}`} className="text-indigo-400 hover:text-indigo-300 transition-colors text-sm">
                        {lead.email}
                      </a>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-300 text-sm font-mono">{lead.whatsapp}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${SERVICE_COLORS[lead.service] ?? SERVICE_COLORS["Other"]}`}>
                        {lead.service}
                      </span>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <p className="text-slate-400 text-sm truncate" title={lead.message}>{lead.message}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-500 text-xs whitespace-nowrap">{formatDate(lead.createdAt)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setConfirmDelete(lead.id)}
                        disabled={loading === lead.id}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-40"
                        title="Delete lead"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}

function Modal({
  message,
  onConfirm,
  onCancel,
  loading,
  danger = false,
}: {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
  danger?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
        <p className="text-white text-sm mb-6 leading-relaxed">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm text-slate-400 hover:text-white border border-white/10 hover:border-white/20 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-60 ${
              danger
                ? "bg-red-600 hover:bg-red-500 text-white"
                : "bg-red-600 hover:bg-red-500 text-white"
            }`}
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
