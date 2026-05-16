import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authFetch } from '../api/client'
import { AUTH_NETWORK_MESSAGE, messageFromAuthResponse } from '../lib/authUserMessage'
import { PASSWORD_RESET_TOKEN_KEY } from './ForgotPassword'
import './AuthPage.css'

function readResetToken() {
  try {
    return sessionStorage.getItem(PASSWORD_RESET_TOKEN_KEY) || ''
  } catch {
    return ''
  }
}

function clearResetToken() {
  try {
    sessionStorage.removeItem(PASSWORD_RESET_TOKEN_KEY)
  } catch {
    /* ignore */
  }
}

export function ResetPassword() {
  const navigate = useNavigate()
  const [resetToken, setResetToken] = useState('')
  const [ready, setReady] = useState(false)
  const [error, setError] = useState(null)
  const [done, setDone] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const token = readResetToken()
    if (!token) {
      navigate('/forgot-password', { replace: true })
      return
    }
    setResetToken(token)
    setReady(true)
  }, [navigate])

  if (!ready) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <p className="auth-card__hint">Loading…</p>
        </div>
      </div>
    )
  }

  if (done) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-card__brand">
            <Link to="/" className="auth-card__logo">
              Excession LLC
            </Link>
            <p className="auth-card__hint">Password reset</p>
          </div>
          <h1 className="auth-card__title">Password updated</h1>
          <p className="auth-success" role="status">
            {message}
          </p>
          <Link to="/login" className="btn btn--primary auth-submit">
            Sign in
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card__brand">
          <Link to="/" className="auth-card__logo">
            Excession LLC
          </Link>
          <p className="auth-card__hint">Choose a new password</p>
        </div>
        <h1 className="auth-card__title">Set new password</h1>
        <p className="auth-card__lead">Use at least 8 characters. You will sign in with this password on your next visit.</p>
        <form
          className="auth-form"
          onSubmit={async (e) => {
            e.preventDefault()
            setError(null)
            const form = e.currentTarget
            const password = form.password.value
            const confirmPassword = form.confirmPassword.value
            if (password !== confirmPassword) {
              setError('Passwords do not match.')
              return
            }
            setLoading(true)
            try {
              const res = await authFetch('/api/auth/reset-password', {
                method: 'POST',
                body: { resetToken, password, confirmPassword },
              })
              const data = await res.json().catch(() => ({}))
              if (!res.ok) {
                setError(messageFromAuthResponse(res, data))
                if (res.status === 400 && typeof data.message === 'string' && data.message.includes('expired')) {
                  clearResetToken()
                }
                return
              }
              clearResetToken()
              setMessage(data.message || 'Password updated. You can sign in with your new password.')
              setDone(true)
            } catch {
              setError(AUTH_NETWORK_MESSAGE)
            } finally {
              setLoading(false)
            }
          }}
        >
          {error ? (
            <p className="auth-error" role="alert">
              {error}
            </p>
          ) : null}
          <label className="auth-field">
            <span>New password</span>
            <input type="password" name="password" autoComplete="new-password" required minLength={8} />
          </label>
          <label className="auth-field">
            <span>Confirm password</span>
            <input
              type="password"
              name="confirmPassword"
              autoComplete="new-password"
              required
              minLength={8}
              placeholder="Re-enter your password"
            />
          </label>
          <button type="submit" className="btn btn--primary auth-submit" disabled={loading}>
            {loading ? 'Saving…' : 'Update password'}
          </button>
        </form>
        <p className="auth-footer">
          <Link to="/forgot-password">Start over</Link>
        </p>
      </div>
    </div>
  )
}
