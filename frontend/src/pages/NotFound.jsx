import { Link, useLocation } from 'react-router-dom'
import './NotFound.css'

export function NotFound() {
  const location = useLocation()

  return (
    <div className="not-found">
      <div className="not-found__bg" aria-hidden />
      <div className="not-found__vignette" aria-hidden />
      <div className="not-found__inner container">
        <div className="not-found__card">
          <p className="not-found__eyebrow">Error 404</p>
          <p className="not-found__code" aria-hidden="true">
            404
          </p>
          <h1 className="not-found__title">This route isn’t on the map</h1>
          <p className="not-found__lead">
            There is no page at{' '}
            <code className="not-found__path">{location.pathname}</code>. Double-check the URL or return to a known
            destination.
          </p>
          <div className="not-found__actions">
            <Link to="/" className="btn btn--primary">
              Home
            </Link>
            <Link to="/markets" className="btn btn--ghost not-found__btn-ghost">
              Markets
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
