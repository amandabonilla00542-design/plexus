import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './RouteGuard.css'

export function ProtectedRoute({ children }) {
  const { user, checked } = useAuth()
  const location = useLocation()

  if (!checked) {
    return (
      <div className="route-guard route-guard--loading">
        <p className="route-guard__text">Checking session…</p>
      </div>
    )
  }

  const fromPath = `${location.pathname}${location.search || ''}`

  if (!user) {
    return <Navigate to="/login" replace state={{ from: fromPath }} />
  }

  if (user.verified === false) {
    return <Navigate to="/login" replace state={{ from: fromPath, needsVerification: true }} />
  }

  return children
}
