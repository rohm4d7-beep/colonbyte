import type { Metadata } from 'next'
import { AIInsightsPage } from '@/components/ai/ai-insights-page'

export const metadata: Metadata = {
  title: 'AI Insights — DormOS',
  description: 'Automatically generated insights, forecasts and recommendations from your hostel data.',
}

export default function AIInsightsRoutePage() {
  return <AIInsightsPage />
}
