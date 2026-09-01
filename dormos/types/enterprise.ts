import type { LucideIcon } from 'lucide-react'

export type AIConversation = {
  id: string
  title: string
  preview: string
  updated: string
  pinned: boolean
  messages: number
}

export type AIMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
  time: string
}

export type SuggestionCategory = 'Finance' | 'Operations' | 'Mess' | 'Reports' | 'Students'

export type AISuggestion = {
  id: string
  label: string
  prompt: string
  icon: LucideIcon
  category: SuggestionCategory
}

export type AIInsightCard = {
  id: string
  headline: string
  detail: string
  sentiment: 'positive' | 'negative' | 'neutral'
  tag: string
  metric: string
  delta: string
  series: { label: string; value: number }[]
}

export type AIForecast = {
  id: string
  title: string
  description: string
  value: string
  delta: string
  positive: boolean
  series: { label: string; value: number }[]
  color: string
}

export type ReportCategory = {
  id: string
  name: string
  description: string
  icon: LucideIcon
  accent: string
  href: string
}

export type ReportItem = {
  id: string
  title: string
  description: string
  category: string
  period: string
  generatedBy: 'AI' | 'Manual'
  size: string
  pages: number
  updated: string
  status: 'Ready' | 'Generating' | 'Scheduled'
}

export type ReportRow = {
  id: string
  label: string
  value: string
  change: number
  status: 'up' | 'down' | 'flat'
}

export type AuditEvent = {
  id: string
  actor: string
  actorRole: string
  action: string
  module: string
  target: string
  timestamp: string
  ip: string
  severity: 'info' | 'warning' | 'danger'
}

export type NotificationCategory = 'Finance' | 'Maintenance' | 'Students' | 'Visitors' | 'Inventory' | 'AI' | 'System'

export type NotificationItem = {
  id: string
  title: string
  description: string
  category: NotificationCategory
  time: string
  read: boolean
  archived: boolean
}

export type Hostel = {
  id: string
  name: string
  location: string
  initials: string
  color: string
  tagline: string
  beds: number
  students: number
  occupancy: number
  plan: 'Starter' | 'Professional' | 'Enterprise'
  status: 'Active' | 'Trial' | 'Suspended'
}

export type SubscriptionPlan = {
  id: string
  name: string
  price: number
  period: string
  features: string[]
  highlighted?: boolean
}

export type UsageStat = {
  id: string
  label: string
  used: number
  limit: number
  unit: string
  accent: string
}

export type HostelMember = {
  id: string
  name: string
  email: string
  role: string
  status: 'Active' | 'Invited'
  initials: string
  color: string
}

export type Role = {
  id: string
  name: string
  description: string
  members: number
  accent: string
  permissions: number
  builtIn?: boolean
}

export type PermissionAction = 'create' | 'read' | 'update' | 'delete'

export type PermissionModuleName =
  | 'Students'
  | 'Rooms'
  | 'Finance'
  | 'Inventory'
  | 'Reports'
  | 'Visitors'
  | 'Maintenance'
  | 'Staff'
  | 'Settings'

export type PermissionCell = Record<PermissionAction, boolean>

export type Permissions = Record<PermissionModuleName, PermissionCell>
