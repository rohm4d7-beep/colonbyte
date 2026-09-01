'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { FileText, FilePlus2, Download, Sparkles, ArrowUpRight, Copy } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { REPORT_CATEGORIES, REPORT_LIBRARY } from '@/lib/mock-data/reports'
import { cn } from '@/lib/utils'

const STATUS_STYLES: Record<string, string> = {
  Ready: 'bg-emerald-50 text-emerald-600',
  Generating: 'bg-amber-50 text-amber-600',
  Scheduled: 'bg-accent text-primary',
}

export function ReportsPage() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Reports"
        description="Generate, schedule and export professional reports across every module."
        icon={FileText}
        crumbs={[{ label: 'Reports' }]}
        actions={
          <>
            <button
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus-visible:ring-3 focus-visible:ring-primary/30 focus-visible:outline-none"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
            <Link
              href="/dashboard/reports/builder"
              className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-3 text-sm font-medium text-white shadow-sm shadow-primary/30 transition-colors hover:bg-primary/80 focus-visible:ring-3 focus-visible:ring-primary/40 focus-visible:outline-none"
            >
              <FilePlus2 className="h-4 w-4" />
              Report builder
            </Link>
          </>
        }
      />

      {/* Categories */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">Report categories</h2>
          <span className="text-xs text-gray-400">{REPORT_CATEGORIES.length} modules</span>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
          {REPORT_CATEGORIES.map((category, index) => {
            const Icon = category.icon
            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
              >
                <Link
                  href={category.href}
                  className="group flex h-full flex-col rounded-2xl border border-gray-200/70 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-gray-300/70 hover:shadow-md focus-visible:ring-3 focus-visible:ring-primary/30 focus-visible:outline-none"
                >
                  <div className="flex items-start justify-between">
                    <span className={cn('flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-110', category.accent)}>
                      <Icon className="h-5 w-5" />
                    </span>
                    <ArrowUpRight className="h-4 w-4 text-gray-300 opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                  <p className="mt-3 text-sm font-semibold text-gray-900">{category.name}</p>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-gray-400">{category.description}</p>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Report library */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">Report library</h2>
          <span className="flex items-center gap-1.5 text-xs text-gray-400">
            <Sparkles className="h-3 w-3 text-primary" />
            {REPORT_LIBRARY.filter((r) => r.generatedBy === 'AI').length} AI-generated
          </span>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {REPORT_LIBRARY.map((report, index) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: index * 0.03, ease: [0.22, 1, 0.36, 1] }}
              className="group flex flex-col rounded-2xl border border-gray-200/70 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-gray-300/70 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <span className={cn('flex h-9 w-9 items-center justify-center rounded-xl', report.generatedBy === 'AI' ? 'bg-accent text-primary' : 'bg-gray-100 text-gray-500')}>
                  {report.generatedBy === 'AI' ? <Sparkles className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                </span>
                <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold', STATUS_STYLES[report.status])}>
                  {report.status}
                </span>
              </div>
              <p className="mt-3 text-sm font-semibold text-gray-900">{report.title}</p>
              <p className="mt-1 line-clamp-2 flex-1 text-xs leading-relaxed text-gray-400">{report.description}</p>
              <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
                <div className="flex items-center gap-2 text-[11px] text-gray-400">
                  <span>{report.period}</span>
                  <span aria-hidden>·</span>
                  <span>{report.size}</span>
                  <span aria-hidden>·</span>
                  <span>{report.pages}p</span>
                </div>
                <button
                  aria-label={`Copy ${report.title}`}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 focus-visible:ring-3 focus-visible:ring-primary/30 focus-visible:outline-none"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Export strip */}
      <div className="flex flex-col items-center justify-between gap-3 rounded-2xl border border-gray-200/70 bg-white px-5 py-4 shadow-sm sm:flex-row">
        <div>
          <p className="text-sm font-semibold text-gray-900">Export center</p>
          <p className="text-xs text-gray-400">Download reports as PDF, CSV, Excel or send them to print.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {['PDF', 'CSV', 'Excel', 'Print'].map((format) => (
            <button
              key={format}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus-visible:ring-3 focus-visible:ring-primary/30 focus-visible:outline-none"
            >
              <Download className="h-3.5 w-3.5" />
              {format}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
