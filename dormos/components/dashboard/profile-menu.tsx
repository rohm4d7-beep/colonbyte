'use client'

import {
  CircleUserRound,
  Building2,
  Settings,
  CreditCard,
  LogOut,
  ChevronsUpDown,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { AuthUser } from '@/hooks/use-auth'

function initialsFor(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || 'U'
}

interface ProfileMenuProps {
  user: AuthUser | null
  roleName?: string | null
  onLogout: () => void
}

export function ProfileMenu({ user, roleName, onLogout }: ProfileMenuProps) {
  const displayName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email
    : 'Guest'
  const email = user?.email ?? 'Not signed in'
  const role = roleName ?? 'Member'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            aria-label="Open profile menu"
            className="flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white py-1 pr-1.5 pl-1 transition-colors hover:bg-gray-50 focus-visible:ring-3 focus-visible:ring-primary/30 focus-visible:outline-none dark:border-border dark:bg-card dark:hover:bg-muted"
          />
        }
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-gray-900 text-xs font-semibold text-white">
          {initialsFor(displayName)}
        </span>
        <ChevronsUpDown className="h-3.5 w-3.5 text-gray-400" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className="w-60 p-1.5">
        <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-2.5 dark:bg-muted">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-900 text-sm font-semibold text-white">
            {initialsFor(displayName)}
          </span>
          <div className="min-w-0">
            <DropdownMenuLabel className="truncate px-0 pb-0 text-sm font-semibold text-gray-900 dark:text-foreground">
              {displayName}
            </DropdownMenuLabel>
            <p className="truncate text-xs text-gray-500 dark:text-muted-foreground">
              {email}
            </p>
            <span className="mt-0.5 inline-block rounded-full bg-accent px-1.5 py-px text-[10px] font-medium text-primary dark:bg-primary/15 dark:text-primary">
              {role}
            </span>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <CircleUserRound className="h-4 w-4 text-gray-500" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Building2 className="h-4 w-4 text-gray-500" />
            Workspace
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings className="h-4 w-4 text-gray-500" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuItem>
            <CreditCard className="h-4 w-4 text-gray-500" />
            Billing
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={onLogout}>
          <LogOut className="h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
