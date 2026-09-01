import type { Metadata } from 'next'
import { ReportCategoryPage } from '@/components/reports/report-category-page'

export const metadata: Metadata = { title: 'Inventory Reports — DormOS' }

export default function InventoryReportsPage() {
  return <ReportCategoryPage categoryId="inventory" />
}
