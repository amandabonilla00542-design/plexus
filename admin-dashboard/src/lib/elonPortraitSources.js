/**
 * Portrait fallbacks for header avatar + desk profile.
 * Production: set `VITE_MAIN_ORIGIN` at build (defaults to main marketing site).
 */
const ELON_PORTRAIT_COMMONS =
  'https://upload.wikimedia.org/wikipedia/commons/3/34/Elon_Musk_Royal_Society_%28crop2%29.jpg'

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
    `${origin}/assets/brand/excession-logo.png`,
  ]
}

export function getElonPortraitSources() {
  const main = getMainSiteOrigin()
  const local = ['/assets/quote/elon-portrait.png', '/assets/quote/elon-portrait.jpg']
  if (!main) return [...local, ELON_PORTRAIT_COMMONS]
  return [...fromMain(main), ...local, ELON_PORTRAIT_COMMONS]
}

export const ELON_PORTRAIT_SOURCES = getElonPortraitSources()
