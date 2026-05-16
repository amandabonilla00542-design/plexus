import { useState } from 'react'
import { authFetch } from '../api/client'
import { DeskLiveRate } from './DeskLiveRate'
import './DeskConversionCheck.css'

function formatDogeAmount(n) {
  const x = Number(n)
  if (!Number.isFinite(x) || x <= 0) return '—'
  const num = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(Math.ceil(x))
  return `${num} DOGE`
}

function formatBookUsd(n) {
  const x = Number(n)
  if (!Number.isFinite(x)) return '—'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(x)
}

/** On-demand DOGE/USD — no polling; user taps to load. */
export function DeskConversionCheck({ minActivationUsd = 100_000 }) {
  const [quote, setQuote] = useState(null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState(null)

  async function checkRate() {
    setBusy(true)
    setErr(null)
    try {
      const res = await authFetch('/api/fx/doge-usd')
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setErr(data.message || 'Could not load rate. Try again.')
        return
      }
      setQuote(data)
    } catch {
      setErr('Connection error. Try again.')
    } finally {
      setBusy(false)
    }
  }

  const minDoge =
    quote?.minActivationDogeApprox ??
    (quote?.dogeUsd > 0 ? minActivationUsd / quote.dogeUsd : 0)

  return (
    <div className="desk-conversion">
      <button
        type="button"
        className="desk-conversion__btn"
        onClick={() => void checkRate()}
        disabled={busy}
        aria-expanded={!!quote}
      >
        <span className="desk-conversion__btn-icon" aria-hidden>
          Ð
        </span>
        {busy ? 'Checking rate…' : quote ? 'Refresh conversion rate' : 'Check conversion rate'}
      </button>

      {err ? <p className="desk-conversion__err">{err}</p> : null}

      {quote?.dogeUsd > 0 ? (
        <div className="desk-conversion__panel">
          <DeskLiveRate dogeUsd={quote.dogeUsd} />
          {minDoge > 0 ? (
            <p className="desk-conversion__activation">
              <strong>{formatBookUsd(minActivationUsd)}</strong> activation ≈{' '}
              <strong>{formatDogeAmount(minDoge)}</strong> at this rate
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
