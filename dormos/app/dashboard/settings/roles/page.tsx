import type { Metadata } from 'next'
import { RolesPage } from '@/components/settings/roles-page'

export const metadata: Metadata = {
  title: 'Role Management — DormOS',
  description: 'Define what each role can see and do across the workspace with a permissions matrix.',
}

export default function RolesRoutePage() {
  return <RolesPage />
}
