import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authFetch } from '../api/client'
import { AUTH_NETWORK_MESSAGE, messageFromAuthResponse } from '../lib/authUserMessage'
import './AuthPage.css'

export const PASSWORD_RESET_TOKEN_KEY = 'excession_password_reset_token'

export function ForgotPassword() {
  const navigate = useNavigate()
  const [step, setStep] = useState('email')
  const [email, setEmail] = useState('')
  const [error, setError] = useState(null)
  const [info, setInfo] = useState('')
  const [loading, setLoading] = useState(false)

  if (step === 'code') {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-card__brand">
            <Link to="/" className="auth-card__logo">
              Excession LLC
            </Link>
            <p className="auth-card__hint">Password reset</p>
          </div>
          <h1 className="auth-card__title">Enter your code</h1>
          {info ? (
            <p className="auth-card__hint" role="status">
              {info}
            </p>
          ) : null}
          <form
            className="auth-form"
            onSubmit={async (e) => {
              e.preventDefault()
              setError(null)
              const form = e.currentTarget
              const code = form.code.value.replace(/\s/g, '').trim()
              setLoading(true)
              try {
                const res = await authFetch('/api/auth/verify-password-reset-code', {
                  method: 'POST',
                  body: { email, code },
                })
                const data = await res.json().catch(() => ({}))
                if (!res.ok) {
                  setError(messageFromAuthResponse(res, data))
                  return
                }
                if (typeof data.resetToken === 'string' && data.resetToken) {
                  try {
                    sessionStorage.setItem(PASSWORD_RESET_TOKEN_KEY, data.resetToken)
                  } catch {
                    /* ignore */
                  }
                }
                navigate('/reset-password', { replace: true })
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
              <span>6-digit code</span>
              <input
                type="text"
                name="code"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="\d{6}"
                maxLength={6}
                required
                placeholder="000000"
                className="auth-code-input"
              />
            </label>
            <button type="submit" className="btn btn--primary auth-submit" disabled={loading}>
              {loading ? 'Checking…' : 'Continue'}
            </button>
          </form>
          <p className="auth-footer">
            <button
              type="button"
              className="btn btn--ghost"
              style={{ marginTop: '0.5rem' }}
              disabled={loading}
              onClick={async () => {
                setError(null)
                setLoading(true)
                try {
                  const res = await authFetch('/api/auth/forgot-password', {
                    method: 'POST',
                    body: { email },
                  })
                  const data = await res.json().catch(() => ({}))
                  if (res.ok) {
                    setInfo(data.message || 'We sent another code if that account exists.')
                  } else {
                    setError(messageFromAuthResponse(res, data))
                  }
                } catch {
                  setError(AUTH_NETWORK_MESSAGE)
                } finally {
                  setLoading(false)
                }
              }}
            >
              Resend code
            </button>
            <span aria-hidden> · </span>
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
          <p className="auth-card__hint">Account recovery</p>
        </div>
        <h1 className="auth-card__title">Forgot password</h1>
        <p className="auth-card__lead">
          Enter the email for your Excession account. We&apos;ll send a 6-digit code you can use to set a new password.
        </p>
        <form
          className="auth-form"
          onSubmit={async (e) => {
            e.preventDefault()
            setError(null)
            const form = e.currentTarget
            const nextEmail = form.email.value.trim()
            setLoading(true)
            try {
              const res = await authFetch('/api/auth/forgot-password', {
                method: 'POST',
                body: { email: nextEmail },
              })
              const data = await res.json().catch(() => ({}))
              if (!res.ok) {
                setError(messageFromAuthResponse(res, data))
                return
              }
              setEmail(nextEmail)
              setInfo(
                data.message ||
                  'If an account exists for that email, you will receive a reset code shortly. Check your spam folder.',
              )
              setStep('code')
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
            <span>Email</span>
            <input type="email" name="email" autoComplete="email" required placeholder="you@company.com" />
          </label>
          <button type="submit" className="btn btn--primary auth-submit" disabled={loading}>
            {loading ? 'Sending…' : 'Send reset code'}
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
