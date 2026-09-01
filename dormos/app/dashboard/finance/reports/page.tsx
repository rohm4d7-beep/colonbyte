import type { Metadata } from 'next'
import { ReportsPage } from '@/components/finance/reports-page'

export const metadata: Metadata = {
  title: 'Financial Reports — DormOS',
  description: 'Summaries, profit & loss and collection performance for the fiscal year.',
}

export default function ReportsRoutePage() {
  return <ReportsPage />
}
