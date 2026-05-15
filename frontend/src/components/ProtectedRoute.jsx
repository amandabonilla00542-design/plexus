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

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return children
}
