'use client'

import { useCallback, useSyncExternalStore } from 'react'

export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'dormos-theme'

function readStoredTheme(): Theme {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored === 'light' || stored === 'dark') return stored
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  } catch {
    return 'light'
  }
}

export function applyTheme(theme: Theme): void {
  if (typeof document === 'undefined') return
  document.documentElement.classList.toggle('dark', theme === 'dark')
}

// Module-level store shared by every useTheme() consumer, so all toggles
// (landing navbar, dashboard topbar) stay in sync and re-render together.
let cachedTheme: Theme | null = null
const listeners = new Set<() => void>()

function commitTheme(next: Theme) {
  cachedTheme = next
  applyTheme(next)
  try {
    window.localStorage.setItem(STORAGE_KEY, next)
  } catch {
    // ignore storage failures (private mode, etc.)
  }
  listeners.forEach((listener) => listener())
}

function subscribe(callback: () => void) {
  listeners.add(callback)
  return () => listeners.delete(callback)
}

function getSnapshot(): Theme {
  if (cachedTheme === null) cachedTheme = readStoredTheme()
  return cachedTheme
}

// The server (and the client's very first hydration pass) always renders
// 'light' — matching this exactly avoids a hydration mismatch. React then
// re-renders with the real client value once hydration is complete.
function getServerSnapshot(): Theme {
  return 'light'
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const setTheme = useCallback((next: Theme) => commitTheme(next), [])
  const toggleTheme = useCallback(
    () => commitTheme((cachedTheme ?? readStoredTheme()) === 'dark' ? 'light' : 'dark'),
    [],
  )

  return { theme, setTheme, toggleTheme }
}
