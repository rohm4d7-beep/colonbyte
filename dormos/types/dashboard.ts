import type { LucideIcon } from 'lucide-react'

export type Workspace = {
  id: string
  name: string
  tagline: string
  location: string
  initials: string
  color: string
}

export type SidebarGroup = {
  label: string
  items: SidebarItem[]
}

export type SidebarItem = {
  label: string
  href: string
  icon: LucideIcon
  badge?: string
}

export type NotificationType =
  | 'student'
  | 'report'
  | 'payment'
  | 'maintenance'
  | 'room'
  | 'inventory'
  | 'mess'
  | 'visitor'
  | 'staff'

export type AppNotification = {
  id: string
  title: string
  description: string
  time: string
  read: boolean
  type: NotificationType
}

export type SearchResultType =
  | 'Students'
  | 'Rooms'
  | 'Payments'
  | 'Reports'
  | 'Staff'
  | 'Settings'
  | 'Inventory'
  | 'Visitors'
  | 'Tickets'
  | 'Mess'
  | 'Suppliers'
  | 'AI'
  | 'Roles'
  | 'Hostels'
  | 'Notifications'
  | 'Audit'

export type SearchResult = {
  id: string
  type: SearchResultType
  title: string
  subtitle: string
  href: string
}

export type StatWidget = {
  id: string
  label: string
  value: string
  change: string
  positive: boolean
  icon: LucideIcon
  accent: 'blue' | 'emerald' | 'violet' | 'amber' | 'rose' | 'cyan'
}

export type RoomStatus = 'Occupied' | 'Vacant' | 'Cleaning' | 'Maintenance'

export type RoomSnapshotItem = {
  id: string
  room: string
  status: RoomStatus
  student?: string
}

export type StudentSnapshotItem = {
  id: string
  name: string
  room: string
  status: 'Active' | 'Check-in Pending' | 'Notice Served'
  feeStatus: 'Paid' | 'Pending' | 'Overdue'
  initials: string
  color: string
}

export type PaymentSnapshotItem = {
  id: string
  student: string
  room: string
  amount: number
  method: 'JazzCash' | 'Easypaisa' | 'Card' | 'Cash' | 'Bank'
  date: string
  status: 'Completed' | 'Pending' | 'Failed'
}

export type ActivityItem = {
  id: string
  title: string
  description: string
  time: string
  type: 'payment' | 'checkin' | 'room' | 'maintenance' | 'visitor' | 'ai'
}

export type UpcomingEvent = {
  id: string
  title: string
  description: string
  date: string
  time: string
  severity: 'danger' | 'warning' | 'info' | 'success'
}

export type AIInsight = {
  id: string
  headline: string
  detail: string
  sentiment: 'positive' | 'negative' | 'neutral'
  tag: string
}

export type QuickAction = {
  id: string
  label: string
  description: string
  icon: LucideIcon
  href: string
}
