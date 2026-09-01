import type { Metadata } from 'next'
import { ReportCategoryPage } from '@/components/reports/report-category-page'

export const metadata: Metadata = { title: 'Visitor Reports — DormOS' }

export default function VisitorReportsPage() {
  return <ReportCategoryPage categoryId="visitors" />
}
