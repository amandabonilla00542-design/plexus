import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { AUTH_TOKEN_KEY, authFetch } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [checked, setChecked] = useState(false)

  const refresh = useCallback(async () => {
    try {
      const res = await authFetch('/api/auth/me')
      if (res.ok) {
        const data = await res.json()
        setUser(data.user ?? null)
      } else {
        setUser(null)
      }
    } catch {
      setUser(null)
    } finally {
      setChecked(true)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const logout = useCallback(async () => {
    try {
      await authFetch('/api/auth/logout', { method: 'POST' })
    } catch {
      /* ignore */
    }
    try {
      window.localStorage.removeItem(AUTH_TOKEN_KEY)
      window.localStorage.removeItem('layerdodge_access_token')
    } catch {
      /* ignore */
    }
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      checked,
      isAuthed: Boolean(user),
      refresh,
      logout,
    }),
    [user, checked, refresh, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return ctx
}
