import type { Metadata } from 'next'
import { InvoicesPage } from '@/components/finance/invoices-page'

export const metadata: Metadata = {
  title: 'Invoices — DormOS',
  description: 'Generate, view and reconcile fee invoices for residents.',
}

export default function InvoicesRoutePage() {
  return <InvoicesPage />
}
