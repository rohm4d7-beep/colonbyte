'use client'

import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FilePlus2, Download, Filter, Eye, RefreshCw } from 'lucide-react'
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { PageHeader } from '@/components/shared/page-header'
import { ChartCard } from '@/components/widgets/chart-card'
import { REPORT_BUILDER, REPORT_ROWS } from '@/lib/mock-data/reports'
import { EXPENSE_DONUT } from '@/lib/mock-data/analytics'
import { cn } from '@/lib/utils'

const fieldClasses =
  'w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 focus:border-primary/50 focus:outline-none focus:ring-3 focus:ring-primary/20'

export function ReportBuilderPage() {
  const [module, setModule] = useState('Finance')
  const [dateRange, setDateRange] = useState('Last 30 days')
  const [department, setDepartment] = useState('All departments')
  const [chartType, setChartType] = useState('Bar')
  const [filters, setFilters] = useState<string[]>(['By status'])
  const [showPreview, setShowPreview] = useState(true)

  const toggleFilter = (filter: string) => {
    setFilters((prev) => (prev.includes(filter) ? prev.filter((f) => f !== filter) : [...prev, filter]))
  }

  const rows = useMemo(() => REPORT_ROWS[module.toLowerCase()] ?? REPORT_ROWS.financial, [module])
  const chartData = rows.map((row) => ({ name: row.label.split(' ')[0], value: row.change, status: row.status }))

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Report builder"
        description="Design a custom report — pick a date range, module, chart type and filters, then preview and export."
        icon={FilePlus2}
        crumbs={[{ label: 'Reports', href: '/dashboard/reports' }, { label: 'Builder' }]}
        actions={
          <>
            <button className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus-visible:ring-3 focus-visible:ring-primary/30 focus-visible:outline-none">
              <RefreshCw className="h-4 w-4" />
              Save draft
            </button>
            <button className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-3 text-sm font-medium text-white shadow-sm shadow-primary/30 transition-colors hover:bg-primary/80 focus-visible:ring-3 focus-visible:ring-primary/40 focus-visible:outline-none">
              <Download className="h-4 w-4" />
              Export
            </button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[340px_1fr]">
        {/* Builder form */}
        <div className="h-fit rounded-2xl border border-gray-200/70 bg-white p-5 shadow-sm lg:sticky lg:top-20">
          <h3 className="text-sm font-semibold text-gray-900">Report configuration</h3>
          <p className="mt-0.5 text-xs text-gray-400">Configure your report parameters</p>

          <div className="mt-4 flex flex-col gap-4">
            <div>
              <label htmlFor="builder-date" className="mb-1.5 block text-xs font-medium text-gray-600">Date range</label>
              <select id="builder-date" value={dateRange} onChange={(e) => setDateRange(e.target.value)} className={fieldClasses}>
                {REPORT_BUILDER.dateRanges.map((range) => (
                  <option key={range}>{range}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="builder-dept" className="mb-1.5 block text-xs font-medium text-gray-600">Department</label>
              <select id="builder-dept" value={department} onChange={(e) => setDepartment(e.target.value)} className={fieldClasses}>
                {REPORT_BUILDER.departments.map((dept) => (
                  <option key={dept}>{dept}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="builder-module" className="mb-1.5 block text-xs font-medium text-gray-600">Module</label>
              <select id="builder-module" value={module} onChange={(e) => setModule(e.target.value)} className={fieldClasses}>
                {REPORT_BUILDER.modules.map((mod) => (
                  <option key={mod}>{mod}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="builder-chart" className="mb-1.5 block text-xs font-medium text-gray-600">Chart type</label>
              <select id="builder-chart" value={chartType} onChange={(e) => setChartType(e.target.value)} className={fieldClasses}>
                {REPORT_BUILDER.chartTypes.map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <p className="mb-1.5 text-xs font-medium text-gray-600">Filters</p>
              <div className="flex flex-col gap-1.5">
                {REPORT_BUILDER.filters.map((filter) => (
                  <label key={filter} className="flex cursor-pointer items-center gap-2 text-sm text-gray-600">
                    <input
                      type="checkbox"
                      checked={filters.includes(filter)}
                      onChange={() => toggleFilter(filter)}
                      className="h-3.5 w-3.5 rounded border-gray-300 text-primary accent-primary"
                    />
                    {filter}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-5 flex items-center gap-2 border-t border-gray-100 pt-4">
            <button
              onClick={() => setShowPreview(true)}
              className="inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary text-sm font-medium text-white shadow-sm shadow-primary/30 transition-colors hover:bg-primary/80 focus-visible:ring-3 focus-visible:ring-primary/40 focus-visible:outline-none"
            >
              <Eye className="h-4 w-4" />
              Generate preview
            </button>
            <button
              onClick={() => setShowPreview(false)}
              className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus-visible:ring-3 focus-visible:ring-primary/30 focus-visible:outline-none"
            >
              <Filter className="h-4 w-4" />
              Draft
            </button>
          </div>
        </div>

        {/* Preview */}
        <div>
          <AnimatePresence mode="wait">
            {showPreview ? (
              <motion.div
                key="preview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-4"
              >
                <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-gray-200/70 bg-white px-4 py-3 shadow-sm">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-primary">
                    <FilePlus2 className="h-3.5 w-3.5" />
                  </span>
                  <p className="text-sm font-semibold text-gray-900">
                    {module} report
                  </p>
                  <span className="text-xs text-gray-400">{dateRange}</span>
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-500">{department}</span>
                  {filters.map((f) => (
                    <span key={f} className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold text-primary">{f}</span>
                  ))}
                  <span className="ml-auto rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">Ready to export</span>
                </div>

                <ChartCard title={`${module} — ${chartType} chart`} subtitle={`Preview · ${rows.length} metrics`}>
                  <ResponsiveContainer width="100%" height={280}>
                    {chartType === 'Bar' && (
                      <BarChart data={chartData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                        <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
                        <Bar dataKey="value" fill="var(--color-chart-1)" radius={[6, 6, 0, 0]} maxBarSize={36}>
                          {chartData.map((entry) => (
                            <Cell key={entry.name} fill={entry.status === 'up' ? 'var(--color-chart-2)' : entry.status === 'down' ? 'var(--color-chart-5)' : '#94A3B8'} />
                          ))}
                        </Bar>
                      </BarChart>
                    )}
                    {chartType === 'Line' && (
                      <LineChart data={chartData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
                        <Line type="monotone" dataKey="value" stroke="var(--color-chart-1)" strokeWidth={2} dot={{ r: 3, fill: 'var(--color-chart-1)' }} />
                      </LineChart>
                    )}
                    {chartType === 'Area' && (
                      <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                        <defs>
                          <linearGradient id="builder-area" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.25} />
                            <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
                        <Area type="monotone" dataKey="value" stroke="var(--color-chart-1)" strokeWidth={2} fill="url(#builder-area)" />
                      </AreaChart>
                    )}
                    {(chartType === 'Pie' || chartType === 'Donut') && (
                      <PieChart>
                        <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
                        <Pie
                          data={EXPENSE_DONUT}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={chartType === 'Donut' ? '58%' : 0}
                          outerRadius="85%"
                          paddingAngle={2}
                          strokeWidth={0}
                        >
                          {EXPENSE_DONUT.map((entry) => (
                            <Cell key={entry.name} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    )}
                    {chartType === 'Table' && (
                      <div className="overflow-auto rounded-xl border border-gray-100">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-gray-50">
                              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Metric</th>
                              <th className="px-3 py-2 text-right text-xs font-semibold text-gray-500">Value</th>
                              <th className="px-3 py-2 text-right text-xs font-semibold text-gray-500">Change</th>
                            </tr>
                          </thead>
                          <tbody>
                            {rows.map((row) => (
                              <tr key={row.id} className="border-b border-gray-50">
                                <td className="px-3 py-2 text-xs text-gray-700">{row.label}</td>
                                <td className="px-3 py-2 text-right text-xs font-semibold text-gray-900">{row.value}</td>
                                <td className={cn('px-3 py-2 text-right text-xs', row.status === 'up' ? 'text-emerald-600' : row.status === 'down' ? 'text-rose-500' : 'text-gray-400')}>
                                  {row.change > 0 ? '+' : ''}{row.change}%
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    {chartType === 'Summary' && (
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {rows.map((row) => (
                          <div key={row.id} className="rounded-xl bg-gray-50/70 p-4">
                            <p className="truncate text-xs text-gray-400">{row.label}</p>
                            <p className="mt-1 text-lg font-bold text-gray-900">{row.value}</p>
                            <p className={cn('text-[11px] font-medium', row.status === 'up' ? 'text-emerald-600' : row.status === 'down' ? 'text-rose-500' : 'text-gray-400')}>
                              {row.change > 0 ? '+' : ''}{row.change}%
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </ResponsiveContainer>
                </ChartCard>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {['PDF', 'CSV', 'Excel', 'Print'].map((format) => (
                    <button
                      key={format}
                      className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md focus-visible:ring-3 focus-visible:ring-primary/30 focus-visible:outline-none"
                    >
                      <Download className="h-3.5 w-3.5" />
                      {format}
                    </button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="draft"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 px-6 py-16 text-center"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-black/5">
                  <FilePlus2 className="h-5 w-5 text-primary" />
                </div>
                <p className="text-sm font-semibold text-gray-900">Draft saved</p>
                <p className="max-w-sm text-xs text-gray-400">
                  Your configuration has been stored as a draft. Hit “Generate preview” to render it again.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
