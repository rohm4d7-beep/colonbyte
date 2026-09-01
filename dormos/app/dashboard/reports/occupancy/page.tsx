import type { Metadata } from 'next'
import { ReportCategoryPage } from '@/components/reports/report-category-page'

export const metadata: Metadata = { title: 'Occupancy Reports — DormOS' }

export default function OccupancyReportsPage() {
  return <ReportCategoryPage categoryId="occupancy" />
}
