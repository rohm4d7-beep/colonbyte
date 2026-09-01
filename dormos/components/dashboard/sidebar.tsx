'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Building2, PanelLeftClose, PanelLeftOpen, ChevronsUpDown } from 'lucide-react'
import { SIDEBAR_GROUPS } from '@/constants/dashboard'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { WorkspaceSwitcher } from '@/components/dashboard/workspace-switcher'
import type { Workspace } from '@/types/dashboard'
import { cn } from '@/lib/utils'

interface SidebarProps {
  collapsed: boolean
  activeWorkspace: Workspace
  onToggleCollapsed: () => void
  onSwitchWorkspace: (workspace: Workspace) => void
  onNavigate?: () => void
  className?: string
  workspaces?: Workspace[]
}

export function Sidebar({
  collapsed,
  activeWorkspace,
  onToggleCollapsed,
  onSwitchWorkspace,
  onNavigate,
  className,
  workspaces,
}: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside
      data-collapsed={collapsed}
      className={cn(
        'flex h-full w-64 flex-col border-r border-gray-200 bg-white transition-[width] duration-300 ease-in-out data-collapsed:w-[76px] dark:border-border dark:bg-card',
        className,
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          'flex shrink-0 items-center gap-2.5 border-b border-gray-100 px-4 py-4 dark:border-border',
          collapsed && 'justify-center px-2',
        )}
      >
        <Link
          href="/dashboard"
          onClick={onNavigate}
          className="flex items-center gap-2.5"
          aria-label="DormOS dashboard home"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-sm shadow-primary/30">
            <Building2 className="h-5 w-5 text-white" strokeWidth={2.5} />
          </span>
        </Link>
        {!collapsed && (
          <div className="min-w-0">
            <div className="text-lg leading-tight font-bold tracking-tight text-gray-900 dark:text-foreground">
              DormOS
            </div>
            <div className="truncate text-[11px] leading-tight text-gray-400 dark:text-muted-foreground">
              Run smarter hostels with AI
            </div>
          </div>
        )}
      </div>

      {/* Workspace switcher (mobile & tablet; desktop uses the top bar) */}
      <div className="shrink-0 border-b border-gray-100 p-2 lg:hidden dark:border-border">
        <WorkspaceSwitcher
          active={activeWorkspace}
          collapsed={collapsed}
          onSwitch={onSwitchWorkspace}
          workspaces={workspaces}
        />
      </div>

      {/* Scrollable navigation */}
      <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-3" aria-label="Dashboard">
        <TooltipProvider delay={300}>
          <div className="flex flex-col gap-4">
            {SIDEBAR_GROUPS.map((group) => (
              <div key={group.label}>
                {!collapsed && (
                  <div className="mb-1.5 px-2 text-[11px] font-semibold tracking-wider text-gray-400 uppercase dark:text-muted-foreground">
                    {group.label}
                  </div>
                )}
                <ul className="flex flex-col gap-0.5">
                  {group.items.map((item) => {
                    const active = pathname === item.href
                    const Icon = item.icon
                    const content = (
                      <Link
                        href={item.href}
                        onClick={onNavigate}
                        aria-current={active ? 'page' : undefined}
                        className={cn(
                          'group relative flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm font-medium transition-all duration-150 outline-none focus-visible:ring-3 focus-visible:ring-primary/30',
                          active
                            ? 'bg-accent text-primary dark:bg-primary/15 dark:text-primary'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-foreground',
                          collapsed && 'justify-center px-0',
                        )}
                      >
                        <Icon
                          className={cn(
                            'h-[18px] w-[18px] shrink-0 transition-colors',
                            active
                              ? 'text-primary dark:text-primary'
                              : 'text-gray-400 group-hover:text-gray-600 dark:text-muted-foreground dark:group-hover:text-foreground',
                          )}
                          strokeWidth={2}
                        />
                        {!collapsed && (
                          <span className="flex-1 truncate">{item.label}</span>
                        )}
                        {!collapsed && item.badge && (
                          <span
                            className={cn(
                              'rounded-full px-1.5 py-0.5 text-[10px] font-semibold',
                              active
                                ? 'bg-accent text-primary dark:bg-primary/20 dark:text-primary'
                                : 'bg-gray-100 text-gray-500 dark:bg-muted dark:text-muted-foreground',
                            )}
                          >
                            {item.badge}
                          </span>
                        )}
                        {active && (
                          <motion.span
                            layoutId="sidebar-active"
                            className={cn(
                              'absolute inset-0 -z-10 rounded-xl bg-accent ring-1 ring-primary/15 dark:bg-primary/15 dark:ring-primary/20',
                              collapsed && 'rounded-lg',
                            )}
                            transition={{
                              type: 'spring',
                              stiffness: 380,
                              damping: 32,
                            }}
                          />
                        )}
                      </Link>
                    )

                    if (collapsed) {
                      return (
                        <li key={item.href}>
                          <Tooltip>
                            <TooltipTrigger render={<span className="block" />}>
                              {content}
                            </TooltipTrigger>
                            <TooltipContent
                              side="right"
                              sideOffset={12}
                              className="flex items-center gap-2"
                            >
                              <span>{item.label}</span>
                              {item.badge && (
                                <span className="rounded-full bg-white/20 px-1.5 text-[10px] font-semibold">
                                  {item.badge}
                                </span>
                              )}
                            </TooltipContent>
                          </Tooltip>
                        </li>
                      )
                    }

                    return <li key={item.href}>{content}</li>
                  })}
                </ul>
              </div>
            ))}
          </div>
        </TooltipProvider>
      </nav>

      {/* Collapse toggle */}
      <div className="shrink-0 border-t border-gray-100 p-2 dark:border-border">
        <button
          onClick={onToggleCollapsed}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={cn(
            'flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm font-medium text-gray-500 transition-colors duration-150 hover:bg-gray-50 hover:text-gray-900 focus-visible:ring-3 focus-visible:ring-primary/30 focus-visible:outline-none dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-foreground',
            collapsed && 'justify-center px-0',
          )}
        >
          {collapsed ? (
            <PanelLeftOpen className="h-[18px] w-[18px]" />
          ) : (
            <>
              <PanelLeftClose className="h-[18px] w-[18px]" />
              <span>Collapse</span>
              <ChevronsUpDown className="ml-auto h-3.5 w-3.5 text-gray-300 dark:text-muted-foreground" />
            </>
          )}
        </button>
      </div>
    </aside>
  )
}
