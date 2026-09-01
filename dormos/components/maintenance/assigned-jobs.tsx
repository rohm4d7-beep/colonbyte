'use client'

import { motion } from 'framer-motion'
import { ClipboardList } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { MaintenanceTabs } from './maintenance-tabs'
import { MAINTENANCE_TICKETS } from '@/lib/mock-data/maintenance'
import { cn } from '@/lib/utils'

const PRIORITY_CONFIG = {
  Critical: { bg: 'bg-rose-50', text: 'text-rose-700', ring: 'ring-rose-600/20' },
  High: { bg: 'bg-amber-50', text: 'text-amber-700', ring: 'ring-amber-600/20' },
  Medium: { bg: 'bg-accent', text: 'text-primary', ring: 'ring-primary/20' },
  Low: { bg: 'bg-gray-50', text: 'text-gray-600', ring: 'ring-gray-500/20' },
}

const AVATAR_COLORS = ['bg-primary', 'bg-emerald-600', 'bg-violet-600', 'bg-amber-600', 'bg-rose-600', 'bg-primary', 'bg-orange-600']

const inProgressTickets = MAINTENANCE_TICKETS.filter((t) => t.status === 'In Progress')

const staffGroups = Array.from(
  inProgressTickets.reduce((map, ticket) => {
    if (!map.has(ticket.assignedTo)) map.set(ticket.assignedTo, [])
    map.get(ticket.assignedTo)!.push(ticket)
    return map
  }, new Map<string, typeof inProgressTickets>()),
  ([staff, tickets]) => ({ staff, tickets }),
)

export function AssignedJobsPage() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Assigned Jobs"
        description="Jobs currently in progress grouped by assigned staff member."
        icon={ClipboardList}
        crumbs={[{ label: 'Maintenance', href: '/dashboard/maintenance' }, { label: 'Assigned' }]}
      />

      <MaintenanceTabs />

      {staffGroups.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 py-16 text-center">
          <p className="text-sm font-medium text-gray-600">No jobs in progress</p>
          <p className="text-xs text-gray-400">All maintenance jobs have been completed</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {staffGroups.map(({ staff, tickets }, groupIndex) => {
            const initials = staff.split(' ').slice(0, 2).map((n) => n[0]).join('')
            const color = AVATAR_COLORS[groupIndex % AVATAR_COLORS.length]
            return (
              <motion.div
                key={staff}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: groupIndex * 0.08 }}
              >
                {/* Staff Header */}
                <div className="mb-3 flex items-center gap-3">
                  <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white', color)}>
                    {initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{staff}</p>
                    <p className="text-xs text-gray-400">{tickets.length} active job{tickets.length > 1 ? 's' : ''}</p>
                  </div>
                  <div className="ml-auto flex h-6 min-w-6 items-center justify-center rounded-full bg-accent px-2 text-xs font-bold text-primary">
                    {tickets.length}
                  </div>
                </div>

                {/* Tickets */}
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {tickets.map((ticket, i) => {
                    const pConf = PRIORITY_CONFIG[ticket.priority]
                    return (
                      <motion.div
                        key={ticket.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: groupIndex * 0.08 + i * 0.04 }}
                        className="rounded-2xl border border-gray-200/70 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md cursor-pointer"
                      >
                        <div className="mb-2 flex items-start justify-between gap-2">
                          <span className="text-xs font-semibold text-primary">{ticket.ticketNumber}</span>
                          <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1', pConf.bg, pConf.text, pConf.ring)}>
                            {ticket.priority}
                          </span>
                        </div>
                        <p className="text-xs font-medium text-gray-900 line-clamp-2">{ticket.title}</p>
                        <div className="mt-2 flex items-center gap-2 text-[10px] text-gray-400">
                          <span>{ticket.room}</span>
                          <span>·</span>
                          <span>{ticket.category}</span>
                        </div>
                        {ticket.scheduledDate && (
                          <div className="mt-2 rounded-lg bg-accent px-2 py-1 text-[10px] font-medium text-primary">
                            Scheduled: {new Date(ticket.scheduledDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </div>
                        )}
                        <div className="mt-2 text-[10px] text-gray-400">
                          Est. Cost: Rs {ticket.estimatedCost.toLocaleString()}
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
