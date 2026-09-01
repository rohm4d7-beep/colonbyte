'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { ActivityCard } from '@/components/widgets/activity-card'
import { PAYMENT_SNAPSHOT } from '@/constants/dashboard'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'

const STATUS_STYLES: Record<string, string> = {
  Completed: 'bg-emerald-50 text-emerald-600',
  Pending: 'bg-amber-50 text-amber-600',
  Failed: 'bg-rose-50 text-rose-600',
}

const METHOD_STYLES: Record<string, string> = {
  JazzCash: 'bg-rose-50 text-rose-600',
  Easypaisa: 'bg-emerald-50 text-emerald-600',
  Card: 'bg-accent text-primary',
  Cash: 'bg-emerald-50 text-emerald-600',
  Bank: 'bg-accent text-primary',
}

export function PaymentSnapshot() {
  return (
    <ActivityCard
      title="Recent Payments"
      subtitle="Latest incoming transactions"
      action={
        <Link
          href="/dashboard/payments"
          className="flex items-center gap-1 text-xs font-medium text-primary transition-colors hover:text-primary hover:underline focus-visible:ring-3 focus-visible:ring-primary/30 focus-visible:outline-none"
        >
          View all
          <ArrowRight className="h-3 w-3" />
        </Link>
      }
    >
      <div className="flex flex-col">
        {PAYMENT_SNAPSHOT.map((payment, index) => (
          <motion.div
            key={payment.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="flex items-center gap-3 border-b border-gray-100 py-2.5 last:border-0"
          >
            <span
              className={cn(
                'flex h-7 w-16 shrink-0 items-center justify-center rounded-md text-[9px] font-semibold',
                METHOD_STYLES[payment.method],
              )}
            >
              {payment.method}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-900">
                {payment.student}
              </p>
              <p className="text-xs text-gray-400">
                {payment.room} · {payment.date}
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-0.5">
              <span className="text-sm font-semibold text-gray-900">
                {formatCurrency(payment.amount, 'PKR')}
              </span>
              <span
                className={cn(
                  'rounded-full px-1.5 py-px text-[9px] font-semibold',
                  STATUS_STYLES[payment.status],
                )}
              >
                {payment.status}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </ActivityCard>
  )
}
