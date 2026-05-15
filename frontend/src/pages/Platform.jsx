import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Platform.css'

const PILLARS = [
  {
    title: 'Unified blotter',
    body: 'Orders, positions, and funding events in one scroll—built for operators who cannot afford context switching.',
  },
  {
    title: 'Risk-aware surfaces',
    body: 'Margin, utilization, and exposure cues surfaced before tickets leave the desk—not buried in a modal.',
  },
  {
    title: 'Terminal-grade charts',
    body: 'Drop in your data vendor or bridge—chart slots are sized for professional workflows (OHLC, volume, filters).',
  },
  {
    title: 'API-ready posture',
    body: 'Frontend routes are stable so your backend team can attach auth, balances, and streaming without re-skinning.',
  },
]

export function Platform() {
  const { checked, isAuthed } = useAuth()

  return (
    <div className="page-platform">
      <section className="page-hero">
        <div className="container page-hero__inner page-hero__inner--wide">
          <p className="section-eyebrow">Platform</p>
          <h1 className="page-hero__title">Infrastructure you can trade on</h1>
          <p className="page-hero__lead">
            Excession LLC is designed as a brokerage-grade shell: crisp IA, resilient layouts, and room for compliance copy.
            Wire authentication and ledger services when you are ready—no redesign required to go from demo to pilot.
          </p>
          <div className="page-hero__cta">
            <Link to="/markets" className="btn btn--primary">
              Explore markets
            </Link>
            {!checked ? null : isAuthed ? (
              <Link to="/dashboard" className="btn btn--ghost">
                Workspace
              </Link>
            ) : (
              <Link to="/dashboard" className="btn btn--ghost">
                Open account overview
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="page-section">
        <div className="container">
          <div className="platform-grid">
            {PILLARS.map((p) => (
              <article key={p.title} className="platform-card">
                <h2>{p.title}</h2>
                <p>{p.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="page-section page-section--cta">
        <div className="container platform-cta">
          <div>
            <h2 className="platform-cta__title">Ready to stage your desk?</h2>
            <p className="platform-cta__text">
              Create an account route today—restrict it with auth tomorrow. The dashboard is shaped around balances and
              funding first.
            </p>
          </div>
          <Link
            to={checked && isAuthed ? '/dashboard' : '/signup'}
            className="btn btn--primary btn--lg"
          >
            {checked && isAuthed ? 'Workspace' : 'Get started'}
          </Link>
        </div>
      </section>
    </div>
  )
}
