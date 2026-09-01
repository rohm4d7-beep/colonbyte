export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

const TOKEN_KEY = 'dormos-token'
const REFRESH_TOKEN_KEY = 'dormos-refresh-token'
export const USER_KEY = 'dormos-user'
export const MEMBERSHIPS_KEY = 'dormos-memberships'

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem(TOKEN_KEY)
}

export function getActiveHostelId(): string | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(MEMBERSHIPS_KEY)
    if (!raw) return null
    const memberships = JSON.parse(raw) as Array<{
      hostel?: { id: string } | null
      organization?: { id: string }
    }>
    return memberships.find((m) => m.hostel)?.hostel?.id ?? null
  } catch {
    return null
  }
}

export function setSession(payload: {
  accessToken: string
  refreshToken: string
  user: unknown
  memberships?: unknown
}): void {
  window.localStorage.setItem(TOKEN_KEY, payload.accessToken)
  window.localStorage.setItem(REFRESH_TOKEN_KEY, payload.refreshToken)
  window.localStorage.setItem(USER_KEY, JSON.stringify(payload.user))
  if (payload.memberships) {
    window.localStorage.setItem(MEMBERSHIPS_KEY, JSON.stringify(payload.memberships))
  }
}

export function clearSession(): void {
  window.localStorage.removeItem(TOKEN_KEY)
  window.localStorage.removeItem(REFRESH_TOKEN_KEY)
  window.localStorage.removeItem(USER_KEY)
  window.localStorage.removeItem(MEMBERSHIPS_KEY)
}

export async function fetchMe(): Promise<{ user: unknown; memberships: unknown[] }> {
  const token = getToken()
  if (!token) throw new Error('Not authenticated')
  const res = await fetch(`${API_BASE}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
    credentials: 'include',
  })
  if (!res.ok) throw new Error('Session expired')
  return res.json()
}

export async function logoutApi(): Promise<void> {
  const refreshToken =
    typeof window !== 'undefined'
      ? window.localStorage.getItem(REFRESH_TOKEN_KEY)
      : null
  try {
    await fetch(`${API_BASE}/api/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
      credentials: 'include',
    })
  } catch {
    // Ignore network errors on logout; always clear local session.
  }
}
