'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, TrendingUp, TrendingDown, Minus, ChevronRight } from 'lucide-react'
import {
  EXPENSES,
  INVOICES,
  LATEST_MONTH,
  MONTHLY_FINANCE,
  NET_PROFIT,
  PREVIOUS_MONTH,
  TOTAL_REVENUE,
  COLLECTION_RATE,
  monthTrend,
} from '@/lib/mock-data/finance'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'

type Insight = {
  id: string
  tag: string
  headline: string
  detail: string
  sentiment: 'positive' | 'negative' | 'neutral'
}

function buildInsights(): Insight[] {
  const revenueTrend = monthTrend(LATEST_MONTH.revenue, PREVIOUS_MONTH.revenue)
  const netMargin = Math.round((NET_PROFIT / TOTAL_REVENUE) * 100)
  const overdue = INVOICES.filter((inv) => inv.status === 'Overdue')
  const overdueTotal = overdue.reduce((sum, inv) => sum + inv.total, 0)
  const avgCollection = Math.round(
    MONTHLY_FINANCE.reduce((sum, m) => sum + m.collectionRate, 0) / MONTHLY_FINANCE.length,
  )

  const byCategory = EXPENSES.filter((e) => e.status !== 'Rejected').reduce(
    (acc, expense) => {
      acc[expense.category] = (acc[expense.category] ?? 0) + expense.amount
      return acc
    },
    {} as Record<string, number>,
  )
  const topCategory = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0]
  const expenseTotal = Object.values(byCategory).reduce((a, b) => a + b, 0)
  const topShare = topCategory ? Math.round((topCategory[1] / expenseTotal) * 100) : 0

  return [
    {
      id: 'revenue-growth',
      tag: 'Revenue',
      headline: `Monthly revenue ${revenueTrend.positive ? 'grew' : 'dipped'} ${revenueTrend.value.replace('+', '')} last month`,
      detail: `${LATEST_MONTH.month} closed at ${formatCurrency(LATEST_MONTH.revenue, 'PKR')} compared to ${formatCurrency(PREVIOUS_MONTH.revenue, 'PKR')} in ${PREVIOUS_MONTH.month}. The ramp is driven by new check-ins and longer billing periods.`,
      sentiment: revenueTrend.positive ? 'positive' : 'negative',
    },
    {
      id: 'net-margin',
      tag: 'Profitability',
      headline: `Net profit margin stands at ${netMargin}%`,
      detail: `DormOS netted ${formatCurrency(NET_PROFIT, 'PKR')} against ${formatCurrency(TOTAL_REVENUE, 'PKR')} in collected revenue. Salary and mess costs remain your two largest outflows.`,
      sentiment: netMargin >= 40 ? 'positive' : netMargin >= 25 ? 'neutral' : 'negative',
    },
    {
      id: 'collection',
      tag: 'Collections',
      headline: `${COLLECTION_RATE}% of payments were collected on time`,
      detail: `Average monthly collection across the last 12 months is ${avgCollection}%. Pushing the remaining ${overdue.length} overdue invoices to reminder campaigns could recover ${formatCurrency(overdueTotal, 'PKR')}.`,
      sentiment: COLLECTION_RATE >= 80 ? 'positive' : 'neutral',
    },
    {
      id: 'top-expense',
      tag: 'Expenses',
      headline: `${topCategory?.[0] ?? 'Mess'} drives ${topShare}% of your expenses`,
      detail: `Total spend of ${formatCurrency(topCategory?.[1] ?? 0, 'PKR')} across the year. Consider renegotiating vendor contracts or reviewing per-student rationing to trim the largest category.`,
      sentiment: 'neutral',
    },
  ]
}

const SENTIMENT_STYLES = {
  positive: { icon: TrendingUp, classes: 'bg-emerald-500' },
  negative: { icon: TrendingDown, classes: 'bg-rose-500' },
  neutral: { icon: Minus, classes: 'bg-gray-400' },
} as const

export function FinanceInsightsCard() {
  const insights = buildInsights()
  const [activeIndex, setActiveIndex] = useState(0)
  const insight = insights[activeIndex % insights.length]
  const sentiment = SENTIMENT_STYLES[insight.sentiment]
  const SentimentIcon = sentiment.icon

  return (
    <div className="relative flex flex-col overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-primary p-6 text-white shadow-lg shadow-gray-900/20">
      <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-10 h-44 w-44 rounded-full bg-violet-500/10 blur-3xl" />

      <div className="relative flex items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-violet-500 shadow-lg shadow-primary/30">
          <Sparkles className="h-4 w-4 text-white" />
        </span>
        <div>
          <h3 className="text-sm font-semibold">AI Finance Insights</h3>
          <p className="text-[11px] text-gray-400">Analyzed from your hostel ledger</p>
        </div>
        <span className="ml-auto flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
          Live
        </span>
      </div>

      <div className="relative mt-5 min-h-[120px] flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={insight.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold">
                <span className={cn('h-1.5 w-1.5 rounded-full', sentiment.classes)} />
                {insight.tag}
              </span>
              <SentimentIcon className="h-3.5 w-3.5 text-gray-400" />
            </div>
            <h4 className="mt-2.5 text-lg leading-snug font-bold tracking-tight">
              {insight.headline}
            </h4>
            <p className="mt-2 text-sm leading-relaxed text-gray-300">{insight.detail}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="relative mt-5 flex items-center justify-between border-t border-white/10 pt-4">
        <div className="flex items-center gap-1.5">
          {insights.map((item, index) => (
            <button
              key={item.id}
              onClick={() => setActiveIndex(index)}
              aria-label={`View insight ${index + 1}: ${item.headline}`}
              className={cn(
                'h-1.5 rounded-full transition-all duration-300 focus-visible:ring-3 focus-visible:ring-primary/40 focus-visible:outline-none',
                index === activeIndex % insights.length
                  ? 'w-6 bg-white'
                  : 'w-1.5 bg-white/30 hover:bg-white/50',
              )}
            />
          ))}
        </div>
        <button className="flex items-center gap-1 rounded-lg bg-white/10 px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-white/20 focus-visible:ring-3 focus-visible:ring-primary/40 focus-visible:outline-none">
          AI Assistant
          <ChevronRight className="h-3 w-3" />
        </button>
      </div>
    </div>
  )
}
