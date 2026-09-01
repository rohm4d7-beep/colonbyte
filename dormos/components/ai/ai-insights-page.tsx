'use client'

import { motion } from 'framer-motion'
import { Bot, TrendingUp, TrendingDown, Minus, FileText, Lightbulb, AlertTriangle, WandSparkles, ArrowRight } from 'lucide-react'
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts'
import Link from 'next/link'
import { PageHeader } from '@/components/shared/page-header'
import { AITabs } from './ai-tabs'
import { AI_INSIGHTS_EXPANDED, AI_FORECASTS, AI_WIDGETS } from '@/lib/mock-data/ai'
import { cn } from '@/lib/utils'

const SENTIMENT_STYLES = {
  positive: { icon: TrendingUp, classes: 'bg-emerald-50 text-emerald-600' },
  negative: { icon: TrendingDown, classes: 'bg-rose-50 text-rose-600' },
  neutral: { icon: Minus, classes: 'bg-gray-100 text-gray-500' },
}

const CHART_COLORS: Record<string, string> = {
  'Revenue increased by 18%': 'var(--color-chart-1)',
  'Occupancy expected to reach 95%': 'var(--color-chart-2)',
  'Mess expenses increased 8%': 'var(--color-chart-3)',
  'Five students are overdue': 'var(--color-chart-5)',
  'Three rooms require maintenance': 'var(--color-chart-4)',
  'Electricity usage increased': 'var(--color-chart-3)',
  'Staff attendance dropped this week': 'var(--color-chart-5)',
  'Collection rate hit a yearly high': 'var(--color-chart-6)',
}

export function AIInsightsPage() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="AI Insights"
        description="Automatically generated insights, forecasts and recommendations from your hostel data."
        icon={Bot}
        crumbs={[{ label: 'AI Assistant' }]}
        actions={<AITabs active="insights" />}
      />

      {/* Forecast widgets */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {AI_FORECASTS.map((forecast, index) => (
          <motion.div
            key={forecast.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-2xl border border-gray-200/70 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500">{forecast.title}</p>
                <p className="text-[11px] text-gray-400">{forecast.description}</p>
              </div>
              <span className={cn('rounded-full px-2 py-0.5 text-[11px] font-semibold', forecast.positive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600')}>
                {forecast.delta}
              </span>
            </div>
            <p className="mt-3 text-2xl font-bold tracking-tight text-gray-900">{forecast.value}</p>
            <div className="mt-3 h-24">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={forecast.series} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id={forecast.id} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={forecast.color} stopOpacity={0.25} />
                      <stop offset="100%" stopColor={forecast.color} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="label" tick={{ fontSize: 9, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                  <YAxis hide />
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
                  <Area type="monotone" dataKey="value" stroke={forecast.color} strokeWidth={2} fill={`url(#${forecast.id})`} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Insight cards */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-gray-900">Latest insights</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {AI_INSIGHTS_EXPANDED.map((insight, index) => {
            const sentiment = SENTIMENT_STYLES[insight.sentiment]
            const SentimentIcon = sentiment.icon
            return (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
                className="group rounded-2xl border border-gray-200/70 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-gray-300/70 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className={cn('flex h-8 w-8 items-center justify-center rounded-lg', sentiment.classes)}>
                      <SentimentIcon className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-[11px] font-medium text-gray-400">{insight.tag}</p>
                      <p className="text-sm font-semibold text-gray-900">{insight.headline}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-bold text-gray-900">{insight.metric}</p>
                    <p className={cn('text-[11px] font-semibold', insight.sentiment === 'positive' ? 'text-emerald-600' : insight.sentiment === 'negative' ? 'text-rose-500' : 'text-gray-400')}>
                      {insight.delta}
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-[13px] leading-relaxed text-gray-500">{insight.detail}</p>
                <div className="mt-3 h-16">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={insight.series} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke={CHART_COLORS[insight.headline] ?? 'var(--color-chart-1)'}
                        strokeWidth={2}
                        fill={CHART_COLORS[insight.headline] ?? 'var(--color-chart-1)'}
                        fillOpacity={0.12}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* AI widgets */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <AIWidgetCard
          icon={FileText}
          title="Latest AI reports"
          iconClasses="bg-accent text-primary"
          items={AI_WIDGETS.latestReports.map((r) => ({ title: r.title, meta: r.meta, tag: r.tag }))}
          href="/dashboard/reports"
          linkLabel="View all reports"
        />
        <AIWidgetCard
          icon={Lightbulb}
          title="Smart suggestions"
          iconClasses="bg-amber-50 text-amber-600"
          items={AI_WIDGETS.smartSuggestions.map((s) => ({ title: s.title, meta: s.detail }))}
          href="/dashboard/analytics"
          linkLabel="Open analytics"
        />
        <AIWidgetCard
          icon={AlertTriangle}
          title="Risk alerts"
          iconClasses="bg-rose-50 text-rose-600"
          items={AI_WIDGETS.riskAlerts.map((r) => ({ title: r.title, meta: r.detail, tag: r.severity === 'danger' ? 'High' : 'Watch' }))}
          href="/dashboard/notifications"
          linkLabel="View notifications"
        />
        <AIWidgetCard
          icon={WandSparkles}
          title="Optimization tips"
          iconClasses="bg-emerald-50 text-emerald-600"
          items={AI_WIDGETS.optimizationTips.map((o) => ({ title: o.title, meta: o.detail }))}
          href="/dashboard/settings"
          linkLabel="Open settings"
        />
      </div>
    </div>
  )
}

function AIWidgetCard({
  icon: Icon,
  title,
  iconClasses,
  items,
  href,
  linkLabel,
}: {
  icon: typeof FileText
  title: string
  iconClasses: string
  items: { title: string; meta?: string; tag?: string }[]
  href: string
  linkLabel: string
}) {
  return (
    <div className="rounded-2xl border border-gray-200/70 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className={cn('flex h-9 w-9 items-center justify-center rounded-xl', iconClasses)}>
            <Icon className="h-4 w-4" />
          </span>
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        </div>
        <Link
          href={href}
          className="flex items-center gap-1 text-xs font-medium text-primary transition-colors hover:text-primary focus-visible:ring-3 focus-visible:ring-primary/30 focus-visible:outline-none"
        >
          {linkLabel}
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <div key={item.title} className="flex items-start justify-between gap-3 rounded-xl bg-gray-50/70 px-3 py-2.5">
            <div className="min-w-0">
              <p className="truncate text-[13px] font-medium text-gray-800">{item.title}</p>
              {item.meta && <p className="mt-0.5 line-clamp-1 text-xs text-gray-400">{item.meta}</p>}
            </div>
            {item.tag && (
              <span
                className={cn(
                  'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold',
                  item.tag === 'High' ? 'bg-rose-50 text-rose-600' : item.tag === 'Watch' ? 'bg-amber-50 text-amber-600' : 'bg-accent text-primary',
                )}
              >
                {item.tag}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
