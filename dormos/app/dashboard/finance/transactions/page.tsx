import type { Metadata } from 'next'
import { TransactionsPage } from '@/components/finance/transactions-page'

export const metadata: Metadata = {
  title: 'Transactions — DormOS',
  description: 'Full ledger of income, expenses, refunds, adjustments and transfers.',
}

export default function TransactionsRoutePage() {
  return <TransactionsPage />
}
