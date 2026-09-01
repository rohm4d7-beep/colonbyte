'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, Download, CheckCircle2, XCircle, ClipboardList, Users, Coffee, Sun, Moon } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { MessTabs } from './mess-tabs'
import { MEAL_ATTENDANCE } from '@/lib/mock-data/mess'
import { formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import { UtensilsCrossed } from 'lucide-react'

const PAGE_SIZE = 25

export function MealAttendancePage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [mealFilter, setMealFilter] = useState<'all' | 'breakfast' | 'lunch' | 'dinner'>('all')

  const filtered = MEAL_ATTENDANCE.filter((r) => {
    const q = search.toLowerCase()
    const matchSearch = !q || r.student.toLowerCase().includes(q) || r.room.toLowerCase().includes(q)
    const matchMeal = mealFilter === 'all' ||
      (mealFilter === 'breakfast' && r.breakfast) ||
      (mealFilter === 'lunch' && r.lunch) ||
      (mealFilter === 'dinner' && r.dinner)
    return matchSearch && matchMeal
  })

  const total = filtered.length
  const pages = Math.ceil(total / PAGE_SIZE)
  const records = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const breakfastPct = Math.round((MEAL_ATTENDANCE.filter((r) => r.breakfast).length / MEAL_ATTENDANCE.length) * 100)
  const lunchPct = Math.round((MEAL_ATTENDANCE.filter((r) => r.lunch).length / MEAL_ATTENDANCE.length) * 100)
  const dinnerPct = Math.round((MEAL_ATTENDANCE.filter((r) => r.dinner).length / MEAL_ATTENDANCE.length) * 100)
  const guestCount = MEAL_ATTENDANCE.filter((r) => r.isGuest).length

  const summaryCards = [
    { label: 'Total Records', value: MEAL_ATTENDANCE.length.toString(), icon: Users, color: 'text-primary bg-accent' },
    { label: 'Breakfast %', value: `${breakfastPct}%`, icon: Coffee, color: 'text-amber-600 bg-amber-50' },
    { label: 'Lunch %', value: `${lunchPct}%`, icon: Sun, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Guest Meals', value: guestCount.toString(), icon: Moon, color: 'text-violet-600 bg-violet-50' },
  ]

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Meal Attendance"
        description="Track student meal participation across breakfast, lunch and dinner."
        icon={ClipboardList}
        crumbs={[{ label: 'Mess', href: '/dashboard/mess' }, { label: 'Attendance' }]}
        actions={
          <button className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 shadow-sm transition-colors hover:bg-gray-50">
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </button>
        }
      />

      <MessTabs />

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {summaryCards.map((card, i) => {
          const Icon = card.icon
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-2xl border border-gray-200/70 bg-white p-4 shadow-sm"
            >
              <div className="flex items-center gap-2.5">
                <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl', card.color)}>
                  <Icon className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-xs text-gray-500">{card.label}</p>
                  <p className="text-lg font-bold text-gray-900">{card.value}</p>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search student or room..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="h-9 w-full rounded-xl border border-gray-200 bg-white pl-9 pr-3 text-xs text-gray-900 placeholder-gray-400 shadow-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="flex items-center gap-1 rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
          {(['all', 'breakfast', 'lunch', 'dinner'] as const).map((m) => (
            <button
              key={m}
              onClick={() => { setMealFilter(m); setPage(1) }}
              className={cn(
                'rounded-lg px-3 py-1 text-xs font-medium capitalize transition-colors',
                mealFilter === m ? 'bg-accent text-primary' : 'text-gray-500 hover:bg-gray-50',
              )}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-gray-200/70 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">Student</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500">Room</th>
                <th className="px-3 py-3 text-center text-xs font-semibold text-gray-500">Breakfast</th>
                <th className="px-3 py-3 text-center text-xs font-semibold text-gray-500">Lunch</th>
                <th className="px-3 py-3 text-center text-xs font-semibold text-gray-500">Dinner</th>
                <th className="px-3 py-3 text-center text-xs font-semibold text-gray-500">Guest</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {records.map((record, i) => (
                <motion.tr
                  key={record.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-primary">
                        {record.student.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                      </div>
                      <span className="text-xs font-medium text-gray-900">{record.student}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-xs text-gray-500">{record.room}</td>
                  <td className="px-3 py-3 text-center">
                    {record.breakfast ? <CheckCircle2 className="mx-auto h-4 w-4 text-emerald-500" /> : <XCircle className="mx-auto h-4 w-4 text-gray-200" />}
                  </td>
                  <td className="px-3 py-3 text-center">
                    {record.lunch ? <CheckCircle2 className="mx-auto h-4 w-4 text-emerald-500" /> : <XCircle className="mx-auto h-4 w-4 text-gray-200" />}
                  </td>
                  <td className="px-3 py-3 text-center">
                    {record.dinner ? <CheckCircle2 className="mx-auto h-4 w-4 text-emerald-500" /> : <XCircle className="mx-auto h-4 w-4 text-gray-200" />}
                  </td>
                  <td className="px-3 py-3 text-center">
                    {record.isGuest ? (
                      <span className="rounded-full bg-violet-50 px-1.5 py-0.5 text-[10px] font-medium text-violet-700 ring-1 ring-violet-600/20">Yes</span>
                    ) : (
                      <span className="text-xs text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-xs text-gray-400">{formatDate(record.date)}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3">
          <p className="text-xs text-gray-400">
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total} records
          </p>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(pages, 5) }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-lg text-xs font-medium transition-colors',
                  page === p ? 'bg-primary text-white' : 'text-gray-500 hover:bg-gray-100',
                )}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
