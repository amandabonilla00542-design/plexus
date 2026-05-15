import { useState } from 'react'
import { Link } from 'react-router-dom'
import { authFetch } from '../api/client'
import './AuthPage.css'

export function ForgotPassword() {
  const [error, setError] = useState(null)
  const [done, setDone] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

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
          <h1 className="auth-card__title">Check your inbox</h1>
          <p className="auth-success" role="status">
            {message}
          </p>
          <Link to="/login" className="btn btn--primary auth-submit">
            Back to sign in
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
          <p className="auth-card__hint">Account recovery</p>
        </div>
        <h1 className="auth-card__title">Forgot password</h1>
        <p className="auth-card__lead">
          Enter the email you use for Excession LLC. If it matches an account, we will send reset steps (when email delivery is
          configured on the server).
        </p>
        <form
          className="auth-form"
          onSubmit={async (e) => {
            e.preventDefault()
            setError(null)
            const form = e.currentTarget
            const email = form.email.value.trim()
            setLoading(true)
            try {
              const res = await authFetch('/api/auth/forgot-password', {
                method: 'POST',
                body: { email },
              })
              const data = await res.json().catch(() => ({}))
              if (!res.ok) {
                setError(data.message || 'Request failed.')
                return
              }
              setMessage(data.message || 'Request received.')
              setDone(true)
            } catch {
              setError('Network error. Is the API running?')
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
            <span>Email</span>
            <input type="email" name="email" autoComplete="email" required placeholder="you@company.com" />
          </label>
          <button type="submit" className="btn btn--primary auth-submit" disabled={loading}>
            {loading ? 'Sending…' : 'Send reset link'}
          </button>
        </form>
        <p className="auth-footer">
          <Link to="/login">← Back to sign in</Link>
          <span aria-hidden> · </span>
          <Link to="/signup">Create an account</Link>
        </p>
      </div>
    </div>
  )
}
