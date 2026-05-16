/**
 * Live DOGE/USD for book conversion. Book fields (`yieldPrincipalUsdt`, etc.) are USD.
 * DOGE on-chain deposits credit: bookUsd = amountDoge × rate.
 *
 * CoinGecko is called at most once per 90s per server (shared in-flight + cache).
 */
const { MIN_ACTIVATION_USD } = require('./depositRail')

const COINGECKO_URL =
  'https://api.coingecko.com/api/v3/simple/price?ids=dogecoin&vs_currencies=usd'

/** How long to reuse the last good CoinGecko price before calling again. */
const TTL_MS = 90_000
/** If CoinGecko fails, reuse cache up to this age. */
const MAX_STALE_MS = 600_000
/** Last-resort desk rate when API and cache are unavailable. */
const FALLBACK_DOGE_USD = 0.11

let cache = null
/** @type {Promise<object> | null} */
let inflight = null

async function fetchLiveRate() {
  const res = await fetch(COINGECKO_URL, {
    headers: { accept: 'application/json' },
    signal: AbortSignal.timeout(10_000),
  })
  if (res.status === 429) {
    const err = new Error('CoinGecko rate limit (429)')
    err.code = 'RATE_LIMIT'
    throw err
  }
  if (!res.ok) throw new Error(`CoinGecko ${res.status}`)
  const data = await res.json()
  const r = Number(data?.dogecoin?.usd)
  if (!Number.isFinite(r) || r <= 0) throw new Error('invalid DOGE/USD from CoinGecko')
  return r
}

function snapshotFrom(rate, source) {
  return {
    dogeUsd: rate,
    source,
    updatedAt: new Date().toISOString(),
    minActivationUsd: MIN_ACTIVATION_USD,
  }
}

function staleCacheIfFreshEnough() {
  if (!cache?.snapshot?.dogeUsd) return null
  const age = Date.now() - cache.at
  if (age > MAX_STALE_MS) return null
  const source = age <= TTL_MS ? cache.snapshot.source : 'cache_stale'
  return snapshotFrom(cache.snapshot.dogeUsd, source)
}

async function refreshRate() {
  let rate
  let source = 'coingecko'
  try {
    rate = await fetchLiveRate()
  } catch (err) {
    const stale = staleCacheIfFreshEnough()
    if (stale) {
      if (err.code === 'RATE_LIMIT') {
        console.warn('[dogeUsdRate] rate limited — using cached rate', stale.dogeUsd)
      } else {
        console.warn('[dogeUsdRate]', err?.message || err, '→ cached', stale.dogeUsd)
      }
      return stale
    }
    rate = FALLBACK_DOGE_USD
    source = 'fallback'
    console.warn('[dogeUsdRate]', err?.message || err, '→ fallback', rate)
  }

  const snap = snapshotFrom(rate, source)
  cache = { at: Date.now(), snapshot: snap }
  return { ...snap }
}

/**
 * @returns {Promise<{ dogeUsd: number, source: string, updatedAt: string, minActivationUsd: number }>}
 */
async function getDogeUsdRateSnapshot() {
  const now = Date.now()
  if (cache && now - cache.at < TTL_MS) {
    return { ...cache.snapshot }
  }

  if (inflight) {
    return inflight
  }

  inflight = refreshRate()
    .catch((err) => {
      const stale = staleCacheIfFreshEnough()
      if (stale) return stale
      throw err
    })
    .finally(() => {
      inflight = null
    })

  return inflight
}

function dogeToBookUsd(amountDoge, rate) {
  const d = Number(amountDoge)
  const r = Number(rate)
  if (!Number.isFinite(d) || d <= 0 || !Number.isFinite(r) || r <= 0) return 0
  return d * r
}

function bookUsdToDoge(amountUsd, rate) {
  const u = Number(amountUsd)
  const r = Number(rate)
  if (!Number.isFinite(u) || u <= 0 || !Number.isFinite(r) || r <= 0) return 0
  return u / r
}

module.exports = {
  getDogeUsdRateSnapshot,
  dogeToBookUsd,
  bookUsdToDoge,
  FALLBACK_DOGE_USD,
  TTL_MS,
}
