import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './HowItWorks.css'

const STEPS = [
  {
    step: '01',
    title: 'Open & verify',
    body: 'Collect KYC/AML in your jurisdiction. This shell routes users to signup and your future identity provider.',
  },
  {
    step: '02',
    title: 'Fund the workspace',
    body: 'Wire, ACH, stablecoin rails—whatever your treasury supports. Surface limits and cut-off times clearly.',
  },
  {
    step: '03',
    title: 'Trade with guardrails',
    body: 'Margin, exposure caps, and kill switches live next to the blotter so risk never feels like an afterthought.',
  },
]

export function HowItWorks() {
  const { checked, isAuthed } = useAuth()

  return (
    <section className="how-it-works section-block" aria-labelledby="how-heading">
      <div className="container">
        <div className="how-it-works__head">
          <p className="section-eyebrow">Onboarding</p>
          <h2 id="how-heading" className="section-title">
            From first login to first ticket—in three beats
          </h2>
          <p className="section-lead">
            Map each step to your real APIs later. For now, the flow reads like a serious broker—not a signup funnel
            with hidden friction.
          </p>
        </div>
        <ol className="how-it-works__steps">
          {STEPS.map((s) => (
            <li key={s.step} className="how-it-works__step">
              <span className="how-it-works__badge" aria-hidden="true">
                {s.step}
              </span>
              <div>
                <h3 className="how-it-works__title">{s.title}</h3>
                <p className="how-it-works__body">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="how-it-works__foot">
          <Link to={checked && isAuthed ? '/dashboard' : '/signup'} className="how-it-works__link">
            {checked && isAuthed ? 'Open workspace →' : 'Start onboarding →'}
          </Link>
        </p>
      </div>
    </section>
  )
}
