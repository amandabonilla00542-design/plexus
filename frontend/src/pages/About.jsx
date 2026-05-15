import { Link } from 'react-router-dom'
import './About.css'

const PILLARS = [
  {
    title: 'Execution as a product',
    body: 'Latency, fill quality, and post-trade clarity are surfaced where traders make decisions—not buried in PDFs or support tickets.',
  },
  {
    title: 'Risk before rhetoric',
    body: 'Margin, exposure, and policy language are designed to read like a risk committee signed off—because one day they will.',
  },
  {
    title: 'Global desk, one surface',
    body: 'FX, digital assets, and listed instruments share one coherent workspace so your team does not context-switch across vendors.',
  },
]

const METRICS = [
  { value: '24/7', label: 'Coverage posture', hint: 'Where products permit' },
  { value: 'Tier-1', label: 'Liquidity narrative', hint: 'Configurable per venue' },
  { value: '100%', label: 'UI ownership', hint: 'Your brand, your rails' },
]

const ORBIT_VENTURES = ['SpaceX', 'Tesla', 'xAI', 'Neuralink', 'The Boring Company']

export function About() {
  return (
    <div className="about-page">
      <section className="about-hero">
        <div className="about-hero__bg" aria-hidden />
        <div className="container about-hero__content">
          <p className="about-hero__eyebrow">Excession LLC · Company</p>
          <h1 className="about-hero__title">Markets workspace for a portfolio that moves civilization&apos;s needle</h1>
          <p className="about-hero__lead">
            This site is presented under the Excession LLC brand: an institutional-grade brokerage shell for operators who
            think in decades. Financial press has widely described an Austin-based entity by the same name as Elon
            Musk&apos;s single family office—a lean team coordinating major transactions and capital flows across the
            ventures he leads. The workspace you are exploring is the public markets layer for that story: transparent
            economics, disciplined workflows, and room for compliance to lead—not casino chrome.
          </p>
          <div className="about-hero__cta">
            <Link to="/contact" className="btn btn--primary btn--about-lg">
              Speak with the desk
            </Link>
            <Link to="/platform" className="btn btn--ghost btn--about-lg about-hero__btn-outline">
              Platform overview
            </Link>
          </div>
        </div>
      </section>

      <section className="about-metrics" aria-label="Operating principles at a glance">
        <div className="container about-metrics__grid">
          {METRICS.map((m) => (
            <div key={m.label} className="about-metric">
              <p className="about-metric__value">{m.value}</p>
              <p className="about-metric__label">{m.label}</p>
              <p className="about-metric__hint">{m.hint}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="about-orbit" aria-labelledby="orbit-heading">
        <div className="container about-orbit__inner">
          <header className="about-orbit__head">
            <p className="section-eyebrow">Ecosystem</p>
            <h2 id="orbit-heading" className="about-orbit__title">
              The orbit this desk is built to reflect
            </h2>
            <p className="about-orbit__lead">
              Reporters and filings have tied the Excession LLC name to financing and treasury work around high-profile
              deals—including the 2022 Twitter acquisition, where Morgan Stanley margin loans and Tesla collateral drew
              global headlines. Day to day, the same constellation of companies sits in every allocator&apos;s mental
              map: deep-tech launch cadence, energy transition, AI infrastructure, neural interfaces, and tunnel
              mobility. Each remains its own legal entity; Excession LLC is how the public narrative often groups the
              capital and coordination layer behind them.
            </p>
          </header>
          <ul className="about-orbit__tags" aria-label="Ventures commonly discussed alongside this office">
            {ORBIT_VENTURES.map((name) => (
              <li key={name} className="about-orbit__tag">
                {name}
              </li>
            ))}
          </ul>
          <p className="about-orbit__note">
            The name &ldquo;Excession&rdquo; nods to Iain M. Banks&apos;s Culture novels—an object so advanced it
            rewrites the rules. We borrow the metaphor, not the fiction: your screens should feel as deliberate as a
            launch checklist, not as noisy as a retail feed.
          </p>
        </div>
      </section>

      <section className="about-split">
        <div className="container about-split__grid">
          <div className="about-split__copy">
            <h2 className="about-split__title">Mission</h2>
            <p className="about-split__lead">
              Give professional trading organizations a presentation layer that matches the rigor of their risk,
              treasury, and compliance functions—without sacrificing speed for the end user.
            </p>
            <p className="about-split__body">
              Whether you are piloting a new desk, expanding into digital markets, or refreshing a legacy terminal,
              Excession LLC is structured so your narrative, disclosures, and workflow rules slot in cleanly. The
              interface scales from demo to production without a redesign cycle.
            </p>
          </div>
          <aside className="about-split__aside">
            <blockquote className="about-quote">
              <p>
                When something is important enough, you do it even if the odds are not in your favor.
              </p>
              <footer>— Often cited in engineering-led cultures; displayed here as inspiration for long-horizon builders.</footer>
            </blockquote>
          </aside>
        </div>
      </section>

      <section className="about-pillars">
        <div className="container">
          <header className="about-pillars__head">
            <p className="section-eyebrow">How we work</p>
            <h2 className="about-pillars__title">Principles that ship with the product</h2>
            <p className="about-pillars__intro">
              Every screen is an opportunity to reduce ambiguity. These pillars guide layout, copy tone, and component
              decisions across the Excession LLC surface.
            </p>
          </header>
          <div className="about-pillars__grid">
            {PILLARS.map((p) => (
              <article key={p.title} className="about-pillar-card">
                <h3>{p.title}</h3>
                <p>{p.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="about-cta">
        <div className="container about-cta__inner">
          <div>
            <h2 className="about-cta__title">Stage your next chapter</h2>
            <p className="about-cta__text">
              Book a walkthrough of markets coverage, onboarding flows, and the account dashboard—including funding
              policy and authorization paths your compliance team can review.
            </p>
          </div>
          <div className="about-cta__actions">
            <Link to="/contact" className="btn btn--primary btn--about-lg">
              Request briefing
            </Link>
            <Link to="/markets" className="btn btn--ghost btn--about-lg">
              View markets
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
