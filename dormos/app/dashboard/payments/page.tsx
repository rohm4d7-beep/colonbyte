import type { Metadata } from 'next'
import { PaymentsPage } from '@/components/finance/payments-page'

export const metadata: Metadata = {
  title: 'Payments — DormOS',
  description: 'Record incoming fees, track collections and reconcile outstanding payments.',
}

export default function PaymentsRoutePage() {
  return <PaymentsPage />
}
