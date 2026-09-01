import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { InvoiceDocument } from '@/components/finance/invoice-document'
import { InvoiceActions } from '@/components/finance/invoice-actions'
import { INVOICES } from '@/lib/mock-data/finance'
import { studentName } from '@/lib/mock-data/finance'

interface InvoiceRouteProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: InvoiceRouteProps): Promise<Metadata> {
  const { id } = await params
  const invoice = INVOICES.find((inv) => inv.id === id)
  return {
    title: invoice
      ? `Invoice ${invoice.number} — DormOS`
      : 'Invoice — DormOS',
  }
}

export default async function InvoiceDetailRoute({ params }: InvoiceRouteProps) {
  const { id } = await params
  const invoice = INVOICES.find((inv) => inv.id === id)
  if (!invoice) notFound()

  return (
    <div className="flex flex-col gap-5 print:gap-0">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900">
            Invoice {invoice.number}
          </h1>
          <p className="mt-0.5 text-sm text-gray-500">{studentName(invoice.studentId)}</p>
        </div>
        <InvoiceActions invoiceNumber={invoice.number} />
      </div>
      <InvoiceDocument invoice={invoice} />
    </div>
  )
}
