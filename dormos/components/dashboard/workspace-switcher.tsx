'use client'

import { Building2, ChevronsUpDown, Check } from 'lucide-react'
import Link from 'next/link'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { WORKSPACES } from '@/constants/dashboard'
import type { Workspace } from '@/types/dashboard'
import { cn } from '@/lib/utils'

interface WorkspaceSwitcherProps {
  active: Workspace
  collapsed?: boolean
  onSwitch: (workspace: Workspace) => void
  workspaces?: Workspace[]
}

export function WorkspaceSwitcher({
  active,
  collapsed = false,
  onSwitch,
  workspaces = WORKSPACES,
}: WorkspaceSwitcherProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            aria-label="Switch workspace"
            className={cn(
              'group flex w-full items-center gap-2.5 rounded-xl p-2 text-left transition-colors duration-150 outline-none hover:bg-gray-50 focus-visible:ring-3 focus-visible:ring-primary/30 dark:hover:bg-muted',
              collapsed && 'justify-center p-2',
            )}
          />
        }
      >
        <span
          className={cn(
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white',
            active.color,
          )}
        >
          {active.initials}
        </span>
        {!collapsed && (
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-sm font-semibold text-gray-900 dark:text-foreground">
              {active.name}
            </span>
            <span className="truncate text-xs text-gray-500 dark:text-muted-foreground">
              {active.tagline}
            </span>
          </span>
        )}
        {!collapsed && (
          <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-gray-400 transition-colors group-hover:text-gray-600 dark:text-muted-foreground dark:group-hover:text-foreground" />
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" side="bottom" className="w-72 p-1.5">
        <DropdownMenuLabel className="px-2 pb-1 text-xs font-semibold text-gray-500 uppercase dark:text-muted-foreground">
          Your hostels
        </DropdownMenuLabel>
        <DropdownMenuGroup>
          {workspaces.map((workspace) => (
            <DropdownMenuItem
              key={workspace.id}
              className="gap-2.5 rounded-lg px-2 py-2"
              onClick={() => onSwitch(workspace)}
            >
              <span
                className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-semibold text-white',
                  workspace.color,
                )}
              >
                {workspace.initials}
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="text-sm font-medium text-gray-900 dark:text-foreground">
                  {workspace.name}
                </span>
                <span className="text-xs text-gray-500 dark:text-muted-foreground">
                  {workspace.location}
                </span>
              </span>
              {workspace.id === active.id && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="gap-2 rounded-lg px-2 py-2"
          render={<Link href="/dashboard/settings/hostels" />}
        >
          <Building2 className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700 dark:text-muted-foreground">
            Add a hostel
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
