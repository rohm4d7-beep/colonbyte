import type { Metadata } from 'next'
import { FinanceDashboardPage } from '@/components/finance/finance-dashboard'

export const metadata: Metadata = {
  title: 'Finance — DormOS',
  description: 'Track revenue, expenses, invoicing and profitability across your hostel.',
}

export default function FinancePage() {
  return <FinanceDashboardPage />
}
