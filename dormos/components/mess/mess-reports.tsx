'use client'

import { motion } from 'framer-motion'
import { FileText, Download, TrendingUp, TrendingDown } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { MessTabs } from './mess-tabs'
import { MONTHLY_MESS_COST } from '@/lib/mock-data/mess'
import { cn } from '@/lib/utils'
import { UtensilsCrossed } from 'lucide-react'

const REPORT_TYPES = [
  { id: 'monthly-summary', title: 'Monthly Summary Report', description: 'Comprehensive mess cost and attendance summary', period: 'July 2026', size: '124 KB', format: 'PDF' },
  { id: 'attendance-report', title: 'Meal Attendance Report', description: 'Student-wise meal attendance for the month', period: 'July 2026', size: '89 KB', format: 'Excel' },
  { id: 'kitchen-stock', title: 'Kitchen Stock Report', description: 'Current inventory levels and reorder status', period: 'Aug 1, 2026', size: '56 KB', format: 'PDF' },
  { id: 'cost-analysis', title: 'Cost Analysis Report', description: 'Detailed breakup of mess expenditure by category', period: 'Q2 2026', size: '201 KB', format: 'PDF' },
  { id: 'guest-meals', title: 'Guest Meals Report', description: 'All guest meal records and revenue collected', period: 'July 2026', size: '34 KB', format: 'Excel' },
  { id: 'waste-report', title: 'Food Waste Report', description: 'Monthly food waste analysis and reduction tips', period: 'July 2026', size: '45 KB', format: 'PDF' },
]

export function MessReportsPage() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Mess Reports"
        description="Download and view comprehensive mess management reports."
        icon={FileText}
        crumbs={[{ label: 'Mess', href: '/dashboard/mess' }, { label: 'Reports' }]}
        actions={
          <button className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-medium text-white shadow-sm transition-colors hover:bg-primary/80">
            <FileText className="h-3.5 w-3.5" />
            Generate Report
          </button>
        }
      />

      <MessTabs />

      {/* Reports Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {REPORT_TYPES.map((report, i) => (
          <motion.div
            key={report.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="group flex flex-col rounded-2xl border border-gray-200/70 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="mb-3 flex items-start justify-between gap-2">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <span className={cn(
                'rounded-full px-2 py-0.5 text-[10px] font-semibold',
                report.format === 'PDF' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600',
              )}>
                {report.format}
              </span>
            </div>
            <h3 className="text-sm font-semibold text-gray-900">{report.title}</h3>
            <p className="mt-1 text-xs text-gray-400">{report.description}</p>
            <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
              <span>{report.period}</span>
              <span>{report.size}</span>
            </div>
            <button className="mt-4 flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 py-2 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 group-hover:border-primary/25 group-hover:text-primary">
              <Download className="h-3.5 w-3.5" />
              Download
            </button>
          </motion.div>
        ))}
      </div>

      {/* Monthly Summary Table */}
      <div className="rounded-2xl border border-gray-200/70 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-gray-100 px-5 py-4">
          <h3 className="text-sm font-semibold text-gray-900">12-Month Summary</h3>
          <p className="mt-0.5 text-xs text-gray-400">Monthly mess cost vs budget comparison</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-50 bg-gray-50/50">
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">Month</th>
                <th className="px-3 py-3 text-right text-xs font-semibold text-gray-500">Budget</th>
                <th className="px-3 py-3 text-right text-xs font-semibold text-gray-500">Actual</th>
                <th className="px-3 py-3 text-right text-xs font-semibold text-gray-500">Variance</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {MONTHLY_MESS_COST.map((row) => {
                const variance = row.cost - row.budget
                const overBudget = variance > 0
                return (
                  <tr key={row.month} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3 text-xs font-medium text-gray-900">{row.month}</td>
                    <td className="px-3 py-3 text-right text-xs text-gray-600">Rs {row.budget.toLocaleString()}</td>
                    <td className="px-3 py-3 text-right text-xs font-medium text-gray-900">Rs {row.cost.toLocaleString()}</td>
                    <td className={cn('px-3 py-3 text-right text-xs font-medium flex items-center justify-end gap-1', overBudget ? 'text-rose-600' : 'text-emerald-600')}>
                      {overBudget ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {overBudget ? '+' : ''}Rs {Math.abs(variance).toLocaleString()}
                    </td>
                    <td className="px-3 py-3">
                      <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1', overBudget ? 'bg-rose-50 text-rose-700 ring-rose-600/20' : 'bg-emerald-50 text-emerald-700 ring-emerald-600/20')}>
                        {overBudget ? 'Over Budget' : 'Within Budget'}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
