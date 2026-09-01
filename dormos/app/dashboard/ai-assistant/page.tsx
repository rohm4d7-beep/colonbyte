import type { Metadata } from 'next'
import { AIChatPage } from '@/components/ai/ai-chat-page'

export const metadata: Metadata = {
  title: 'AI Assistant — DormOS',
  description: 'Ask questions about your hostel and get instant, data-backed answers.',
}

export default function AIAssistantPage() {
  return <AIChatPage />
}
