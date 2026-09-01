import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { initialsOf } from '@/lib/format'

const AVATAR_PALETTE = [
  'bg-primary',
  'bg-violet-600',
  'bg-emerald-600',
  'bg-primary',
  'bg-rose-600',
  'bg-amber-600',
  'bg-primary',
  'bg-teal-600',
  'bg-pink-600',
  'bg-primary',
]

function colorFor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0
  }
  return AVATAR_PALETTE[hash % AVATAR_PALETTE.length]
}

export function avatarColor(name: string): string {
  return colorFor(name)
}

export function AvatarInitials({
  name,
  size = 'default',
  className,
  textClassName,
}: {
  name: string
  size?: 'sm' | 'default' | 'lg'
  className?: string
  textClassName?: string
}) {
  return (
    <Avatar
      size={size}
      className={cn('ring-1 ring-black/5', className)}
    >
      <AvatarFallback
        className={cn('font-semibold text-white', colorFor(name), textClassName)}
      >
        {initialsOf(name)}
      </AvatarFallback>
    </Avatar>
  )
}
