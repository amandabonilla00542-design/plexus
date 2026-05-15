import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AUTH_TOKEN_KEY, authFetch } from '../api/client'
import { useAuth } from '../context/AuthContext'
import './AuthPage.css'

const POST_SIGNUP_MS = 8_000

function delay(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

export function Signup() {
  const { refresh } = useAuth()
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [processingSignup, setProcessingSignup] = useState(false)

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
                setError(data.message || 'Could not create account.')
                return
              }
              if (data.token) {
                window.localStorage.setItem(AUTH_TOKEN_KEY, data.token)
              }
              setLoading(false)
              setProcessingSignup(true)
              try {
                /** Must run *before* `refresh()`: once `user` is set, `GuestRoute` immediately `<Navigate to="/dashboard" />` and skips the rest of this handler. */
                await delay(POST_SIGNUP_MS)
                await refresh()
              } catch {
                setProcessingSignup(false)
                setError('Account created, but we could not finish sign-in. Try logging in with your email and password.')
              }
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
          <button type="submit" className="btn btn--primary auth-submit" disabled={loading || processingSignup}>
            {loading ? 'Creating…' : 'Continue'}
          </button>
        </form>
        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>

      {processingSignup ? (
        <div
          className="auth-processing-overlay"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="auth-processing-title"
          aria-busy="true"
        >
          <div className="auth-processing-card">
            <div className="auth-processing-spinner" aria-hidden />
            <p id="auth-processing-title" className="auth-processing-title">
              Setting up your workspace
            </p>
            <p className="auth-processing-sub">
              Provisioning your personal <strong>Dogecoin (DOGE)</strong> deposit address on the Dodge network…
            </p>
          </div>
        </div>
      ) : null}
    </div>
  )
}
