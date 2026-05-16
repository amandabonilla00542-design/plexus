import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { authFetch } from '../api/client'
import { AUTH_NETWORK_MESSAGE } from '../lib/authUserMessage'
import './AuthPage.css'

export function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const [status, setStatus] = useState(token ? 'loading' : 'missing')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) return

    let cancelled = false
    ;(async () => {
      try {
        const res = await authFetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`)
        const data = await res.json().catch(() => ({}))
        if (cancelled) return
        if (res.ok) {
          setStatus('success')
          setMessage(typeof data.message === 'string' ? data.message : 'Email verified.')
          return
        }
        setStatus('error')
        setMessage(
          typeof data.message === 'string'
            ? data.message
            : 'This verification link is invalid or has expired.',
        )
      } catch {
        if (!cancelled) {
          setStatus('error')
          setMessage(AUTH_NETWORK_MESSAGE)
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [token])

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card__brand">
          <Link to="/" className="auth-card__logo">
            Excession LLC
          </Link>
          <p className="auth-card__hint">Email verification</p>
        </div>

        {status === 'loading' ? (
          <>
            <h1 className="auth-card__title">Confirming your email</h1>
            <p className="auth-card__hint">Please wait…</p>
          </>
        ) : null}

        {status === 'missing' ? (
          <>
            <h1 className="auth-card__title">Link required</h1>
            <p className="auth-error" role="alert">
              Open the verification link from your inbox, or request a new one after signing up.
            </p>
            <p className="auth-footer">
              <Link to="/login">Sign in</Link>
              <span aria-hidden> · </span>
              <Link to="/signup">Create account</Link>
            </p>
          </>
        ) : null}

        {status === 'success' ? (
          <>
            <h1 className="auth-card__title">You&apos;re verified</h1>
            <p className="auth-card__hint">{message}</p>
            <Link to="/login" className="btn btn--primary auth-submit" style={{ display: 'inline-block', textAlign: 'center' }}>
              Sign in to your workspace
            </Link>
          </>
        ) : null}

        {status === 'error' ? (
          <>
            <h1 className="auth-card__title">Couldn&apos;t verify</h1>
            <p className="auth-error" role="alert">
              {message}
            </p>
            <p className="auth-footer">
              <Link to="/login">Sign in</Link> to request another link, or{' '}
              <Link to="/signup">create a new account</Link>.
            </p>
          </>
        ) : null}
      </div>
    </div>
  )
}
