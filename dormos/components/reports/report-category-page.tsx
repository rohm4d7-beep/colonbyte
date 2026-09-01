'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Download, FileText, Sparkles, ArrowUpRight, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import Link from 'next/link'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { PageHeader } from '@/components/shared/page-header'
import { AnalyticsCards, type AnalyticsItem } from '@/components/shared/analytics-cards'
import { ChartCard } from '@/components/widgets/chart-card'
import { REPORT_CATEGORIES, REPORT_ROWS, REPORT_LIBRARY } from '@/lib/mock-data/reports'
import { cn } from '@/lib/utils'

export function ReportCategoryPage({ categoryId }: { categoryId: string }) {
  const category = REPORT_CATEGORIES.find((c) => c.id === categoryId) ?? REPORT_CATEGORIES[0]
  const rows = useMemo(() => REPORT_ROWS[categoryId] ?? [], [categoryId])
  const Icon = category.icon

  const analytics: AnalyticsItem[] = useMemo(
    () =>
      rows.slice(0, 6).map((row, i) => {
        const accents = ['blue', 'emerald', 'violet', 'amber', 'rose', 'cyan'] as const
        return {
          id: row.id,
          label: row.label,
          value: row.value,
          icon: row.status === 'up' ? TrendingUp : row.status === 'down' ? TrendingDown : Minus,
          accent: accents[i % accents.length],
          trend: { value: `${row.change > 0 ? '+' : ''}${row.change}%`, positive: row.status === 'up' },
        }
      }),
    [rows],
  )

  const chartData = rows.map((row) => ({ name: row.label.split(' ')[0], value: row.change, status: row.status }))
  const relatedReports = REPORT_LIBRARY.filter((r) => r.category.toLowerCase() === category.name.toLowerCase())

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title={category.name}
        description={category.description}
        icon={Icon}
        crumbs={[{ label: 'Reports', href: '/dashboard/reports' }, { label: category.name }]}
        actions={
          <>
            <button className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus-visible:ring-3 focus-visible:ring-primary/30 focus-visible:outline-none">
              <Download className="h-4 w-4" />
              PDF
            </button>
            <button className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus-visible:ring-3 focus-visible:ring-primary/30 focus-visible:outline-none">
              <Download className="h-4 w-4" />
              CSV
            </button>
            <Link
              href="/dashboard/reports/builder"
              className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-3 text-sm font-medium text-white shadow-sm shadow-primary/30 transition-colors hover:bg-primary/80 focus-visible:ring-3 focus-visible:ring-primary/40 focus-visible:outline-none"
            >
              <FileText className="h-4 w-4" />
              Builder
            </Link>
          </>
        }
      />

      <AnalyticsCards items={analytics} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard
          title="Month-over-month change"
          subtitle="vs previous period"
          className="lg:col-span-2"
        >
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
              <Tooltip
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
                formatter={(value) => [`${value}%`, 'Change']}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={36}>
                {chartData.map((entry) => (
                  <Cell key={entry.name} fill={entry.status === 'up' ? 'var(--color-chart-2)' : entry.status === 'down' ? 'var(--color-chart-5)' : '#94A3B8'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <div className="flex flex-col rounded-2xl border border-gray-200/70 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900">Key figures</h3>
          <p className="mt-0.5 text-xs text-gray-400">Snapshot for this period</p>
          <div className="mt-4 flex flex-1 flex-col gap-2">
            {rows.slice(0, 5).map((row) => (
              <div key={row.id} className="flex items-center justify-between rounded-xl bg-gray-50/70 px-3 py-2.5">
                <span className="text-xs font-medium text-gray-600">{row.label}</span>
                <span className="flex items-center gap-2">
                  <span className="text-[13px] font-semibold text-gray-900">{row.value}</span>
                  {row.status === 'up' && <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />}
                  {row.status === 'down' && <TrendingDown className="h-3.5 w-3.5 text-rose-500" />}
                  {row.status === 'flat' && <Minus className="h-3.5 w-3.5 text-gray-400" />}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-gray-900">Detailed breakdown</h2>
        <div className="overflow-hidden rounded-2xl border border-gray-200/70 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/70">
                <th className="px-5 py-3 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase">Metric</th>
                <th className="px-5 py-3 text-right text-xs font-semibold tracking-wider text-gray-500 uppercase">Value</th>
                <th className="px-5 py-3 text-right text-xs font-semibold tracking-wider text-gray-500 uppercase">Change</th>
                <th className="px-5 py-3 text-right text-xs font-semibold tracking-wider text-gray-500 uppercase">Trend</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <motion.tr
                  key={row.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.04 }}
                  className="border-b border-gray-50 hover:bg-gray-50/50"
                >
                  <td className="px-5 py-3 text-sm font-medium text-gray-800">{row.label}</td>
                  <td className="px-5 py-3 text-right text-sm font-semibold text-gray-900">{row.value}</td>
                  <td className="px-5 py-3 text-right text-sm">
                    <span className={cn('font-medium', row.status === 'up' ? 'text-emerald-600' : row.status === 'down' ? 'text-rose-500' : 'text-gray-400')}>
                      {row.change > 0 ? '+' : ''}{row.change}%
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    {row.status === 'up' && <TrendingUp className="ml-auto h-4 w-4 text-emerald-500" />}
                    {row.status === 'down' && <TrendingDown className="ml-auto h-4 w-4 text-rose-500" />}
                    {row.status === 'flat' && <Minus className="ml-auto h-4 w-4 text-gray-400" />}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {relatedReports.length > 0 && (
        <div>
          <h2 className="mb-3 text-sm font-semibold text-gray-900">Related reports</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {relatedReports.map((report) => (
              <Link
                key={report.id}
                href="/dashboard/reports"
                className="group flex items-center gap-3 rounded-2xl border border-gray-200/70 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-3 focus-visible:ring-primary/30 focus-visible:outline-none"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent text-primary">
                  {report.generatedBy === 'AI' ? <Sparkles className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-medium text-gray-800">{report.title}</span>
                  <span className="block text-xs text-gray-400">{report.period}</span>
                </span>
                <ArrowUpRight className="h-4 w-4 shrink-0 text-gray-300 opacity-0 transition-opacity group-hover:opacity-100" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
