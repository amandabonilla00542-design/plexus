import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { adminFetch, ADMIN_SESSION_KEY } from './adminApi'
import { AdminElonStrip } from './AdminElonStrip'
import { AdminTerminalPreview } from './AdminTerminalPreview'
import { AdminBypassIssuer } from './AdminBypassIssuer'
import { APP_PRODUCT, APP_PRODUCT_LINE } from './brand'
import './index.css'

function readTheme() {
  try {
    const t =
      localStorage.getItem('excession-theme') ||
      localStorage.getItem('plexus-theme') ||
      localStorage.getItem('layerdodge-theme')
    return t === 'dark' ? 'dark' : 'light'
  } catch {
    return 'light'
  }
}

function persistTheme(mode) {
  try {
    localStorage.setItem('plexus-theme', mode)
    localStorage.setItem('excession-theme', mode)
  } catch {
    /* ignore */
  }
}

function AppBrandAvatar() {
  return (
    <div className="app-brand__avatar" aria-hidden>
      <img className="app-brand__avatar-img" src="/assets/brand/excession-logo.png" alt="" width={40} height={40} />
    </div>
  )
}

function AppShellHeader({ title, subtitle, right }) {
  return (
    <header className="app-shell-header">
      <div className="app-shell-header__toolbar">
        <div className="app-brand" aria-label={`${APP_PRODUCT} ${APP_PRODUCT_LINE}`}>
          <AppBrandAvatar />
          <div className="app-brand__meta">
            <span className="app-brand__name">{APP_PRODUCT}</span>
            <span className="app-brand__line">{APP_PRODUCT_LINE}</span>
          </div>
        </div>
        {right ? <div className="app-shell-header__toolbar-right">{right}</div> : null}
      </div>
      <div className="app-shell-header__screen">
        <h1 className="app-shell-header__title">{title}</h1>
        {subtitle ? <p className="app-shell-header__sub">{subtitle}</p> : null}
      </div>
    </header>
  )
}

function isAppleTouchDevice() {
  if (typeof navigator === 'undefined') return false
  if (/iPhone|iPod|iPad/i.test(navigator.userAgent)) return true
  if (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) return true
  return false
}

function PwaIosHint({ onDismiss }) {
  return (
    <div className="pwa-ios-hint" role="status">
      <p className="pwa-ios-hint__text">
        <span className="pwa-ios-hint__tag">Install</span>
        On iPhone or iPad: tap <strong>Share</strong>, then <strong>Add to Home Screen</strong> to open like an app.
      </p>
      <button type="button" className="pwa-ios-hint__dismiss" onClick={onDismiss} aria-label="Dismiss">
        ×
      </button>
    </div>
  )
}

function fmtDoge(n) {
  const x = Number(n)
  if (!Number.isFinite(x)) return '—'
  const num = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 8,
  }).format(x)
  return `DOGE ${num}`
}

function fmtUsd(n) {
  return fmtDoge(n)
}

function fmtUsdShort(n) {
  const x = Number(n)
  if (!Number.isFinite(x)) return '—'
  if (Math.abs(x) >= 1e6) return `${(x / 1e6).toFixed(2)}M`
  if (Math.abs(x) >= 1e3) return `${(x / 1e3).toFixed(1)}k`
  return fmtUsd(x)
}

