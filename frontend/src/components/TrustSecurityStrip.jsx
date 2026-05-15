import './TrustSecurityStrip.css'

const ITEMS = [
  {
    title: 'Segregated client funds',
    body: 'Operational language and UI patterns aligned with how prime brokers describe custody and segregation.',
  },
  {
    title: 'Encryption in transit',
    body: 'TLS-first posture for web sessions—ready to pair with your HSM and key-rotation policies on the wire.',
  },
  {
    title: 'Immutable audit trail',
    body: 'Event-shaped UI hooks so every state change can be mirrored into your ledger and compliance exports.',
  },
  {
    title: 'Role-based access',
    body: 'Principal vs operator flows, approval queues, and read-only analyst seats—mapped to real desk org charts.',
  },
]

export function TrustSecurityStrip() {
  return (
    <section className="trust-strip section-block" aria-labelledby="trust-strip-heading">
      <div className="container">
        <div className="trust-strip__head">
          <p className="section-eyebrow">Trust &amp; controls</p>
          <h2 id="trust-strip-heading" className="section-title">
            What institutional desks expect to see on day one
          </h2>
          <p className="section-lead">
            These are presentation patterns—not regulatory claims. Wire your own disclosures, licenses, and risk
            warnings before going live.
          </p>
        </div>
        <ul className="trust-strip__grid">
          {ITEMS.map((item) => (
            <li key={item.title} className="trust-strip__card">
              <h3 className="trust-strip__card-title">{item.title}</h3>
              <p className="trust-strip__card-body">{item.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
