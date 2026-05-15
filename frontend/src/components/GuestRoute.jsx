import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './RouteGuard.css'

export function GuestRoute({ children }) {
  const { user, checked } = useAuth()

  if (!checked) {
    return (
      <div className="route-guard route-guard--loading">
        <p className="route-guard__text">Checking session…</p>
      </div>
    )
  }

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
