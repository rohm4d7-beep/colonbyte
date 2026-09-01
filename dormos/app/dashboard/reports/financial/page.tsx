import type { Metadata } from 'next'
import { ReportCategoryPage } from '@/components/reports/report-category-page'

export const metadata: Metadata = { title: 'Financial Reports — DormOS' }

export default function FinancialReportsPage() {
  return <ReportCategoryPage categoryId="financial" />
}
