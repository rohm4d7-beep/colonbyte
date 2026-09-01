'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { History, Search, Download, ShieldAlert, Info, ShieldCheck, Filter } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { AUDIT_EVENTS, AUDIT_FILTERS } from '@/lib/mock-data/audit'
import { cn } from '@/lib/utils'

const SEVERITY_STYLES = {
  info: 'bg-accent text-primary',
  warning: 'bg-amber-50 text-amber-600',
  danger: 'bg-rose-50 text-rose-600',
}

const SEVERITY_DOT = {
  info: 'bg-primary',
  warning: 'bg-amber-500',
  danger: 'bg-rose-500',
}

const MODULE_COLORS: Record<string, string> = {
  Auth: 'bg-gray-100 text-gray-600',
  Settings: 'bg-rose-50 text-rose-600',
  Finance: 'bg-emerald-50 text-emerald-600',
  Students: 'bg-accent text-primary',
  Rooms: 'bg-violet-50 text-violet-600',
  Inventory: 'bg-orange-50 text-orange-600',
  Reports: 'bg-amber-50 text-amber-600',
  Visitors: 'bg-teal-50 text-teal-600',
  Maintenance: 'bg-accent text-primary',
  Staff: 'bg-accent text-primary',
}

const fieldClasses =
  'rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 focus:border-primary/50 focus:outline-none focus:ring-3 focus:ring-primary/20'

export function AuditLogsPage() {
  const [query, setQuery] = useState('')
  const [module, setModule] = useState('All modules')
  const [actor, setActor] = useState('All actors')
  const [severity, setSeverity] = useState('All severities')
  const [showFilters, setShowFilters] = useState(false)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return AUDIT_EVENTS.filter((event) => {
      if (module !== 'All modules' && event.module !== module) return false
      if (actor !== 'All actors' && event.actor !== actor) return false
      if (severity !== 'All severities' && event.severity !== severity.toLowerCase()) return false
      if (q && !`${event.action} ${event.target} ${event.module} ${event.actor}`.toLowerCase().includes(q)) return false
      return true
    })
  }, [query, module, actor, severity])

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Audit Logs"
        description="A complete, tamper-proof record of every action taken in your workspace."
        icon={History}
        crumbs={[{ label: 'Audit Logs' }]}
        actions={
          <button className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus-visible:ring-3 focus-visible:ring-primary/30 focus-visible:outline-none">
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        }
      />

      {/* Filters */}
      <div className="rounded-2xl border border-gray-200/70 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50/70 px-3 py-2 focus-within:border-primary/50 focus-within:ring-3 focus-within:ring-primary/20 md:w-80">
            <Search className="h-3.5 w-3.5 shrink-0 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search actions, targets, actors…"
              aria-label="Search audit logs"
              className="w-full bg-transparent text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none"
            />
          </div>
          <button
            onClick={() => setShowFilters((v) => !v)}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus-visible:ring-3 focus-visible:ring-primary/30 focus-visible:outline-none"
          >
            <Filter className="h-4 w-4" />
            Filters
            <span className="rounded-full bg-accent px-1.5 text-[10px] font-semibold text-primary">
              {(module !== 'All modules' ? 1 : 0) + (actor !== 'All actors' ? 1 : 0) + (severity !== 'All severities' ? 1 : 0)}
            </span>
          </button>
          <span className="ml-auto text-xs text-gray-400">{filtered.length} of {AUDIT_EVENTS.length} events</span>
        </div>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="grid grid-cols-1 gap-3 border-t border-gray-100 pt-3 md:grid-cols-3"
          >
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600">Module</label>
              <select value={module} onChange={(e) => setModule(e.target.value)} className={fieldClasses}>
                {AUDIT_FILTERS.modules.map((m) => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600">Actor</label>
              <select value={actor} onChange={(e) => setActor(e.target.value)} className={fieldClasses}>
                {AUDIT_FILTERS.actors.map((a) => <option key={a}>{a}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600">Severity</label>
              <select value={severity} onChange={(e) => setSeverity(e.target.value)} className={fieldClasses}>
                {AUDIT_FILTERS.severities.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </motion.div>
        )}
      </div>

      {/* Timeline */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 px-6 py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-black/5">
            <ShieldCheck className="h-5 w-5 text-gray-400" />
          </div>
          <p className="text-sm font-semibold text-gray-900">No audit events found</p>
          <p className="max-w-sm text-xs text-gray-400">Try adjusting your filters or search query.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-gray-200/70 bg-white p-5 shadow-sm">
          <ol className="relative flex flex-col gap-1">
            {filtered.map((event, index) => {
              const SeverityIcon = event.severity === 'danger' ? ShieldAlert : event.severity === 'warning' ? Filter : Info
              return (
                <motion.li
                  key={event.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: Math.min(index * 0.03, 0.6) }}
                  className="relative flex items-start gap-4 pb-4 pl-1 last:pb-0"
                >
                  <div className="flex flex-col items-center">
                    <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-4 ring-white', SEVERITY_STYLES[event.severity])}>
                      <SeverityIcon className="h-3.5 w-3.5" />
                    </span>
                    {index < filtered.length - 1 && <span className="mt-1 w-px flex-1 bg-gray-100" />}
                  </div>
                  <div className="min-w-0 flex-1 pb-2">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="text-sm font-semibold text-gray-900">{event.actor}</span>
                      <span className="text-xs text-gray-400">({event.actorRole})</span>
                      <span className="text-xs text-gray-600">{event.action}</span>
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-600">{event.target}</span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-gray-400">
                      <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold', MODULE_COLORS[event.module] ?? 'bg-gray-100 text-gray-500')}>
                        {event.module}
                      </span>
                      <span>{event.timestamp}</span>
                      <span className="font-mono">IP {event.ip}</span>
                    </div>
                  </div>
                  <span className="hidden shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize sm:flex">
                    <span className={cn('h-1.5 w-1.5 rounded-full', SEVERITY_DOT[event.severity])} />
                    {event.severity}
                  </span>
                </motion.li>
              )
            })}
          </ol>
        </div>
      )}
    </div>
  )
}
