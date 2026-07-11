import Image from "next/image";
import { Toaster } from "sonner";
import { getAllLeads } from "@/lib/leads-db";
import { Lead } from "@/lib/schema";
import LeadsTable from "@/components/LeadsTable";
import { Users, Briefcase, TrendingUp } from "lucide-react";

const SERVICE_COLORS: Record<string, string> = {
  "Web Development": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  SaaS: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  "E-commerce": "bg-green-500/10 text-green-400 border-green-500/20",
  Other: "bg-slate-500/10 text-slate-400 border-slate-500/20",
};

function StatCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="bg-slate-900/60 border border-white/10 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-slate-400 text-sm">{label}</span>
        <span className="text-indigo-400">{icon}</span>
      </div>
      <div className="text-3xl font-bold text-white">{value}</div>
    </div>
  );
}

export default function AdminPage() {
  const leads: Lead[] = getAllLeads();

  const serviceCounts = leads.reduce(
    (acc, l) => ({ ...acc, [l.service]: (acc[l.service] || 0) + 1 }),
    {} as Record<string, number>
  );

  const topService =
    Object.entries(serviceCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

  return (
    <div className="min-h-screen bg-[#060610] text-slate-100">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-[20%] w-[400px] h-[400px] bg-indigo-600/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-[20%] w-[400px] h-[400px] bg-purple-600/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-white/5 bg-slate-900/30 backdrop-blur-sm px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="Devs Aura Agency"
                width={100}
                height={32}
                className="h-8 w-auto object-contain"
              />
              <span className="text-slate-400 text-sm">/ Admin</span>
            </div>
            <a href="/" className="text-slate-400 hover:text-indigo-400 text-sm transition-colors">
              ← Back to Site
            </a>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-10">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white mb-1">Leads Dashboard</h1>
            <p className="text-slate-400 text-sm">All captured leads and contact information</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            <StatCard label="Total Leads" value={leads.length} icon={<Users className="w-5 h-5" />} />
            <StatCard
              label="This Month"
              value={leads.filter((l) => new Date(l.createdAt).getMonth() === new Date().getMonth()).length}
              icon={<TrendingUp className="w-5 h-5" />}
            />
            <StatCard
              label="Web Dev Requests"
              value={serviceCounts["Web Development"] ?? 0}
              icon={<Briefcase className="w-5 h-5" />}
            />
            <StatCard
              label="SaaS Requests"
              value={serviceCounts["SaaS"] ?? 0}
              icon={<Briefcase className="w-5 h-5" />}
            />
          </div>

          {/* Top service badge */}
          {leads.length > 0 && (
            <div className="mb-6 flex items-center gap-2">
              <span className="text-slate-400 text-sm">Most requested:</span>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${SERVICE_COLORS[topService] ?? SERVICE_COLORS["Other"]}`}>
                {topService}
              </span>
            </div>
          )}

          {/* Table with delete functionality */}
          <LeadsTable initialLeads={leads} />
        </main>
      </div>

      <Toaster
        theme="dark"
        position="top-right"
        toastOptions={{
          style: {
            background: "#1e1e2e",
            border: "1px solid rgba(99,102,241,0.2)",
            color: "#e2e8f0",
          },
        }}
      />
    </div>
  );
}
