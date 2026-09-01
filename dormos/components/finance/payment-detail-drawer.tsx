'use client'

import { Download, Printer, CheckCircle2, Send, UserRound, MapPin } from 'lucide-react'
import { StatusBadge } from '@/components/shared/status'
import { AvatarInitials } from '@/components/shared/avatar-initials'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { PAYMENT_STATUS_STYLES } from '@/components/finance/styles'
import {
  invoiceByNumber,
  studentName,
  studentRecord,
  studentRoomNumber,
} from '@/lib/mock-data/finance'
import { formatDate, formatPKR } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { Payment } from '@/types/finance'

function DetailRow({
  label,
  value,
  mono,
}: {
  label: string
  value: React.ReactNode
  mono?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <dt className="text-xs text-gray-400">{label}</dt>
      <dd
        className={cn(
          'text-right text-xs font-medium text-gray-900',
          mono && 'font-mono text-[11px]',
        )}
      >
        {value}
      </dd>
    </div>
  )
}

export function PaymentDetailDrawer({
  payment,
  open,
  onOpenChange,
}: {
  payment: Payment | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  if (!payment) return null

  const invoice = invoiceByNumber(payment.invoiceNo)
  const student = studentRecord(payment.studentId)
  const style = PAYMENT_STATUS_STYLES[payment.status]

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-lg font-bold text-gray-900">
            Payment {payment.referenceNo}
          </SheetTitle>
          <SheetDescription>Transaction details and receipt</SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-4 px-4 pb-6">
          <div className="flex items-center gap-3 rounded-2xl border border-gray-200/70 bg-gradient-to-br from-gray-50 to-accent/40 p-4">
            <AvatarInitials name={studentName(payment.studentId)} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-gray-900">
                {studentName(payment.studentId)}
              </p>
              <p className="flex items-center gap-1 truncate text-xs text-gray-400">
                <MapPin className="h-3 w-3" /> Room {studentRoomNumber(payment.studentId)}
              </p>
            </div>
            <StatusBadge style={style} />
          </div>

          <div className="rounded-2xl border border-gray-200/70 p-4">
            <p className="text-xs font-semibold tracking-wide text-gray-400 uppercase">
              Amount
            </p>
            <p className="mt-1 text-2xl font-bold tracking-tight text-gray-900">
              {formatPKR(payment.amount)}
            </p>
            <p className="mt-0.5 text-xs text-gray-400">
              via {payment.method} · {payment.referenceNo}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200/70 p-4">
            <h4 className="text-xs font-semibold tracking-wide text-gray-400 uppercase">
              Payment Info
            </h4>
            <dl className="mt-1 divide-y divide-gray-50">
              <DetailRow label="Invoice" value={payment.invoiceNo} mono />
              <DetailRow label="Paid date" value={formatDate(payment.paidDate)} />
              <DetailRow label="Due date" value={formatDate(payment.dueDate)} />
              <DetailRow label="Method" value={payment.method} />
              <DetailRow label="Receipt" value={payment.receiptId} mono />
              <DetailRow label="Created by" value={payment.createdBy} />
              <DetailRow label="Status" value={<StatusBadge style={style} />} />
            </dl>
          </div>

          {student && (
            <div className="rounded-2xl border border-gray-200/70 p-4">
              <h4 className="text-xs font-semibold tracking-wide text-gray-400 uppercase">
                Student Details
              </h4>
              <dl className="mt-1 divide-y divide-gray-50">
                <DetailRow label="University" value={student.university} />
                <DetailRow label="Department" value={student.department} />
                <DetailRow label="Semester" value={student.semester} />
                <DetailRow label="Phone" value={student.phone} mono />
                <DetailRow label="Fee status" value={student.feeStatus} />
              </dl>
            </div>
          )}

          {invoice && (
            <div className="rounded-2xl border border-gray-200/70 p-4">
              <h4 className="text-xs font-semibold tracking-wide text-gray-400 uppercase">
                Invoice
              </h4>
              <dl className="mt-1 divide-y divide-gray-50">
                <DetailRow label="Invoice number" value={invoice.number} mono />
                <DetailRow
                  label="Billing period"
                  value={`${invoice.billingPeriodMonths} month${invoice.billingPeriodMonths > 1 ? 's' : ''}`}
                />
                <DetailRow label="Subtotal" value={formatPKR(invoice.total + invoice.discounts - invoice.taxes)} />
                <DetailRow label="Discount" value={`− ${formatPKR(invoice.discounts)}`} />
                <DetailRow label="Tax" value={`+ ${formatPKR(invoice.taxes)}`} />
                <DetailRow label="Total" value={formatPKR(invoice.total)} />
              </dl>
            </div>
          )}

          <div className="rounded-2xl border border-gray-200/70 p-4">
            <h4 className="text-xs font-semibold tracking-wide text-gray-400 uppercase">
              Timeline
            </h4>
            <ol className="mt-3 space-y-4">
              {[
                {
                  icon: Send,
                  label: `Invoice ${payment.invoiceNo} issued`,
                  time: payment.dueDate,
                  done: true,
                },
                {
                  icon: UserRound,
                  label: `Paid by ${studentName(payment.studentId)}`,
                  time: payment.paidDate,
                  done: payment.status !== 'Pending',
                },
                {
                  icon: CheckCircle2,
                  label: 'Receipt confirmed & recorded',
                  time: payment.status === 'Completed' ? payment.paidDate : 'Awaiting',
                  done: payment.status === 'Completed',
                },
              ].map((step, index) => {
                const StepIcon = step.icon
                return (
                  <li key={step.label} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <span
                        className={cn(
                          'flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
                          step.done ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400',
                        )}
                      >
                        <StepIcon className="h-3.5 w-3.5" />
                      </span>
                      {index < 2 && <span className="mt-1 w-px flex-1 bg-gray-100" />}
                    </div>
                    <div className="pb-4">
                      <p className="text-xs font-medium text-gray-900">{step.label}</p>
                      <p className="mt-0.5 text-[11px] text-gray-400">{step.time}</p>
                    </div>
                  </li>
                )
              })}
            </ol>
          </div>

          {payment.notes && (
            <div className="rounded-2xl border border-gray-200/70 p-4">
              <h4 className="text-xs font-semibold tracking-wide text-gray-400 uppercase">
                Notes
              </h4>
              <p className="mt-2 text-xs leading-relaxed text-gray-500">{payment.notes}</p>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 flex flex-col gap-2 border-t border-gray-100 bg-white/95 p-4 backdrop-blur">
          <Button className="w-full">
            <Download className="mr-1 h-3.5 w-3.5" />
            Download Receipt
          </Button>
          <Button variant="outline" className="w-full">
            <Printer className="mr-1 h-3.5 w-3.5" />
            Print
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
