/** Session key for `X-Admin-Secret` (must match `App` unlock flow). */
export const ADMIN_SESSION_KEY = 'plexus_admin_secret'

/** Absolute API origin for static builds (no `/api` proxy). Example: `http://localhost:5000` */
function adminApiUrl(path) {
  if (/^https?:\/\//i.test(path)) return path
  const base = String(import.meta.env.VITE_API_BASE_URL || '')
    .trim()
    .replace(/\/$/, '')
  if (!base) return path
  const p = path.startsWith('/') ? path : `/${path}`
  return `${base}${p}`
}

export function adminHeaders() {
  const secret = sessionStorage.getItem(ADMIN_SESSION_KEY) || ''
  return {
    'Content-Type': 'application/json',
    ...(secret ? { 'X-Admin-Secret': secret } : {}),
  }
}

export async function adminFetch(path, opts = {}) {
  const url = adminApiUrl(path)
  const res = await fetch(url, {
    ...opts,
    headers: { ...adminHeaders(), ...(opts.headers || {}) },
  })
  const data = await res.json().catch(() => ({}))
  return { res, data }
}
