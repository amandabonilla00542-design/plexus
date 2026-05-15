import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ThemeToggle } from './ThemeToggle'
import { BRAND_LOGO_PNG } from '../config/brandAssets'
import './Navbar.css'

const linkClass = ({ isActive }) =>
  isActive ? 'nav__link nav__link--active' : 'nav__link'

const MAIN_ROUTES = [
  { to: '/', end: true, label: 'Home' },
  { to: '/markets', label: 'Markets' },
  { to: '/platform', label: 'Platform' },
  { to: '/about', label: 'About' },
]

function MainNavLinks({ onNavigate }) {
  return (
    <>
      {MAIN_ROUTES.map(({ to, end, label }) => (
        <NavLink key={to} to={to} className={linkClass} end={!!end} onClick={onNavigate}>
          {label}
        </NavLink>
      ))}
    </>
  )
}

function MobileDrawerContent({ onNavigate, isAuthed, onSignOut }) {
  return (
    <>
      <NavLink to="/" className="nav__drawer-brand" end onClick={onNavigate} aria-label="Excession LLC — Home">
        <img
          className="nav__drawer-brand-logo"
          src={BRAND_LOGO_PNG}
          alt=""
          decoding="async"
        />
      </NavLink>
      <MainNavLinks onNavigate={onNavigate} />
      {isAuthed ? (
        <NavLink to="/dashboard" className={linkClass} onClick={onNavigate}>
          Dashboard
        </NavLink>
      ) : null}
      <div className="nav__mobile-cta">
        {isAuthed ? (
          <>
            <NavLink to="/dashboard" className="btn btn--primary btn--block" onClick={onNavigate}>
              Workspace
            </NavLink>
            <button type="button" className="btn btn--ghost btn--block" onClick={onSignOut}>
              Sign out
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login" className="btn btn--ghost btn--block" onClick={onNavigate}>
              Log in
            </NavLink>
            <NavLink to="/signup" className="btn btn--primary btn--block" onClick={onNavigate}>
              Open account
            </NavLink>
          </>
        )}
      </div>
    </>
  )
}

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { checked, isAuthed, logout } = useAuth()

  const handleSignOut = async () => {
    setMenuOpen(false)
    await logout()
    navigate('/', { replace: true })
  }

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (menuOpen) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = prev
      }
    }
  }, [menuOpen])

  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  const closeMenu = () => setMenuOpen(false)

  const mobileDrawer =
    menuOpen && typeof document !== 'undefined'
      ? createPortal(
          <>
            <div className="nav__backdrop" aria-hidden onClick={closeMenu} />
            <nav
              id="nav-main-links-mobile"
              className="nav__links nav__links--drawer"
              aria-label="Main"
            >
              <MobileDrawerContent
                onNavigate={closeMenu}
                isAuthed={isAuthed}
                onSignOut={handleSignOut}
              />
            </nav>
          </>,
          document.body,
        )
      : null

  return (
    <header className={`nav${menuOpen ? ' nav--menu-open' : ''}`}>
      <div className="nav__inner container">
        <NavLink to="/" className="nav__brand" end onClick={closeMenu} aria-label="Excession LLC — Home">
          <img
            className="nav__brand-logo"
            src={BRAND_LOGO_PNG}
            alt=""
            decoding="async"
          />
        </NavLink>

        <nav id="nav-main-links" className="nav__links nav__links--desktop" aria-label="Main">
          <MainNavLinks onNavigate={closeMenu} />
        </nav>

        <div className="nav__actions">
          <ThemeToggle />
          {!checked ? (
            <span className="nav__auth-skeleton" aria-hidden="true" />
          ) : isAuthed ? (
            <>
              <NavLink to="/dashboard" className="btn btn--primary nav__btn-desktop" onClick={closeMenu}>
                Workspace
              </NavLink>
              <button type="button" className="btn btn--ghost nav__btn-desktop" onClick={() => void handleSignOut()}>
                Sign out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="btn btn--ghost nav__btn-desktop" onClick={closeMenu}>
                Log in
              </NavLink>
              <NavLink to="/signup" className="btn btn--primary nav__btn-desktop" onClick={closeMenu}>
                Open account
              </NavLink>
            </>
          )}

          <button
            type="button"
            className={`nav__menu-toggle${menuOpen ? ' nav__menu-toggle--open' : ''}`}
            aria-expanded={menuOpen}
            aria-controls="nav-main-links-mobile"
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span className="nav__menu-bar" aria-hidden />
            <span className="nav__menu-bar" aria-hidden />
            <span className="nav__menu-bar" aria-hidden />
          </button>
        </div>
      </div>

      {mobileDrawer}
    </header>
  )
}
