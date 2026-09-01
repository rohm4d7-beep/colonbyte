import type { Metadata } from 'next'
import { FeePlansPage } from '@/components/finance/fee-plans-page'

export const metadata: Metadata = {
  title: 'Fee Plans — DormOS',
  description: 'Define pricing structures for rooms, mess and hostel services.',
}

export default function FeePlansRoutePage() {
  return <FeePlansPage />
}
