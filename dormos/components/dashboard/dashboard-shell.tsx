'use client'

import { useCallback, useEffect, useState } from 'react'
import { Sidebar } from '@/components/dashboard/sidebar'
import { TopNavbar } from '@/components/dashboard/top-navbar'
import { SearchModal } from '@/components/dashboard/search-modal'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { WORKSPACES } from '@/constants/dashboard'
import { useAuth } from '@/hooks/use-auth'
import type { Workspace } from '@/types/dashboard'

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { user, workspaces, activeRole, logout } = useAuth()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(null)

  const workspaceList = workspaces.length > 0 ? workspaces : WORKSPACES
  const activeWorkspace =
    workspaceList.find((w) => w.id === activeWorkspaceId) ?? workspaceList[0]

  const handleOpenSearch = useCallback(() => setSearchOpen(true), [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setSearchOpen((prev) => !prev)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const switchWorkspace = useCallback((workspace: Workspace) => {
    setActiveWorkspaceId(workspace.id)
  }, [])

  return (
    <div className="flex min-h-screen bg-gray-50/70 dark:bg-background">
      {/* Desktop & tablet sidebar */}
      <div className="sticky top-0 hidden h-screen shrink-0 md:block">
        <Sidebar
          collapsed={collapsed}
          activeWorkspace={activeWorkspace}
          onToggleCollapsed={() => setCollapsed((prev) => !prev)}
          onSwitchWorkspace={switchWorkspace}
          workspaces={workspaces}
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <TopNavbar
          activeWorkspace={activeWorkspace}
          onSwitchWorkspace={switchWorkspace}
          onOpenSearch={handleOpenSearch}
          onMenuClick={() => setMobileOpen(true)}
          workspaces={workspaces}
          user={user}
          roleName={activeRole?.name ?? null}
          onLogout={logout}
        />
        <main className="min-w-0 flex-1 px-4 pt-6 pb-10 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>

      {/* Mobile sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side="left"
          showCloseButton={false}
          className="w-[85vw] max-w-[300px] gap-0 p-0"
        >
          <SheetTitle className="sr-only">Dashboard navigation</SheetTitle>
          <Sidebar
            collapsed={false}
            activeWorkspace={activeWorkspace}
            onToggleCollapsed={() => {}}
            onSwitchWorkspace={(workspace) => {
              switchWorkspace(workspace)
              setMobileOpen(false)
            }}
            onNavigate={() => setMobileOpen(false)}
            className="w-full border-0"
            workspaces={workspaces}
          />
        </SheetContent>
      </Sheet>

      <SearchModal
        open={searchOpen}
        onOpenChange={setSearchOpen}
        onNavigate={() => setMobileOpen(false)}
      />
    </div>
  )
}
