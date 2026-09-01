import { Building2 } from 'lucide-react'
import { MockQRCode } from '@/components/finance/qr-code'
import { studentRecord, studentRoomNumber } from '@/lib/mock-data/finance'
import { formatDate, formatPKR } from '@/lib/format'
import type { Invoice } from '@/types/finance'

export function InvoiceDocument({ invoice }: { invoice: Invoice }) {
  const student = studentRecord(invoice.studentId)
  const subtotal = invoice.items.reduce((sum, item) => sum + item.amount, 0)

  return (
    <div id="invoice-document" className="mx-auto max-w-3xl rounded-2xl border border-gray-200/70 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-gray-100 pb-5">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary shadow-sm shadow-primary/30">
              <Building2 className="h-5 w-5 text-white" strokeWidth={2.5} />
            </span>
            <div>
              <p className="text-lg leading-tight font-bold text-gray-900">DormOS Hostel</p>
              <p className="text-xs text-gray-400">22-A Canal Bank Road, Lahore</p>
              <p className="text-xs text-gray-400">support@dormos.pk · +92 300 0000000</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold tracking-tight text-gray-900">INVOICE</p>
            <p className="mt-0.5 font-mono text-xs font-medium text-primary">{invoice.number}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-gray-50 p-3.5">
            <p className="text-[11px] font-semibold tracking-wide text-gray-400 uppercase">Bill To</p>
            <p className="mt-1 text-sm font-semibold text-gray-900">
              {student?.name ?? invoice.studentId}
            </p>
            <p className="text-xs text-gray-500">{student?.university}</p>
            <p className="text-xs text-gray-500">{student?.department}</p>
            <p className="mt-0.5 text-xs text-gray-500">Room {studentRoomNumber(invoice.studentId)}</p>
          </div>
          <div className="rounded-xl bg-gray-50 p-3.5">
            <p className="text-[11px] font-semibold tracking-wide text-gray-400 uppercase">Invoice Date</p>
            <p className="mt-1 text-sm font-semibold text-gray-900">{formatDate(invoice.issueDate)}</p>
            <p className="mt-2 text-[11px] font-semibold tracking-wide text-gray-400 uppercase">Due Date</p>
            <p className="mt-1 text-sm font-semibold text-gray-900">{formatDate(invoice.dueDate)}</p>
          </div>
          <div className="rounded-xl bg-gray-50 p-3.5">
            <p className="text-[11px] font-semibold tracking-wide text-gray-400 uppercase">Billing Period</p>
            <p className="mt-1 text-sm font-semibold text-gray-900">
              {invoice.billingPeriodMonths} month{invoice.billingPeriodMonths > 1 ? 's' : ''}
            </p>
            <p className="mt-2 text-[11px] font-semibold tracking-wide text-gray-400 uppercase">Status</p>
            <p className="mt-1 text-sm font-semibold text-gray-900">{invoice.status}</p>
          </div>
        </div>

        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left text-xs tracking-wide text-gray-400 uppercase">
              <th className="py-2 pr-3 font-semibold">Description</th>
              <th className="py-2 px-3 text-right font-semibold">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item) => (
              <tr key={item.id} className="border-b border-gray-50">
                <td className="py-2.5 pr-3 text-gray-700">{item.label}</td>
                <td className="py-2.5 px-3 text-right font-medium text-gray-900">
                  {formatPKR(item.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="ml-auto w-full max-w-xs">
          <div className="flex items-center justify-between py-1.5 text-sm text-gray-600">
            <span>Subtotal</span>
            <span>{formatPKR(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between py-1.5 text-sm text-emerald-600">
            <span>Discount</span>
            <span>− {formatPKR(invoice.discounts)}</span>
          </div>
          <div className="flex items-center justify-between py-1.5 text-sm text-gray-600">
            <span>Tax</span>
            <span>+ {formatPKR(invoice.taxes)}</span>
          </div>
          <div className="mt-1 flex items-center justify-between border-t border-gray-200 pt-2.5">
            <span className="text-sm font-semibold text-gray-900">Total Due</span>
            <span className="text-lg font-bold text-gray-900">{formatPKR(invoice.total)}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-end justify-between gap-4 rounded-xl bg-gray-50 p-4">
          <div className="max-w-sm">
            <p className="text-xs font-semibold tracking-wide text-gray-400 uppercase">
              Payment Instructions
            </p>
            <p className="mt-1 text-xs leading-relaxed text-gray-500">
              Bank transfer, JazzCash or Easypaisa using the invoice number as reference. Please
              quote {invoice.number} in the transaction to ensure reconciliation.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <MockQRCode value={invoice.number} />
            <div>
              <p className="text-xs text-gray-400">Scan to pay</p>
              <p className="font-mono text-[11px] text-gray-600">{invoice.number}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-gray-100 pt-4 text-[11px] text-gray-400">
          <p>
            Generated by DormOS · {formatDate(new Date().toISOString())} · Created by {invoice.createdBy}
          </p>
          <p className="font-medium">Thank you for choosing DormOS!</p>
        </div>
      </div>
    </div>
  )
}
