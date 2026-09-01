import type { Metadata } from 'next'
import { AuditLogsPage } from '@/components/audit/audit-logs-page'

export const metadata: Metadata = {
  title: 'Audit Logs — DormOS',
  description: 'A complete, tamper-proof record of every action taken in your workspace.',
}

export default function AuditLogsRoutePage() {
  return <AuditLogsPage />
}
