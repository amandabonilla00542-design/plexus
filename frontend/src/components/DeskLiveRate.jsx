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

/** Compact DOGE/USD — price only (no internal source labels). */
export function DeskLiveRate({ dogeUsd }) {
  const rate = Number(dogeUsd)
  if (!Number.isFinite(rate) || rate <= 0) return null

  return (
    <div
      className="desk-live-rate"
      role="status"
      aria-live="polite"
      aria-label={`DOGE ${formatUsdPrice(rate)} per coin`}
    >
      <span className="desk-live-rate__glow" aria-hidden />
      <span className="desk-live-rate__coin" aria-hidden>
        Ð
      </span>
      <span className="desk-live-rate__pair">DOGE · USD</span>
      <span className="desk-live-rate__price">{formatUsdPrice(rate)}</span>
    </div>
  )
}