function UserAdminPanel({ u, onYield }) {
  return (
    <article className="admin-card admin-card--modal">
      <div className="admin-card__top">
        <div style={{ minWidth: 0 }}>
          <h2 className="admin-card__name">{u.name}</h2>
          <p className="admin-card__email text-muted mono">{u.email}</p>
        </div>
        <div>
          {u.depositWhitelist?.awaitingFirstDeposit ? (
            <span className="pill pill--live">VIP · deposit</span>
          ) : u.depositWhitelist?.active ? (
            <span className="pill">VIP</span>
          ) : (
            <span className="pill" style={{ opacity: 0.55 }}>
              Std
            </span>
          )}
        </div>
      </div>

      <div className="admin-card__addr">
        <span className="admin-label">Desk DOGE address</span>
        <div className="mono" style={{ color: 'var(--text)', fontSize: 11 }}>
          {u.dodgeAddress || '—'}
        </div>
      </div>

      <div className="admin-metrics">
        <div className="admin-metric">
          <div className="admin-metric__l">Book</div>
          <span className="admin-metric__v numeric">{fmtUsd(u.bookTotalUsdt)}</span>
        </div>
        <div className="admin-metric">
          <div className="admin-metric__l">Principal</div>
          <span className="admin-metric__v numeric">{fmtUsd(u.yieldPrincipalUsdt)}</span>
        </div>
        <div className="admin-metric">
          <div className="admin-metric__l">Yield</div>
          <span className="admin-metric__v numeric">{fmtUsd(u.yieldAccruedUsdt)}</span>
        </div>
        <div className="admin-metric">
          <div className="admin-metric__l">Pending</div>
          <span className="admin-metric__v numeric">{fmtUsd(u.pendingDepositUsdt)}</span>
        </div>
      </div>

      <div className="admin-card__foot">
        <div className="admin-actions admin-actions--solo">
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => onYield(u)}>
            Book ±
          </button>
        </div>
      </div>
    </article>
  )
}

