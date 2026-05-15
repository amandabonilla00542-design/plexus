import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'excession-theme'
const LEGACY_THEME_KEYS = ['layerdodge-theme', 'plexus-theme']

const getStoredTheme = () => {
  if (typeof window === 'undefined') return 'light'
  let v = window.localStorage.getItem(STORAGE_KEY)
  if (v == null) {
    for (const key of LEGACY_THEME_KEYS) {
      const old = window.localStorage.getItem(key)
      if (old === 'dark' || old === 'light') {
        v = old
        try {
          window.localStorage.removeItem(key)
        } catch {
          /* ignore */
        }
        break
      }
    }
  }
  return v === 'dark' ? 'dark' : 'light'
}

const ThemeContext = createContext({
  theme: 'light',
  setTheme: () => {},
  toggleTheme: () => {},
})

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(getStoredTheme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    window.localStorage.setItem(STORAGE_KEY, theme)
  }, [theme])

  const setTheme = useCallback((next) => {
    setThemeState(next === 'dark' ? 'dark' : 'light')
  }, [])

  const toggleTheme = useCallback(() => {
    setThemeState((t) => (t === 'dark' ? 'light' : 'dark'))
  }, [])

  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme }),
    [theme, setTheme, toggleTheme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  return useContext(ThemeContext)
}
