import type { Metadata } from 'next'
import { RefundsPage } from '@/components/finance/refunds-page'

export const metadata: Metadata = {
  title: 'Refunds — DormOS',
  description: 'Review, approve and process payment refunds for residents.',
}

export default function RefundsRoutePage() {
  return <RefundsPage />
}
