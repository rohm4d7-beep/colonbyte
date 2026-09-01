'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Menu, Search, Plus, Sun, Moon } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Notifications } from '@/components/dashboard/notifications'
import { ProfileMenu } from '@/components/dashboard/profile-menu'
import { WorkspaceSwitcher } from '@/components/dashboard/workspace-switcher'
import { QUICK_ACTIONS } from '@/constants/dashboard'
import { useTheme } from '@/hooks/use-theme'
import type { AuthUser } from '@/hooks/use-auth'
import type { Workspace } from '@/types/dashboard'

interface TopNavbarProps {
  activeWorkspace: Workspace
  onSwitchWorkspace: (workspace: Workspace) => void
  onOpenSearch: () => void
  onMenuClick: () => void
  workspaces?: Workspace[]
  user?: AuthUser | null
  roleName?: string | null
  onLogout: () => void
}

export function TopNavbar({
  activeWorkspace,
  onSwitchWorkspace,
  onOpenSearch,
  onMenuClick,
  workspaces,
  user,
  roleName,
  onLogout,
}: TopNavbarProps) {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-2 border-b border-gray-200 bg-white/95 px-3 backdrop-blur-sm sm:px-4 lg:px-6 dark:border-border dark:bg-card/95">
      {/* Mobile menu */}
      <button
        onClick={onMenuClick}
        aria-label="Open navigation menu"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-50 focus-visible:ring-3 focus-visible:ring-primary/30 focus-visible:outline-none md:hidden dark:border-border dark:bg-card dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-foreground"
      >
        <Menu className="h-4 w-4" />
      </button>

      {/* Workspace switcher (desktop) */}
      <div className="hidden w-56 shrink-0 lg:block">
        <WorkspaceSwitcher
          active={activeWorkspace}
          onSwitch={onSwitchWorkspace}
          workspaces={workspaces}
        />
      </div>

      {/* Search */}
      <button
        onClick={onOpenSearch}
        aria-label="Open search"
        className="group flex h-9 min-w-0 flex-1 items-center gap-2 rounded-lg border border-gray-200 bg-gray-50/70 px-3 text-left transition-colors hover:bg-gray-50 focus-visible:ring-3 focus-visible:ring-primary/30 focus-visible:outline-none sm:max-w-md dark:border-border dark:bg-muted/70 dark:hover:bg-muted"
      >
        <Search className="h-3.5 w-3.5 shrink-0 text-gray-400" />
        <span className="hidden flex-1 truncate text-sm text-gray-400 sm:block">
          Search students, rooms, payments…
        </span>
        <span className="hidden items-center gap-0.5 sm:flex">
          <kbd className="rounded border border-gray-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-gray-400 dark:border-border dark:bg-card">
            ⌘
          </kbd>
          <kbd className="rounded border border-gray-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-gray-400 dark:border-border dark:bg-card">
            K
          </kbd>
        </span>
      </button>

      <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
        {/* Quick actions */}
        <Popover>
          <PopoverTrigger
            render={
              <button
                aria-label="Quick actions"
                className="flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3 text-sm font-medium text-white shadow-sm shadow-primary/30 transition-colors hover:bg-primary/80 focus-visible:ring-3 focus-visible:ring-primary/40 focus-visible:outline-none"
              />
            }
          >
            <Plus className="h-4 w-4" />
            <span className="hidden md:block">Quick Actions</span>
          </PopoverTrigger>
          <PopoverContent align="end" sideOffset={8} className="w-64 p-1.5">
            <p className="px-2 pt-1 pb-1.5 text-xs font-semibold text-gray-500 uppercase">
              Quick Actions
            </p>
            <div className="flex flex-col">
              {QUICK_ACTIONS.map((action) => {
                const Icon = action.icon
                return (
                  <Link
                    key={action.id}
                    href={action.href}
                    className="flex items-center gap-2.5 rounded-lg px-2 py-2 transition-colors hover:bg-gray-50 focus-visible:ring-3 focus-visible:ring-primary/30 focus-visible:outline-none dark:hover:bg-muted"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent text-primary dark:bg-primary/15 dark:text-primary">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900 dark:text-foreground">
                        {action.label}
                      </span>
                      <span className="text-xs text-gray-400 dark:text-muted-foreground">
                        {action.description}
                      </span>
                    </span>
                  </Link>
                )
              })}
            </div>
          </PopoverContent>
        </Popover>

        {/* Dark mode toggle */}
        <button
          onClick={toggleTheme}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-pressed={isDark}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700 focus-visible:ring-3 focus-visible:ring-primary/30 focus-visible:outline-none dark:border-border dark:bg-card dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-foreground"
        >
          <motion.span
            key={isDark ? 'moon' : 'sun'}
            initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="flex"
          >
            {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </motion.span>
        </button>

        <Notifications />

        <div className="ml-0.5">
          <ProfileMenu user={user ?? null} roleName={roleName} onLogout={onLogout} />
        </div>
      </div>
    </header>
  )
}
