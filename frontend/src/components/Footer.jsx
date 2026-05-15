import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { BRAND_LOGO_PNG } from '../config/brandAssets'
import './Footer.css'

export function Footer() {
  const { checked, isAuthed, logout } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await logout()
    navigate('/', { replace: true })
  }

  return (
    <footer className="footer">
      <div className="footer__inner container">
        <div className="footer__brand">
          <Link to="/" className="footer__brand-link" aria-label="Excession LLC — Home">
            <img
              className="footer__brand-logo"
              src={BRAND_LOGO_PNG}
              alt=""
              decoding="async"
            />
          </Link>
          <p className="footer__copy">
            Execution-focused brokerage experience. Risk disclosure: trading involves substantial risk of loss.
          </p>
        </div>
        <div className="footer__cols">
          <div>
            <h4 className="footer__h">Product</h4>
            <ul className="footer__list">
              <li>
                <Link to="/markets">Markets</Link>
              </li>
              <li>
                <Link to="/platform">Platform</Link>
              </li>
              {checked && isAuthed ? (
                <li>
                  <Link to="/dashboard">Dashboard</Link>
                </li>
              ) : null}
            </ul>
          </div>
          <div>
            <h4 className="footer__h">Company</h4>
            <ul className="footer__list">
              <li>
                <Link to="/about">About</Link>
              </li>
              <li>
                <Link to="/contact">Contact</Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="footer__h">Account</h4>
            <ul className="footer__list">
              {checked && isAuthed ? (
                <>
                  <li>
                    <Link to="/dashboard">Workspace</Link>
                  </li>
                  <li>
                    <button type="button" className="footer__signout" onClick={() => void handleSignOut()}>
                      Sign out
                    </button>
                  </li>
                </>
              ) : checked ? (
                <>
                  <li>
                    <Link to="/login">Log in</Link>
                  </li>
                  <li>
                    <Link to="/signup">Open account</Link>
                  </li>
                </>
              ) : (
                <li className="footer__list-muted">Loading…</li>
              )}
            </ul>
          </div>
        </div>
      </div>
      <div className="footer__bar">
        <div className="footer__bar-inner container">
          <span>© {new Date().getFullYear()} Excession LLC. All rights reserved.</span>
        </div>
      </div>
    </footer>
  )
}
