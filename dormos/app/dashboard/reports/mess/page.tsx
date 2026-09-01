import type { Metadata } from 'next'
import { ReportCategoryPage } from '@/components/reports/report-category-page'

export const metadata: Metadata = { title: 'Mess Reports — DormOS' }

export default function MessReportsPage() {
  return <ReportCategoryPage categoryId="mess" />
}
