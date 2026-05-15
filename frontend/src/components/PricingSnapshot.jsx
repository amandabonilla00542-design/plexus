import { Link } from 'react-router-dom'
import './PricingSnapshot.css'

const ROWS = [
  { label: 'Listed equities & ETFs', value: 'Per-share or bps—your schedule' },
  { label: 'FX majors', value: 'Raw spread + disclosed markup' },
  { label: 'Crypto spot', value: 'Tiered maker/taker or all-in' },
  { label: 'Platform', value: 'Seat-based or AUM-linked' },
]

export function PricingSnapshot() {
  return (
    <section className="pricing-snap section-block" aria-labelledby="pricing-heading">
      <div className="container pricing-snap__layout">
        <div className="pricing-snap__intro">
          <p className="section-eyebrow">Economics</p>
          <h2 id="pricing-heading" className="section-title">
            Fee language traders can reconcile with their blotter
          </h2>
          <p className="section-lead">
            Professional brokers publish schedules, not slogans. Use this block as a template—swap in your regulator’s
            required wording and real numbers.
          </p>
          <Link to="/contact" className="btn btn--ghost">
            Request a schedule
          </Link>
        </div>
        <div className="pricing-snap__panel" role="region" aria-label="Sample fee categories">
          <p className="pricing-snap__panel-note">Illustrative categories only</p>
          <table className="pricing-snap__table">
            <tbody>
              {ROWS.map((row) => (
                <tr key={row.label}>
                  <th scope="row">{row.label}</th>
                  <td>{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
