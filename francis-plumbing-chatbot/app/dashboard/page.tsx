"use client";

import { useEffect, useState } from "react";
import type { LeadRecord } from "@/lib/types";

function formatWhen(iso: string) {
  const date = new Date(iso);
  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();
  const time = date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  return sameDay ? `Today, ${time}` : `${date.toLocaleDateString()} ${time}`;
}

export default function DashboardPage() {
  const [leads, setLeads] = useState<LeadRecord[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/leads", { cache: "no-store" });
      if (!res.ok) throw new Error();
      const data = (await res.json()) as { leads: LeadRecord[] };
      setLeads(data.leads);
    } catch {
      setError("Couldn't load requests right now.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <div className="min-h-screen bg-francis-cream">
      <div className="bg-francis-green-dark px-4 sm:px-6 py-5">
        <div className="mx-auto max-w-4xl flex items-center justify-between">
          <div>
            <p className="font-heading font-extrabold text-francis-gold text-lg">francis</p>
            <p className="text-xs text-francis-gold-light/80">Internal demo — service requests</p>
          </div>
          <button
            onClick={() => void load()}
            className="rounded-full bg-francis-gold px-4 py-2 text-xs font-semibold text-francis-green-dark disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
        <h1 className="font-heading text-xl font-bold text-francis-green-dark mb-4">New Requests</h1>

        {error && <p className="text-sm text-francis-red">{error}</p>}

        {!error && leads && leads.length === 0 && (
          <p className="text-sm text-francis-text-muted">
            No requests yet — submit one through the chat widget to see it appear here.
          </p>
        )}

        <div className="space-y-3">
          {leads?.map((lead) => (
            <div
              key={lead.id}
              className="rounded-xl border border-francis-green-dark/10 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-francis-green-dark">{lead.name}</p>
                  <p className="text-sm text-francis-text-muted">{lead.service}</p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  {Boolean(lead.is_emergency) && (
                    <span className="rounded-full bg-francis-red/10 px-2.5 py-0.5 text-[11px] font-semibold text-francis-red">
                      Urgent
                    </span>
                  )}
                  <span className="rounded-full bg-francis-gold-light/30 px-2.5 py-0.5 text-[11px] font-medium text-francis-green-dark">
                    {lead.status}
                  </span>
                </div>
              </div>
              <p className="mt-2 text-sm text-francis-green-dark/80">{lead.description}</p>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-francis-text-muted">
                <span>Phone: {lead.phone ?? "Not provided"}</span>
                {lead.preferred_callback_time && <span>Callback: {lead.preferred_callback_time}</span>}
                <span>Submitted: {formatWhen(lead.created_at)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
