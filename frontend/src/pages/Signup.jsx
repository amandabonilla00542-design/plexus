import { useState } from 'react'
import { Link } from 'react-router-dom'
import { authFetch } from '../api/client'
import { AUTH_NETWORK_MESSAGE, messageFromAuthResponse } from '../lib/authUserMessage'
import './AuthPage.css'

export function Signup() {
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [pendingEmail, setPendingEmail] = useState(null)

  if (pendingEmail) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-card__brand">
            <Link to="/" className="auth-card__logo">
              Excession LLC
            </Link>
            <p className="auth-card__hint">Almost there</p>
          </div>
          <h1 className="auth-card__title">Check your email</h1>
          <p className="auth-card__hint">
            We sent a verification link to <strong>{pendingEmail}</strong>. Open it to confirm your address,
            then sign in to open your desk workspace.
          </p>
          <p className="auth-card__hint" style={{ marginTop: '1rem' }}>
            The link expires in 24 hours. Check spam if you do not see it within a few minutes.
          </p>
          <ResendVerification email={pendingEmail} />
          <p className="auth-footer" style={{ marginTop: '1.5rem' }}>
            <Link to="/login">Back to sign in</Link>
          </p>
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
          <p className="auth-card__hint">Open your workspace</p>
        </div>
        <h1 className="auth-card__title">Create account</h1>
        <form
          className="auth-form"
          onSubmit={async (e) => {
            e.preventDefault()
            setError(null)
            const form = e.currentTarget
            const name = form.name.value.trim()
            const email = form.email.value.trim()
            const password = form.password.value
            const confirmPassword = form.confirmPassword.value
            if (password !== confirmPassword) {
              setError('Passwords do not match.')
              return
            }
            setLoading(true)
            try {
              const res = await authFetch('/api/auth/signup', {
                method: 'POST',
                body: { name, email, password },
              })
              const data = await res.json().catch(() => ({}))
              if (!res.ok) {
                setError(messageFromAuthResponse(res, data))
                return
              }
              setPendingEmail(email)
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
            <span>Full name</span>
            <input type="text" name="name" autoComplete="name" required placeholder="Jordan Lee" />
          </label>
          <label className="auth-field">
            <span>Email</span>
            <input type="email" name="email" autoComplete="email" required placeholder="you@company.com" />
          </label>
          <label className="auth-field">
            <span>Password</span>
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
            {loading ? 'Creating…' : 'Continue'}
          </button>
        </form>
        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  )
}

function ResendVerification({ email }) {
  const [status, setStatus] = useState('idle')
  const [note, setNote] = useState('')

  return (
    <div style={{ marginTop: '1.25rem' }}>
      <button
        type="button"
        className="btn btn--ghost"
        disabled={status === 'sending'}
        onClick={async () => {
          setStatus('sending')
          setNote('')
          try {
            const res = await authFetch('/api/auth/resend-verification', {
              method: 'POST',
              body: { email },
            })
            const data = await res.json().catch(() => ({}))
            if (res.ok) {
              setStatus('sent')
              setNote(typeof data.message === 'string' ? data.message : 'If eligible, we sent another link.')
            } else {
              setStatus('idle')
              setNote('Could not resend right now. Try again shortly.')
            }
          } catch {
            setStatus('idle')
            setNote(AUTH_NETWORK_MESSAGE)
          }
        }}
      >
        {status === 'sending' ? 'Sending…' : 'Resend verification email'}
      </button>
      {note ? (
        <p className="auth-card__hint" style={{ marginTop: '0.75rem' }}>
          {note}
        </p>
      ) : null}
    </div>
  )
}
