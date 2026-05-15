import './FeatureGrid.css'

const ITEMS = [
  {
    title: 'Tier-1 style liquidity story',
    body: 'Aggregated pricing narratives with depth cues—built so your desk can explain fills with confidence.',
  },
  {
    title: 'Operational safety rails',
    body: 'Margin snapshots, kill-switch UX patterns, and audit-friendly disclosure blocks ready for compliance review.',
  },
  {
    title: 'Workspace ergonomics',
    body: 'Dense dashboards without clutter: keyboard-first flows, contrast-aware surfaces, and persistent context panels.',
  },
  {
    title: 'Transparent economics',
    body: 'Fee language that traders respect—clear tiers, no theatrical promises, room for your jurisdiction edits.',
  },
]

export function FeatureGrid() {
  return (
    <section className="feature-grid section-block">
      <div className="container">
        <div className="feature-grid__head">
          <p className="section-eyebrow">Why desks choose Excession LLC</p>
          <h2 className="section-title">Best-in-class execution posture</h2>
          <p className="section-lead">
            This isn’t a casino skin—it’s a brokerage-grade presentation layer you can extend when your backend lands.
          </p>
        </div>
        <div className="feature-grid__cards">
          {ITEMS.map((item) => (
            <article key={item.title} className="feature-card">
              <h3 className="feature-card__title">{item.title}</h3>
              <p className="feature-card__body">{item.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
