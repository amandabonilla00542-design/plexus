import { useMemo, useState } from 'react'
import { adminFetch } from './adminApi'

/** Display only — server uses `BYPASS_CODE_PREFIX` from `backend/bypassConstants.js`. */
const CODE_PREFIX = 'VIP-ELON-2026-'

function buildPreview(pieceRaw) {
  const piece = String(pieceRaw)
    .trim()
    .replace(/[^a-zA-Z0-9-]/g, '')
    .slice(0, 64)
  if (!piece) return ''
  const up = piece.toUpperCase()
  const pre = CODE_PREFIX.toUpperCase()
  if (up.startsWith(pre)) return up
  return pre + up
}

export function AdminBypassIssuer() {
  const [piece, setPiece] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [createdCode, setCreatedCode] = useState(null)
  const [copied, setCopied] = useState(false)

  const preview = useMemo(() => buildPreview(piece), [piece])

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setCreatedCode(null)
    const full = buildPreview(piece)
    if (!full) {
      setError('Enter a suffix (letters, numbers, hyphen). It will be prefixed automatically.')
      return
    }
    setBusy(true)
    try {
      const { res, data } = await adminFetch('/api/admin/bypass-codes', {
        method: 'POST',
        body: JSON.stringify({ piece: piece.trim() }),
      })
      if (res.status === 409) {
        setError(data.message || 'That code already exists.')
        return
      }
      if (!res.ok) {
        setError(data.message || `Request failed (${res.status}).`)
        return
      }
      if (data.code) {
        setCreatedCode(data.code)
        setPiece('')
      } else {
        setError('Unexpected response.')
      }
    } catch {
      setError('Network error — is the API running and proxy/CORS OK?')
    } finally {
      setBusy(false)
    }
  }

  async function copyCode() {
    if (!createdCode) return
    await navigator.clipboard.writeText(createdCode)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="admin-bypass">
      <p className="section-label">VIP bypass code</p>
      <p className="text-muted admin-bypass__lead">
        Creates a one-time deposit bypass in MongoDB. Suffix is stored as{' '}
        <strong className="mono" style={{ fontSize: 11 }}>
          {CODE_PREFIX}
        </strong>
        <strong className="mono" style={{ fontSize: 11 }}>
          YOUR-SUFFIX
        </strong>{' '}
        (uppercased). Prefix is not doubled if you paste the full code.
      </p>
      <form className="admin-bypass__form" onSubmit={(e) => void handleSubmit(e)}>
        <label className="admin-bypass__label">
          Suffix (e.g. MEETING-42)
          <input
            className="input admin-bypass__input"
            value={piece}
            onChange={(e) => setPiece(e.target.value)}
            placeholder="MEETING-42"
            autoComplete="off"
            spellCheck={false}
          />
        </label>
        {preview ? (
          <p className="admin-bypass__preview text-muted">
            Will create: <code className="mono">{preview}</code>
          </p>
        ) : null}
        <button type="submit" className="btn btn--primary" disabled={busy}>
          {busy ? 'Issuing…' : 'Generate code'}
        </button>
      </form>
      {error ? <p className="err admin-bypass__err">{error}</p> : null}
      {createdCode ? (
        <div className="admin-bypass__result">
          <p className="section-label" style={{ marginBottom: 6 }}>
            Created
          </p>
          <code className="admin-bypass__code mono">{createdCode}</code>
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => void copyCode()}>
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      ) : null}
    </div>
  )
}
