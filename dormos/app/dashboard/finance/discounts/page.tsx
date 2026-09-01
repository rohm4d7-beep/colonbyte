import type { Metadata } from 'next'
import { DiscountsPage } from '@/components/finance/discounts-page'

export const metadata: Metadata = {
  title: 'Discounts — DormOS',
  description: 'Apply sibling, early-payment and seasonal discounts automatically.',
}

export default function DiscountsRoutePage() {
  return <DiscountsPage />
}
