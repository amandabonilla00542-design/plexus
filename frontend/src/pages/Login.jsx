import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AUTH_TOKEN_KEY, authFetch } from '../api/client'
import { AUTH_NETWORK_MESSAGE, messageFromAuthResponse } from '../lib/authUserMessage'
import { useAuth } from '../context/AuthContext'
import './AuthPage.css'

/**
 * LOGIN FLOW (start here when user clicks "Sign in")
 *
 * App.jsx wraps this page in <GuestRoute>:
 *   → On load, AuthContext already called GET /api/auth/me
 *   → If user.verified === true → GuestRoute redirects to /dashboard (skip login form)
 *
 * Click "Sign in" → runLoginFlow() below:
 *   1. POST /api/auth/login          (backend checks password + emailVerified)
 *   2. On failure → show error (403 = email not verified + resend button)
 *   3. On success → save JWT in localStorage + httpOnly cookie from server
 *   4. refresh() → GET /api/auth/me  (load { name, email, verified } into AuthContext)
 *   5. If verified → navigate('/dashboard')
 *      → ProtectedRoute checks user again, then Dashboard calls GET /api/dashboard
 */

/** Step 1 — credentials to backend */
async function postLogin(email, password) {
  const res = await authFetch('/api/auth/login', {
    method: 'POST',
    body: { email, password },
  })
  const data = await res.json().catch(() => ({}))
  return { res, data }
}

/** Step 3 — keep token for Bearer header on API calls */
function saveSessionToken(token) {
  if (!token) return
  try {
    window.localStorage.setItem(AUTH_TOKEN_KEY, token)
  } catch {
    /* private mode / quota */
  }
}

/** Step 4 — AuthContext → GET /api/auth/me */
async function resendVerificationEmail(email) {
  const res = await authFetch('/api/auth/resend-verification', {
    method: 'POST',
    body: { email },
  })
  const data = await res.json().catch(() => ({}))
  if (res.ok && typeof data.message === 'string') return data.message
  return 'Could not resend right now. Try again shortly.'
}

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

  async function runLoginFlow(email, password) {
    setError(null)
    setInfo(null)
    setResendEmail('')
    setResendNote('')

    // ── Step 1: POST /api/auth/login ──────────────────────────────────────
    const { res, data } = await postLogin(email, password)

    // ── Step 2: handle errors (stay on /login) ────────────────────────────
    if (!res.ok) {
      if (data?.code === 'EMAIL_NOT_VERIFIED') {
        setResendEmail(email)
      }
      setError(messageFromAuthResponse(res, data))
      return
    }

    // ── Step 3: persist session token ─────────────────────────────────────
    saveSessionToken(data.token)

    // ── Step 4: load user into AuthContext (GET /api/auth/me) ─────────────
    const user = await refresh()

    // ── Step 5: only enter desk if verified ─────────────────────────────────
    if (!user?.verified) {
      setError('Verify your email before opening the desk. Check your inbox for the confirmation link.')
      setResendEmail(email)
      return
    }

    // ── Step 6: go to dashboard (ProtectedRoute + API check again) ────────
    navigate('/dashboard', { replace: true })
  }

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
            const form = e.currentTarget
            const email = form.email.value.trim()
            const password = form.password.value
            setLoading(true)
            try {
              await runLoginFlow(email, password)
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
                disabled={loading}
                onClick={async () => {
                  setResendNote('')
                  setLoading(true)
                  try {
                    setResendNote(await resendVerificationEmail(resendEmail))
                  } catch {
                    setResendNote(AUTH_NETWORK_MESSAGE)
                  } finally {
                    setLoading(false)
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
