/** Dev: empty → `/api` via Vite proxy. Production: Render API (never Cloudflare Pages static host). */
const PRODUCTION_API = 'https://plexus-mh6g.onrender.com'

function resolveApiRoot() {
  const fromEnv = String(import.meta.env.VITE_API_URL || '')
    .trim()
    .replace(/\/$/, '')
  if (fromEnv) return fromEnv
  if (import.meta.env.DEV) return ''
  return PRODUCTION_API
}

export const API_ROOT = resolveApiRoot()

export const AUTH_TOKEN_KEY = 'excession_access_token'
const LEGACY_AUTH_TOKEN_KEY = 'layerdodge_access_token'

function readAccessToken() {
  if (typeof window === 'undefined') return null
  let token = window.localStorage.getItem(AUTH_TOKEN_KEY)
  if (token) return token
  token = window.localStorage.getItem(LEGACY_AUTH_TOKEN_KEY)
  if (token) {
    try {
      window.localStorage.setItem(AUTH_TOKEN_KEY, token)
      window.localStorage.removeItem(LEGACY_AUTH_TOKEN_KEY)
    } catch {
      /* ignore quota / private mode */
    }
  }
  return token
}

export function authFetch(path, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  const token = readAccessToken()
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }
  return fetch(`${API_ROOT}${path}`, {
    method,
    credentials: 'include',
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
}
