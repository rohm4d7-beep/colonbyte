import type {
  BedStatus,
  CleaningStatus,
  DocumentStatus,
  FeeStatus,
  MaintenanceStatus,
  RoomStatus,
  StudentStatus,
  TimelineType,
} from '@/types/dorm'
import { cn } from '@/lib/utils'

type BadgeStyle = {
  label: string
  className: string
  dot?: string
}

export const STUDENT_STATUS_STYLES: Record<StudentStatus, BadgeStyle> = {
  Active: {
    label: 'Active',
    className: 'bg-emerald-50 text-emerald-700',
    dot: 'bg-emerald-500',
  },
  Graduated: {
    label: 'Graduated',
    className: 'bg-violet-50 text-violet-700',
    dot: 'bg-violet-500',
  },
  'Check-in Pending': {
    label: 'Check-in Pending',
    className: 'bg-amber-50 text-amber-700',
    dot: 'bg-amber-500',
  },
  'Notice Served': {
    label: 'Notice Served',
    className: 'bg-rose-50 text-rose-700',
    dot: 'bg-rose-500',
  },
  Inactive: {
    label: 'Inactive',
    className: 'bg-gray-100 text-gray-600',
    dot: 'bg-gray-400',
  },
}

export const FEE_STATUS_STYLES: Record<FeeStatus, BadgeStyle> = {
  Paid: {
    label: 'Paid',
    className: 'bg-emerald-50 text-emerald-700',
    dot: 'bg-emerald-500',
  },
  Pending: {
    label: 'Pending',
    className: 'bg-amber-50 text-amber-700',
    dot: 'bg-amber-500',
  },
  Overdue: {
    label: 'Overdue',
    className: 'bg-rose-50 text-rose-700',
    dot: 'bg-rose-500',
  },
}

export const ROOM_STATUS_STYLES: Record<RoomStatus, BadgeStyle> = {
  Occupied: {
    label: 'Occupied',
    className: 'bg-emerald-50 text-emerald-700',
    dot: 'bg-emerald-500',
  },
  Vacant: {
    label: 'Vacant',
    className: 'bg-gray-100 text-gray-600',
    dot: 'bg-gray-400',
  },
  Cleaning: {
    label: 'Cleaning',
    className: 'bg-amber-50 text-amber-700',
    dot: 'bg-amber-500',
  },
  Maintenance: {
    label: 'Maintenance',
    className: 'bg-rose-50 text-rose-700',
    dot: 'bg-rose-500',
  },
}

export const BED_STATUS_STYLES: Record<BedStatus, BadgeStyle> = {
  Occupied: {
    label: 'Occupied',
    className: 'bg-emerald-50 text-emerald-700',
    dot: 'bg-emerald-500',
  },
  Vacant: {
    label: 'Vacant',
    className: 'bg-gray-100 text-gray-600',
    dot: 'bg-gray-400',
  },
  Reserved: {
    label: 'Reserved',
    className: 'bg-accent text-primary',
    dot: 'bg-primary',
  },
  Maintenance: {
    label: 'Maintenance',
    className: 'bg-rose-50 text-rose-700',
    dot: 'bg-rose-500',
  },
}

export const CLEANING_STATUS_STYLES: Record<CleaningStatus, BadgeStyle> = {
  Clean: {
    label: 'Clean',
    className: 'bg-emerald-50 text-emerald-700',
    dot: 'bg-emerald-500',
  },
  'Needs Cleaning': {
    label: 'Needs Cleaning',
    className: 'bg-amber-50 text-amber-700',
    dot: 'bg-amber-500',
  },
  'In Progress': {
    label: 'In Progress',
    className: 'bg-accent text-primary',
    dot: 'bg-primary',
  },
}

export const MAINTENANCE_STATUS_STYLES: Record<MaintenanceStatus, BadgeStyle> = {
  None: {
    label: 'None',
    className: 'bg-gray-100 text-gray-600',
    dot: 'bg-gray-400',
  },
  Scheduled: {
    label: 'Scheduled',
    className: 'bg-accent text-primary',
    dot: 'bg-primary',
  },
  'In Progress': {
    label: 'In Progress',
    className: 'bg-amber-50 text-amber-700',
    dot: 'bg-amber-500',
  },
  Overdue: {
    label: 'Overdue',
    className: 'bg-rose-50 text-rose-700',
    dot: 'bg-rose-500',
  },
}

export const DOCUMENT_STATUS_STYLES: Record<DocumentStatus, BadgeStyle> = {
  Verified: {
    label: 'Verified',
    className: 'bg-emerald-50 text-emerald-700',
    dot: 'bg-emerald-500',
  },
  Pending: {
    label: 'Pending',
    className: 'bg-amber-50 text-amber-700',
    dot: 'bg-amber-500',
  },
  Expired: {
    label: 'Expired',
    className: 'bg-rose-50 text-rose-700',
    dot: 'bg-rose-500',
  },
}

export const TIMELINE_TYPE_STYLES: Record<
  TimelineType,
  { label: string; className: string }
> = {
  admitted: { label: 'Admission', className: 'bg-accent text-primary' },
  room_allocated: { label: 'Room', className: 'bg-violet-50 text-violet-600' },
  fee_received: { label: 'Payment', className: 'bg-emerald-50 text-emerald-600' },
  complaint: { label: 'Complaint', className: 'bg-rose-50 text-rose-600' },
  maintenance: { label: 'Maintenance', className: 'bg-amber-50 text-amber-600' },
  mess_plan: { label: 'Mess', className: 'bg-accent text-primary' },
  documents: { label: 'Documents', className: 'bg-accent text-primary' },
}

export const MAINTENANCE_ENTRY_STYLES: Record<
  'Resolved' | 'In Progress' | 'Scheduled' | 'Overdue',
  BadgeStyle
> = {
  Resolved: {
    label: 'Resolved',
    className: 'bg-emerald-50 text-emerald-700',
    dot: 'bg-emerald-500',
  },
  'In Progress': {
    label: 'In Progress',
    className: 'bg-amber-50 text-amber-700',
    dot: 'bg-amber-500',
  },
  Scheduled: {
    label: 'Scheduled',
    className: 'bg-accent text-primary',
    dot: 'bg-primary',
  },
  Overdue: {
    label: 'Overdue',
    className: 'bg-rose-50 text-rose-700',
    dot: 'bg-rose-500',
  },
}

export const PAYMENT_STATUS_STYLES: Record<
  'Completed' | 'Pending' | 'Failed',
  BadgeStyle
> = {
  Completed: {
    label: 'Completed',
    className: 'bg-emerald-50 text-emerald-700',
    dot: 'bg-emerald-500',
  },
  Pending: {
    label: 'Pending',
    className: 'bg-amber-50 text-amber-700',
    dot: 'bg-amber-500',
  },
  Failed: {
    label: 'Failed',
    className: 'bg-rose-50 text-rose-700',
    dot: 'bg-rose-500',
  },
}

export function StatusBadge({
  style,
  showDot = true,
  className,
}: {
  style: BadgeStyle
  showDot?: boolean
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex h-5 w-fit shrink-0 items-center gap-1.5 rounded-full px-2 text-xs font-medium whitespace-nowrap',
        style.className,
        className,
      )}
    >
      {showDot && <span className={cn('h-1.5 w-1.5 rounded-full', style.dot)} />}
      {style.label}
    </span>
  )
}
