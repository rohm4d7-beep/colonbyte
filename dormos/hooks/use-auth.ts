'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { clearSession, fetchMe, logoutApi, MEMBERSHIPS_KEY, USER_KEY } from '@/lib/api'
import type { Workspace } from '@/types/dashboard'

export type AuthUser = {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  avatarUrl: string | null
}

export type HostelMembership = {
  id: string
  status: string
  organization: { id: string; name: string; currency: string }
  hostel: {
    id: string
    name: string
    location: string
    initials: string
    color: string
    plan: string
  } | null
  role: { id: string; name: string; type: string; permissions: unknown[] }
}

function readStored<T>(key: string): T | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

function membershipToWorkspace(m: HostelMembership): Workspace {
  const hostel = m.hostel
  return {
    id: hostel?.id ?? m.organization.id,
    name: hostel?.name ?? m.organization.name,
    tagline: hostel ? `${hostel.plan} plan` : 'Organization',
    location: hostel?.location ?? '—',
    initials: hostel?.initials ?? m.organization.name.slice(0, 2).toUpperCase(),
    color: hostel?.color ?? 'bg-blue-600',
  }
}

export function useAuth() {
  const router = useRouter()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [memberships, setMemberships] = useState<HostelMembership[]>([])

  const workspaces: Workspace[] = memberships.map(membershipToWorkspace)

  const applySession = useCallback((u: AuthUser, m: HostelMembership[]) => {
    setUser(u)
    setMemberships(m)
    window.localStorage.setItem(USER_KEY, JSON.stringify(u))
    window.localStorage.setItem(MEMBERSHIPS_KEY, JSON.stringify(m))
  }, [])

  useEffect(() => {
    let cancelled = false
    Promise.resolve()
      .then(() => {
        if (cancelled) return
        const storedUser = readStored<AuthUser>(USER_KEY)
        const storedMemberships = readStored<HostelMembership[]>(MEMBERSHIPS_KEY)
        if (storedUser || storedMemberships?.length) {
          setUser(storedUser)
          setMemberships(storedMemberships ?? [])
        }
      })
      .then(() => fetchMe())
      .then((data) => {
        if (cancelled) return
        applySession(data.user as AuthUser, (data.memberships ?? []) as HostelMembership[])
      })
      .catch(() => {
        // Invalid/expired session — keep whatever is stored locally.
      })
    return () => {
      cancelled = true
    }
  }, [applySession])

  const logout = useCallback(async () => {
    await logoutApi()
    clearSession()
    setUser(null)
    setMemberships([])
    router.push('/login')
  }, [router])

  const activeRole =
    memberships.find((m) => m.hostel)?.role ?? memberships[0]?.role ?? null

  return { user, memberships, workspaces, activeRole, applySession, logout }
}
