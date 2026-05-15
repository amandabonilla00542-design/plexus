/**
 * Logo file: `frontend/public/assets/brand/excession-logo.png`
 *
 * Build URL from `import.meta.env.BASE_URL` (Vite `base`). When `base` is `/`,
 * we must not produce `//assets/...` — that is protocol-relative and breaks loading.
 */
function publicAsset(pathFromPublicRoot) {
  const p = String(pathFromPublicRoot || '').replace(/^\/+/, '')
  let base = import.meta.env.BASE_URL
  if (base == null || base === '' || base === '.') base = '/'
  if (!base.endsWith('/')) base = `${base}/`
  if (base === '/') return `/${p}`
  return `${base}${p}`.replace(/([^:]\/)\/+/g, '$1')
}

export const BRAND_LOGO_PNG = publicAsset('assets/brand/excession-logo.png')