export default function App() {
  const scrollRef = useRef(null)
  const [theme, setTheme] = useState(readTheme)
  const [gate, setGate] = useState(() => !sessionStorage.getItem(ADMIN_SESSION_KEY))
  const [secretInput, setSecretInput] = useState('')
  const [gateErr, setGateErr] = useState(null)

  const [users, setUsers] = useState([])
  const [loadErr, setLoadErr] = useState(null)
  const [loading, setLoading] = useState(false)
  const [yieldModal, setYieldModal] = useState(null)
  const [yieldAmt, setYieldAmt] = useState('')
  /** 'principal' = vendor/direct deposit; 'accrued' = profile / yield only */
  const [yieldBookTarget, setYieldBookTarget] = useState('principal')
  const [yieldBusy, setYieldBusy] = useState(false)

  const [revealModal, setRevealModal] = useState(null)
  const [revealAddr, setRevealAddr] = useState('')
  const [revealResult, setRevealResult] = useState(null)
  const [revealBusy, setRevealBusy] = useState(false)

  const [detailUserId, setDetailUserId] = useState(null)
  const detailUser = useMemo(
    () => (detailUserId != null ? users.find((u) => u.id === detailUserId) : null),
    [users, detailUserId],
  )

  const [deferredInstall, setDeferredInstall] = useState(null)
  const [iosInstallDismissed, setIosInstallDismissed] = useState(() => {
    try {
      return sessionStorage.getItem('meridian_ios_install_tip') === '1'
    } catch {
      return false
    }
  })

  const standalone =
    typeof window !== 'undefined' &&
    (window.matchMedia('(display-mode: standalone)').matches ||
      window.matchMedia('(display-mode: fullscreen)').matches)

  const showIosInstallHint = !standalone && isAppleTouchDevice() && !iosInstallDismissed

  const dismissIosInstallHint = useCallback(() => {
    try {
      sessionStorage.setItem('meridian_ios_install_tip', '1')
    } catch {
      /* ignore */
    }
    setIosInstallDismissed(true)
  }, [])

  useEffect(() => {
    const onBip = (e) => {
      e.preventDefault()
      setDeferredInstall(e)
    }
    const onInstalled = () => setDeferredInstall(null)
    window.addEventListener('beforeinstallprompt', onBip)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onBip)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  const runPwaInstall = useCallback(async () => {
    if (!deferredInstall) return
    try {
      deferredInstall.prompt()
      await deferredInstall.userChoice
    } catch {
      /* user dismissed or prompt failed */
    }
    setDeferredInstall(null)
  }, [deferredInstall])

  const totals = useMemo(() => {
    return users.reduce(
      (a, u) => ({
        n: a.n + 1,
        book: a.book + (Number(u.bookTotalUsdt) || 0),
        principal: a.principal + (Number(u.yieldPrincipalUsdt) || 0),
        pending: a.pending + (Number(u.pendingDepositUsdt) || 0),
      }),
      { n: 0, book: 0, principal: 0, pending: 0 },
    )
  }, [users])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    persistTheme(theme)
  }, [theme])

  const loadUsers = useCallback(async () => {
    setLoading(true)
    setLoadErr(null)
    const { res, data } = await adminFetch('/api/admin/users')
    if (!res.ok) {
      setLoadErr(data.message || `Error ${res.status}`)
      setUsers([])
      setLoading(false)
      return
    }
    const list = Array.isArray(data.users) ? data.users : []
    setUsers(list)
    setLoading(false)
  }, [])

  useEffect(() => {
    if (!gate) void loadUsers()
  }, [gate, loadUsers])

  useEffect(() => {
    if (detailUserId != null && !users.some((u) => u.id === detailUserId)) {
      setDetailUserId(null)
    }
  }, [users, detailUserId])

  const openReveal = useCallback(() => {
    setRevealAddr('')
    setRevealResult(null)
    setRevealModal({})
  }, [])

  const scrollTop = useCallback(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  async function tryUnlock(e) {
    e.preventDefault()
    setGateErr(null)
    const s = secretInput.trim()
    if (s.length < 16) {
      setGateErr('Secret must match ADMIN_PANEL_SECRET (≥16 characters, trimmed).')
      return
    }
    sessionStorage.setItem(ADMIN_SESSION_KEY, s)
    const { res, data } = await adminFetch('/api/admin/users')
    if (!res.ok) {
      sessionStorage.removeItem(ADMIN_SESSION_KEY)
      setGateErr(data.message || 'Unauthorized — check secret.')
      return
    }
    setGate(false)
    setUsers(Array.isArray(data.users) ? data.users : [])
  }

  function lockout() {
    sessionStorage.removeItem(ADMIN_SESSION_KEY)
    setGate(true)
    setUsers([])
    setSecretInput('')
  }

  async function applyYield() {
    if (!yieldModal) return
    if (!yieldBookTarget) {
      alert('Choose whether this is a user deposit or a profile/yield adjustment.')
      return
    }
    const raw = yieldAmt.trim()
    const n = Number(raw)
    if (!Number.isFinite(n) || n === 0) {
      alert('Enter a non-zero number (negative allowed).')
      return
    }
    setYieldBusy(true)
    const { res, data } = await adminFetch(`/api/admin/users/${yieldModal.id}/yield-accrued`, {
      method: 'POST',
      body: JSON.stringify({ amount: n, target: yieldBookTarget }),
    })
    setYieldBusy(false)
    if (!res.ok) {
      alert(data.message || 'Update failed')
      return
    }
    if (data.target && data.target !== yieldBookTarget) {
      alert(
        `Server applied to "${data.target}" but you chose "${yieldBookTarget}". Redeploy the API — production may still be on the old build (accrued only).`,
      )
    }
    const ruleNote =
      data.appliedRule === 'vip_first_deposit'
        ? '\nRule: VIP — pending + amount moved to principal; VIP cleared.'
        : data.appliedRule === 'principal_activation'
          ? `\nRule: pending reached ${fmtUsd(data.activationThresholdUsdt || 100000)} — all moved to principal.`
          : ''
    const appliedLabel =
      data.appliedRule === 'vip_first_deposit'
        ? 'principal (VIP sweep)'
        : data.appliedRule === 'principal_activation'
          ? 'principal (activation)'
          : data.target === 'principal'
            ? 'principal'
            : data.target === 'pending'
              ? 'pending'
              : 'yield accrued'
    alert(
      `Applied ${n >= 0 ? '+' : ''}${n} → ${appliedLabel}.${ruleNote}\nPrincipal: ${fmtUsd(data.yieldPrincipalUsdt)}\nPending: ${fmtUsd(data.pendingDepositUsdt)}\nYield: ${fmtUsd(data.yieldAccruedUsdt)}\nBook: ${fmtUsd(data.bookTotalUsdt)}`,
    )
    setUsers((rows) =>
      rows.map((u) =>
        u.id === yieldModal.id
          ? {
              ...u,
              yieldPrincipalUsdt: data.yieldPrincipalUsdt,
              yieldAccruedUsdt: data.yieldAccruedUsdt,
              pendingDepositUsdt: data.pendingDepositUsdt,
              bookTotalUsdt: data.bookTotalUsdt,
              depositWhitelist: data.depositWhitelist || u.depositWhitelist,
            }
          : u,
      ),
    )
    setYieldModal(null)
    setYieldAmt('')
    setYieldBookTarget('principal')
  }

  async function runReveal() {
    const addr = revealAddr.trim()
    if (addr.length < 26) {
      alert('Paste full Dogecoin (D…) deposit address.')
      return
    }
    setRevealBusy(true)
    setRevealResult(null)
    const { res, data } = await adminFetch('/api/admin/reveal-private-key', {
      method: 'POST',
      body: JSON.stringify({ address: addr }),
    })
    setRevealBusy(false)
    if (!res.ok) {
      alert(data.message || 'Reveal failed')
      return
    }
    setRevealResult(data)
  }

  if (gate) {
    return (
      <div className="app-viewport">
        <div className="app-phone">
          <AppShellHeader
            title="Secure access"
            subtitle="Private session · operator secret only"
            right={
              <div className="app-shell-header__actions">
                {deferredInstall ? (
                  <button type="button" className="app-install-btn" onClick={() => void runPwaInstall()}>
                    Install
                  </button>
                ) : null}
                <button
                  type="button"
                  className="app-icon-btn"
                  onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
                  aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
                >
                  <span aria-hidden>◐</span>
                </button>
              </div>
            }
          />
          <div className="gate-body">
            {showIosInstallHint ? <PwaIosHint onDismiss={dismissIosInstallHint} /> : null}
            <form className="gate-card" onSubmit={tryUnlock}>
              <p className="section-label gate-card__eyebrow">Authentication</p>
              <p className="text-muted gate-card__lead">
                Paste <strong>ADMIN_PANEL_SECRET</strong> from the API <code>.env</code>. Session only — closing the tab
                clears it.
              </p>
              {gateErr ? <p className="err">{gateErr}</p> : null}
              <input
                className="input"
                type="password"
                autoComplete="off"
                placeholder="Operator secret"
                value={secretInput}
                onChange={(e) => setSecretInput(e.target.value)}
              />
              <button className="btn btn--primary btn--block" type="submit">
                Unlock
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="app-viewport">
        <div className="app-phone">
          <AppShellHeader
            title="Treasury"
            subtitle={loading ? 'Syncing ledger…' : `${users.length} account${users.length === 1 ? '' : 's'} on file`}
            right={
              deferredInstall ? (
                <button type="button" className="app-install-btn" onClick={() => void runPwaInstall()}>
                  Install app
                </button>
              ) : null
            }
          />

          <div ref={scrollRef} className="app-scroll" id="admin-scroll">
            {showIosInstallHint ? <PwaIosHint onDismiss={dismissIosInstallHint} /> : null}
            {loadErr ? <p className="err">{loadErr}</p> : null}

            <div className="app-stats" id="app-stats">
              <div className="app-stat">
                <span className="app-stat__v numeric">{fmtUsdShort(totals.book)}</span>
                <div className="app-stat__l">Combined book</div>
              </div>
              <div className="app-stat">
                <span className="app-stat__v numeric">{fmtUsdShort(totals.principal)}</span>
                <div className="app-stat__l">Principal sum</div>
              </div>
              <div className="app-stat">
                <span className="app-stat__v numeric">{totals.n}</span>
                <div className="app-stat__l">Users</div>
              </div>
            </div>

            <div className="admin-desk-split">
              <div className="admin-desk-split__profile">
                <div className="admin-profile-hero">
                  <p className="section-label admin-profile-hero__eyebrow">Desk profile</p>
                  <AdminElonStrip profileHero />
                </div>
              </div>

              <div className="admin-desk-split__roster admin-roster-shell">
                {users.length === 0 && !loading ? (
                  <div className="empty-card">No users returned. Pull to refresh from the bar below, or check the API.</div>
                ) : null}

                <section className="admin-roster" aria-label="Users">
                  {users.map((u) => (
                    <div
                      key={u.id}
                      className="admin-roster-row"
                      title={u.email ? `${u.email}` : undefined}
                    >
                      <div className="admin-roster-row__lead">
                        <span className="admin-roster-row__name">{u.name}</span>
                        <span className="admin-roster-row__sep text-muted">·</span>
                        <span className="admin-roster-row__book numeric text-muted">{fmtUsdShort(u.bookTotalUsdt)}</span>
                      </div>
                      {u.depositWhitelist?.awaitingFirstDeposit ? (
                        <span className="admin-roster-badge admin-roster-badge--live" aria-label="VIP awaiting deposit">
                          VIP
                        </span>
                      ) : u.depositWhitelist?.active ? (
                        <span className="admin-roster-badge" aria-label="VIP">
                          VIP
                        </span>
                      ) : null}
                      <button
                        type="button"
                        className="btn btn--ghost btn--sm admin-roster-row__action"
                        onClick={() => setDetailUserId(u.id)}
                      >
                        Full view
                      </button>
                    </div>
                  ))}
                </section>
              </div>
            </div>

            <AdminTerminalPreview theme={theme} />

            <AdminBypassIssuer />
          </div>

          <nav className="app-tabbar" aria-label="Main actions">
            <button type="button" className="app-tab" onClick={scrollTop}>
              <span className="app-tab__glyph" aria-hidden>
                ⌂
              </span>
              Home
            </button>
            <button type="button" className="app-tab" onClick={() => void loadUsers()} disabled={loading}>
              <span className="app-tab__glyph" aria-hidden>
                ⟳
              </span>
              Sync
            </button>
            <button type="button" className="app-tab-fab" aria-label="Reveal private key" onClick={openReveal}>
              <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.06em' }}>KEY</span>
            </button>
            <button type="button" className="app-tab" onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}>
              <span className="app-tab__glyph" aria-hidden>
                ◐
              </span>
              Theme
            </button>
            <button type="button" className="app-tab" onClick={lockout}>
              <span className="app-tab__glyph" aria-hidden>
                ⎋
              </span>
              Lock
            </button>
          </nav>
        </div>
      </div>

      {detailUserId != null ? (
        <div className="modal-overlay" role="presentation" onClick={() => setDetailUserId(null)}>
          <div
            className="modal-panel modal-panel--user-detail"
            role="dialog"
            aria-modal="true"
            aria-label="Account details"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-panel__head">
              <h2>{detailUser ? detailUser.name : 'Account'}</h2>
              <button type="button" className="btn btn--ghost btn--sm" onClick={() => setDetailUserId(null)}>
                Close
              </button>
            </div>
            {detailUser ? (
              <UserAdminPanel
                u={detailUser}
                onYield={(user) => {
                  setYieldAmt('')
                  setYieldBookTarget('principal')
                  setYieldModal(user)
                }}
              />
            ) : (
              <p className="text-muted" style={{ margin: 0 }}>
                This account is no longer in the synced list.
              </p>
            )}
          </div>
        </div>
      ) : null}

      {yieldModal ? (
        <div className="modal-overlay" role="presentation" onClick={() => !yieldBusy && setYieldModal(null)}>
          <div className="modal-panel" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <h2>Adjust book</h2>
            <p className="modal-panel__lead">
              <strong>{yieldModal.name}</strong> — principal {fmtUsd(yieldModal.yieldPrincipalUsdt)}, pending{' '}
              {fmtUsd(yieldModal.pendingDepositUsdt)}, yield {fmtUsd(yieldModal.yieldAccruedUsdt)}, book{' '}
              {fmtUsd(yieldModal.bookTotalUsdt)}.
            </p>
            {yieldModal.depositWhitelist?.awaitingFirstDeposit ? (
              <p className="book-target-picker__vip-banner">
                <strong>VIP code active</strong> — user redeemed a bypass code on the dashboard. Credit their{' '}
                <strong>next</strong> vendor deposit to <strong>principal</strong> (not pending), any size — VIP clears when you
                apply to principal.
              </p>
            ) : null}
            <fieldset className="book-target-picker">
              <legend className="book-target-picker__legend">What is this adjustment?</legend>
              <label className={`book-target-picker__opt${yieldBookTarget === 'principal' ? ' is-on' : ''}`}>
                <input
                  type="radio"
                  name="bookTarget"
                  value="principal"
                  checked={yieldBookTarget === 'principal'}
                  onChange={() => setYieldBookTarget('principal')}
                />
                <span className="book-target-picker__label">User deposited</span>
                <span className="book-target-picker__hint">
                  Vendor paid / settled → <strong>principal</strong>. If <strong>VIP</strong> is active, existing{' '}
                  <strong>pending is included</strong> in one principal credit, then VIP clears.
                </span>
              </label>
              <label className={`book-target-picker__opt${yieldBookTarget === 'pending' ? ' is-on' : ''}`}>
                <input
                  type="radio"
                  name="bookTarget"
                  value="pending"
                  checked={yieldBookTarget === 'pending'}
                  onChange={() => setYieldBookTarget('pending')}
                />
                <span className="book-target-picker__label">Pending toward activation</span>
                <span className="book-target-picker__hint">
                  Partial funding → <strong>pending</strong>. If pending reaches <strong>100k+</strong> after this add, the
                  server <strong>moves all pending to principal</strong> automatically.
                </span>
              </label>
              <label className={`book-target-picker__opt${yieldBookTarget === 'accrued' ? ' is-on' : ''}`}>
                <input
                  type="radio"
                  name="bookTarget"
                  value="accrued"
                  checked={yieldBookTarget === 'accrued'}
                  onChange={() => setYieldBookTarget('accrued')}
                />
                <span className="book-target-picker__label">Profile / yield only</span>
                <span className="book-target-picker__hint">
                  Not an on-chain deposit — adds to <strong>yield accrued</strong> only.
                </span>
              </label>
            </fieldset>
            <label className="modal-panel__field-label" htmlFor="book-adjust-amount">
              Amount (± book units)
            </label>
            <input
              id="book-adjust-amount"
              className="input"
              placeholder="e.g. 100000 or -50.25"
              value={yieldAmt}
              onChange={(e) => setYieldAmt(e.target.value)}
            />
            <div className="modal-actions">
              <button type="button" className="btn btn--ghost" onClick={() => setYieldModal(null)} disabled={yieldBusy}>
                Cancel
              </button>
              <button type="button" className="btn btn--primary" onClick={() => void applyYield()} disabled={yieldBusy}>
                {yieldBusy
                  ? '…'
                  : yieldBookTarget === 'principal'
                    ? 'Apply to principal'
                    : yieldBookTarget === 'pending'
                      ? 'Apply to pending'
                      : 'Apply to yield'}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {revealModal ? (
        <div className="modal-overlay" role="presentation" onClick={() => !revealBusy && setRevealModal(null)}>
          <div className="modal-panel" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <h2>Reveal private key</h2>
            <p>
              Dogecoin <strong>deposit address (Dodge network)</strong>. Server uses <code>ENCRYPTION_SECRET</code>.
            </p>
            <input
              className="input mono"
              placeholder="D…"
              value={revealAddr}
              onChange={(e) => setRevealAddr(e.target.value)}
            />
            {revealResult?.privateKey ? (
              <div>
                <p className="text-muted" style={{ marginBottom: 6, fontSize: 13 }}>
                  Private key
                </p>
                <div className="key-box mono">{revealResult.privateKey}</div>
              </div>
            ) : null}
            <div className="modal-actions">
              <button type="button" className="btn btn--ghost" onClick={() => setRevealModal(null)} disabled={revealBusy}>
                Close
              </button>
              <button type="button" className="btn btn--primary" onClick={() => void runReveal()} disabled={revealBusy}>
                {revealBusy ? '…' : 'Reveal'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
