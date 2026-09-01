'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { MaintenanceTabs } from './maintenance-tabs'
import { MAINTENANCE_TICKETS } from '@/lib/mock-data/maintenance'
import { cn } from '@/lib/utils'

const PRIORITY_COLORS = {
  Critical: 'bg-rose-500',
  High: 'bg-amber-500',
  Medium: 'bg-primary',
  Low: 'bg-gray-400',
}

const STATUS_CONFIG = {
  Open: { bg: 'bg-rose-50', text: 'text-rose-700', ring: 'ring-rose-600/20' },
  'In Progress': { bg: 'bg-accent', text: 'text-primary', ring: 'ring-primary/20' },
  Resolved: { bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-emerald-600/20' },
  Closed: { bg: 'bg-gray-50', text: 'text-gray-600', ring: 'ring-gray-500/20' },
  Cancelled: { bg: 'bg-gray-50', text: 'text-gray-500', ring: 'ring-gray-400/20' },
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

export function MaintenanceCalendarPage() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [selectedDay, setSelectedDay] = useState<number | null>(now.getDate())

  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)

  const monthName = new Date(year, month, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1) }
    else setMonth(m => m - 1)
    setSelectedDay(null)
  }

  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1) }
    else setMonth(m => m + 1)
    setSelectedDay(null)
  }

  function getTicketsForDay(day: number) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return MAINTENANCE_TICKETS.filter((t) => t.scheduledDate === dateStr)
  }

  const selectedTickets = selectedDay ? getTicketsForDay(selectedDay) : []

  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Maintenance Calendar"
        description="View scheduled maintenance jobs by date."
        icon={Calendar}
        crumbs={[{ label: 'Maintenance', href: '/dashboard/maintenance' }, { label: 'Calendar' }]}
      />

      <MaintenanceTabs />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Calendar */}
        <div className="lg:col-span-2 rounded-2xl border border-gray-200/70 bg-white p-5 shadow-sm">
          {/* Month Nav */}
          <div className="mb-4 flex items-center justify-between">
            <button onClick={prevMonth} className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 transition-colors hover:bg-gray-50">
              <ChevronLeft className="h-4 w-4 text-gray-500" />
            </button>
            <h2 className="text-sm font-semibold text-gray-900">{monthName}</h2>
            <button onClick={nextMonth} className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 transition-colors hover:bg-gray-50">
              <ChevronRight className="h-4 w-4 text-gray-500" />
            </button>
          </div>

          {/* Day Headers */}
          <div className="mb-2 grid grid-cols-7 gap-1">
            {DAYS.map((day) => (
              <div key={day} className="text-center text-[10px] font-semibold text-gray-400 py-1">{day}</div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDay }, (_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1
              const tickets = getTicketsForDay(day)
              const isToday = year === now.getFullYear() && month === now.getMonth() && day === now.getDate()
              const isSelected = selectedDay === day

              return (
                <motion.button
                  key={day}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setSelectedDay(day)}
                  className={cn(
                    'relative flex min-h-[52px] flex-col items-center rounded-xl p-1.5 text-xs font-medium transition-all',
                    isSelected ? 'bg-primary text-white shadow-sm' : isToday ? 'bg-accent text-primary' : 'text-gray-700 hover:bg-gray-50',
                  )}
                >
                  <span className={cn('mb-1 text-xs font-semibold', isSelected ? 'text-white' : isToday ? 'text-primary' : 'text-gray-700')}>
                    {day}
                  </span>
                  {tickets.length > 0 && (
                    <div className="flex flex-wrap gap-0.5 justify-center">
                      {tickets.slice(0, 3).map((t) => (
                        <span key={t.id} className={cn('h-1.5 w-1.5 rounded-full', isSelected ? 'bg-white/80' : PRIORITY_COLORS[t.priority])} />
                      ))}
                      {tickets.length > 3 && (
                        <span className={cn('text-[8px] font-bold', isSelected ? 'text-white/80' : 'text-gray-400')}>+{tickets.length - 3}</span>
                      )}
                    </div>
                  )}
                </motion.button>
              )
            })}
          </div>

          {/* Legend */}
          <div className="mt-4 flex items-center gap-3 border-t border-gray-100 pt-3">
            {Object.entries(PRIORITY_COLORS).map(([priority, color]) => (
              <div key={priority} className="flex items-center gap-1">
                <span className={cn('h-2 w-2 rounded-full', color)} />
                <span className="text-[10px] text-gray-400">{priority}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Day Tickets */}
        <div className="rounded-2xl border border-gray-200/70 bg-white p-5 shadow-sm">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-900">
              {selectedDay
                ? `${new Date(year, month, selectedDay).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}`
                : 'Select a day'}
            </h3>
            <p className="text-xs text-gray-400">{selectedTickets.length} scheduled job{selectedTickets.length !== 1 ? 's' : ''}</p>
          </div>

          {selectedDay && selectedTickets.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                <Calendar className="h-5 w-5 text-gray-300" />
              </div>
              <p className="text-xs text-gray-400">No jobs scheduled</p>
            </div>
          )}

          <div className="flex flex-col gap-2">
            {selectedTickets.map((ticket, i) => {
              const pColor = PRIORITY_COLORS[ticket.priority]
              const sConf = STATUS_CONFIG[ticket.status]
              return (
                <motion.div key={ticket.id} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                  className="rounded-xl border border-gray-100 p-3 hover:bg-gray-50/50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={cn('h-2 w-2 rounded-full shrink-0', pColor)} />
                    <span className="text-xs font-semibold text-primary">{ticket.ticketNumber}</span>
                    <span className={cn('ml-auto rounded-full px-1.5 py-0.5 text-[10px] font-semibold ring-1', sConf.bg, sConf.text, sConf.ring)}>
                      {ticket.status}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-gray-900 line-clamp-2">{ticket.title}</p>
                  <div className="mt-1.5 flex items-center gap-2 text-[10px] text-gray-400">
                    <span>{ticket.room}</span>
                    <span>·</span>
                    <span>{ticket.category}</span>
                  </div>
                  <p className="mt-1 text-[10px] text-gray-500">Assigned: {ticket.assignedTo}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
