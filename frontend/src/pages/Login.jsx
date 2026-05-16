import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AUTH_TOKEN_KEY, authFetch } from '../api/client'
import { AUTH_NETWORK_MESSAGE, messageFromAuthResponse } from '../lib/authUserMessage'
import { useAuth } from '../context/AuthContext'
import './AuthPage.css'

export function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { refresh } = useAuth()
  const [error, setError] = useState(null)
  const [info, setInfo] = useState(
    location.state?.needsVerification
      ? 'Verify your email before signing in. Check your inbox for the confirmation link.'
      : null,
  )
  const [loading, setLoading] = useState(false)
  const [resendEmail, setResendEmail] = useState('')
  const [resendNote, setResendNote] = useState('')

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card__brand">
          <Link to="/" className="auth-card__logo">
            Excession LLC
          </Link>
          <p className="auth-card__hint">Sign in to continue</p>
        </div>
        <h1 className="auth-card__title">Welcome back</h1>
        <form
          className="auth-form"
          onSubmit={async (e) => {
            e.preventDefault()
            setError(null)
            const form = e.currentTarget
            const email = form.email.value.trim()
            const password = form.password.value
            setLoading(true)
            try {
              const res = await authFetch('/api/auth/login', {
                method: 'POST',
                body: { email, password },
              })
              const data = await res.json().catch(() => ({}))
              if (!res.ok) {
                if (data?.code === 'EMAIL_NOT_VERIFIED') {
                  setResendEmail(email)
                }
                setError(messageFromAuthResponse(res, data))
                return
              }
              if (data.token) {
                window.localStorage.setItem(AUTH_TOKEN_KEY, data.token)
              }
              await refresh()
              navigate('/dashboard', { replace: true })
            } catch {
              setError(AUTH_NETWORK_MESSAGE)
            } finally {
              setLoading(false)
            }
          }}
        >
          {info ? (
            <p className="auth-card__hint" role="status">
              {info}
            </p>
          ) : null}
          {error ? (
            <p className="auth-error" role="alert">
              {error}
            </p>
          ) : null}
          {resendEmail ? (
            <p className="auth-footer" style={{ marginBottom: '0.75rem' }}>
              <button
                type="button"
                className="btn btn--ghost"
                onClick={async () => {
                  setResendNote('')
                  try {
                    const res = await authFetch('/api/auth/resend-verification', {
                      method: 'POST',
                      body: { email: resendEmail },
                    })
                    const data = await res.json().catch(() => ({}))
                    setResendNote(
                      res.ok && typeof data.message === 'string'
                        ? data.message
                        : 'Could not resend right now. Try again shortly.',
                    )
                  } catch {
                    setResendNote(AUTH_NETWORK_MESSAGE)
                  }
                }}
              >
                Resend verification email
              </button>
              {resendNote ? <span style={{ display: 'block', marginTop: '0.5rem' }}>{resendNote}</span> : null}
            </p>
          ) : null}
          <label className="auth-field">
            <span>Email</span>
            <input type="email" name="email" autoComplete="email" required placeholder="you@company.com" />
          </label>
          <label className="auth-field">
            <span>Password</span>
            <input type="password" name="password" autoComplete="current-password" required />
          </label>
          <button type="submit" className="btn btn--primary auth-submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <p className="auth-footer">
          <Link to="/signup">Create an account</Link>
          <span aria-hidden> · </span>
          <Link to="/forgot-password">Forgot password</Link>
        </p>
      </div>
    </div>
  )
}
