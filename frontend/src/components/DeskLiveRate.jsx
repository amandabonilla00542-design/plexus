import './DeskLiveRate.css'

function formatUsdPrice(rate) {
  const r = Number(rate)
  if (!Number.isFinite(r) || r <= 0) return '—'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(r)
}

/** Compact live DOGE/USD — book settlement reference. */
export function DeskLiveRate({ dogeUsd, source, updatedAt }) {
  const rate = Number(dogeUsd)
  if (!Number.isFinite(rate) || rate <= 0) return null

  const liveLabel =
    source === 'coingecko'
      ? 'Live'
      : source === 'cache_stale'
        ? 'Cached'
        : source === 'fallback'
          ? 'Desk'
          : 'Ref'

  return (
    <div className="desk-live-rate" role="status" aria-live="polite" aria-label={`DOGE ${formatUsdPrice(rate)} per coin`}>
      <span className="desk-live-rate__glow" aria-hidden />
      <span className="desk-live-rate__pulse" aria-hidden />
      <span className="desk-live-rate__coin" aria-hidden>
        Ð
      </span>
      <span className="desk-live-rate__meta">
        <span className="desk-live-rate__pair">DOGE · USD</span>
        <span className="desk-live-rate__sub">Deposit rail</span>
      </span>
      <span className="desk-live-rate__price">{formatUsdPrice(rate)}</span>
      <span className="desk-live-rate__badge">{liveLabel}</span>
      {updatedAt ? (
        <time className="desk-live-rate__time" dateTime={updatedAt}>
          {new Date(updatedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
        </time>
      ) : null}
    </div>
  )
}
