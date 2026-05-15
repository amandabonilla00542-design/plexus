import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './CtaBand.css'

export function CtaBand() {
  const { checked, isAuthed } = useAuth()

  return (
    <section className="cta-band">
      <div className="container cta-band__inner">
        <div>
          <h2 className="cta-band__title">Start with discipline. Scale with infrastructure.</h2>
          <p className="cta-band__text">
            Open a paper-first workflow today—swap in live rails when your compliance story is ready.
          </p>
        </div>
        <div className="cta-band__actions">
          {!checked ? null : isAuthed ? (
            <>
              <Link to="/dashboard" className="btn btn--primary btn--lg">
                Workspace
              </Link>
              <Link to="/markets" className="btn btn--ghost btn--lg">
                Markets
              </Link>
            </>
          ) : (
            <>
              <Link to="/signup" className="btn btn--primary btn--lg">
                Create account
              </Link>
              <Link to="/login" className="btn btn--ghost btn--lg">
                Sign in
              </Link>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
