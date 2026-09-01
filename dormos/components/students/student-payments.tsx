'use client'

import { Banknote, Receipt, TrendingDown, TrendingUp } from 'lucide-react'
import type { Student } from '@/types/dorm'
import { studentPayments } from '@/lib/mock-data'
import { formatDate, formatPKR } from '@/lib/format'
import { PAYMENT_STATUS_STYLES, StatusBadge } from '@/components/shared/status'
import { cn } from '@/lib/utils'

export function StudentPayments({ student }: { student: Student }) {
  const payments = studentPayments(student.id)
  const totalPaid = payments
    .filter((payment) => payment.status === 'Completed')
    .reduce((sum, payment) => sum + payment.amount, 0)
  const pending = payments.filter((payment) => payment.status !== 'Completed')

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-gray-200/70 bg-white p-4">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <TrendingUp className="h-4 w-4" />
            </span>
            <p className="text-xs font-medium text-gray-400">Total paid</p>
          </div>
          <p className="mt-2 text-lg font-bold text-gray-900">{formatPKR(totalPaid)}</p>
        </div>
        <div className="rounded-xl border border-gray-200/70 bg-white p-4">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
              <TrendingDown className="h-4 w-4" />
            </span>
            <p className="text-xs font-medium text-gray-400">Outstanding</p>
          </div>
          <p
            className={cn(
              'mt-2 text-lg font-bold',
              student.outstandingDues > 0 ? 'text-rose-600' : 'text-gray-900',
            )}
          >
            {formatPKR(student.outstandingDues)}
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200/70 bg-white">
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
          <div className="flex items-center gap-2">
            <Receipt className="h-4 w-4 text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-900">Payment history</h3>
          </div>
          <span className="text-xs text-gray-400">{payments.length} records</span>
        </div>
        <ul className="divide-y divide-gray-100">
          {payments.map((payment) => (
            <li key={payment.id} className="flex items-center gap-3 px-4 py-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
                <Banknote className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900">{formatPKR(payment.amount)}</p>
                <p className="truncate text-xs text-gray-400">
                  {payment.invoiceNo} · {payment.method} · {formatDate(payment.date)}
                </p>
              </div>
              <StatusBadge style={PAYMENT_STATUS_STYLES[payment.status]} showDot={false} />
            </li>
          ))}
          {pending.length > 0 && (
            <li className="bg-amber-50/40 px-4 py-2 text-xs text-amber-700">
              {pending.length} {pending.length === 1 ? 'payment' : 'payments'} awaiting confirmation.
            </li>
          )}
        </ul>
      </div>
    </div>
  )
}
