/**
 * Admin loads the portrait from the **main frontend** static host (not Wikimedia).
 * Dev default: `http://localhost:5173` when `VITE_MAIN_ORIGIN` is unset.
 * Production: set `VITE_MAIN_ORIGIN=https://your-main-app.example.com` at build time,
 * or copy `public/assets/quote/elon-portrait.{png,jpg}` into this app’s `public/` folder.
 */
function getMainSiteOrigin() {
  const v = import.meta.env?.VITE_MAIN_ORIGIN
  if (v != null && String(v).trim() !== '') return String(v).trim().replace(/\/$/, '')
  if (import.meta.env?.DEV) return 'http://localhost:5173'
  return ''
}

function fromMain(origin) {
  return [
    `${origin}/assets/quote/elon-portrait.png`,
    `${origin}/assets/quote/elon-portrait.jpg`,
  ]
}

export function getElonPortraitSources() {
  const main = getMainSiteOrigin()
  const tail = ['/assets/quote/elon-portrait.png', '/assets/quote/elon-portrait.jpg']
  if (!main) return tail
  return [...fromMain(main), ...tail]
}

export const ELON_PORTRAIT_SOURCES = getElonPortraitSources()
