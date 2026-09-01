import type { Metadata } from 'next'
import { RecurringBillingPage } from '@/components/finance/recurring-page'

export const metadata: Metadata = {
  title: 'Recurring Billing — DormOS',
  description: 'Automate recurring charges for rent, mess, laundry and utilities.',
}

export default function RecurringRoutePage() {
  return <RecurringBillingPage />
}
