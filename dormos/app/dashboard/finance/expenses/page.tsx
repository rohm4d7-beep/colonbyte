import type { Metadata } from 'next'
import { ExpensesPage } from '@/components/finance/expenses-page'

export const metadata: Metadata = {
  title: 'Expenses — DormOS',
  description: 'Track operational costs, approve payments and keep spending in check.',
}

export default function ExpensesRoutePage() {
  return <ExpensesPage />
}
