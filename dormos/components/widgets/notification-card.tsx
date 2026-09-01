import { Users, FileText, CreditCard, Wrench, DoorOpen, Package, UtensilsCrossed, UserCheck, Wallet } from 'lucide-react'
import type { AppNotification, NotificationType } from '@/types/dashboard'
import { cn } from '@/lib/utils'

const TYPE_STYLES: Record<NotificationType, { icon: typeof Users; classes: string }> = {
  student: { icon: Users, classes: 'bg-accent text-primary' },
  report: { icon: FileText, classes: 'bg-amber-50 text-amber-600' },
  payment: { icon: CreditCard, classes: 'bg-emerald-50 text-emerald-600' },
  maintenance: { icon: Wrench, classes: 'bg-violet-50 text-violet-600' },
  room: { icon: DoorOpen, classes: 'bg-accent text-primary' },
  inventory: { icon: Package, classes: 'bg-orange-50 text-orange-600' },
  mess: { icon: UtensilsCrossed, classes: 'bg-yellow-50 text-yellow-600' },
  visitor: { icon: UserCheck, classes: 'bg-teal-50 text-teal-600' },
  staff: { icon: Wallet, classes: 'bg-rose-50 text-rose-600' },
}

interface NotificationCardProps {
  notification: AppNotification
  onOpen?: () => void
}

export function NotificationCard({ notification, onOpen }: NotificationCardProps) {
  const config = TYPE_STYLES[notification.type]
  const Icon = config.icon
  return (
    <button
      onClick={onOpen}
      className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 focus-visible:ring-3 focus-visible:ring-primary/30 focus-visible:outline-none"
    >
      <span
        className={cn(
          'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
          config.classes,
        )}
      >
        <Icon className="h-4 w-4" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-900">
            {notification.title}
          </span>
          {!notification.read && (
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
          )}
        </span>
        <span className="text-xs leading-relaxed text-gray-500">
          {notification.description}
        </span>
        <span className="text-[11px] text-gray-400">{notification.time}</span>
      </span>
    </button>
  )
}
