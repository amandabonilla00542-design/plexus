import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AUTH_TOKEN_KEY, authFetch } from '../api/client'
import { useAuth } from '../context/AuthContext'
import './AuthPage.css'

export function Login() {
  const navigate = useNavigate()
  const { refresh } = useAuth()
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

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
                setError(data.message || 'Sign in failed.')
                return
              }
              if (data.token) {
                window.localStorage.setItem(AUTH_TOKEN_KEY, data.token)
              }
              await refresh()
              navigate('/dashboard', { replace: true })
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
