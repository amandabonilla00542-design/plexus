import { Link } from 'react-router-dom'
import { MarketsProSection } from '../components/MarketsProSection'
import { useAuth } from '../context/AuthContext'
import './Markets.css'

const CLASSES = [
  { name: 'Spot crypto', pairs: 'BTC, ETH, SOL + majors', session: '24/7', note: 'CFDs where offered' },
  { name: 'FX majors & crosses', pairs: 'EUR, GBP, JPY, CHF, AUD, NZD, CAD', session: 'Sun–Fri', note: 'Tight spreads · deep book story' },
  { name: 'Indices & commodities', pairs: 'US500, NAS100, XAU, WTI', note: 'Macro-sensitive hedges' },
]

export function Markets() {
  const { checked, isAuthed } = useAuth()

  return (
    <div className="page-markets">
      <section className="page-hero">
        <div className="container page-hero__inner">
          <p className="section-eyebrow">Markets coverage</p>
          <h1 className="page-hero__title">Trade global liquidity from one desk</h1>
          <p className="page-hero__lead">
            Crypto and FX-first workflows with room for indices and metals—structured so your desk can route tickets,
            manage risk, and explain fills without switching contexts.
          </p>
          <div className="page-hero__cta">
            {!checked ? null : isAuthed ? (
              <>
                <Link to="/dashboard" className="btn btn--primary">
                  Workspace
                </Link>
                <Link to="/platform" className="btn btn--ghost">
                  Platform
                </Link>
              </>
            ) : (
              <>
                <Link to="/signup" className="btn btn--primary">
                  Open account
                </Link>
                <Link to="/dashboard" className="btn btn--ghost">
                  Account overview
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="page-section">
        <div className="container">
          <h2 className="page-section__title">Asset classes</h2>
          <div className="markets-classes">
            {CLASSES.map((row) => (
              <article key={row.name} className="markets-class-card">
                <h3>{row.name}</h3>
                <p className="markets-class-card__pairs">{row.pairs}</p>
                {row.session ? <p className="markets-class-card__meta">Session · {row.session}</p> : null}
                <p className="markets-class-card__note">{row.note}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <MarketsProSection />

      <section className="page-section page-section--muted">
        <div className="container page-legal-hint">
          <p>
            <strong>Important:</strong> Product availability depends on your jurisdiction and onboarding status. Charts
            above use simulated data for UI development—connect your feed before client-facing use.
          </p>
        </div>
      </section>
    </div>
  )
}
