import './StatsStrip.css'

export function StatsStrip() {
  return (
    <section className="stats-strip">
      <div className="container stats-strip__grid">
        <div className="stats-strip__intro">
          <h2 className="stats-strip__title">Built for decisive execution</h2>
          <p className="stats-strip__lead">
            Premium brokerage surfaces: transparent pricing language, fast routing UX, and controls that stay calm under
            volatility.
          </p>
        </div>
        <div className="stats-strip__metrics">
          <div className="stats-strip__metric">
            <span className="stats-strip__value numeric">&lt;14ms</span>
            <span className="stats-strip__label">Targeted latency tier · simulated</span>
          </div>
          <div className="stats-strip__metric">
            <span className="stats-strip__value numeric">1:200</span>
            <span className="stats-strip__label">Max leverage · jurisdiction-dependent</span>
          </div>
          <div className="stats-strip__metric">
            <span className="stats-strip__value numeric">2,100+</span>
            <span className="stats-strip__label">Instruments · roadmap-linked</span>
          </div>
        </div>
      </div>
    </section>
  )
}
