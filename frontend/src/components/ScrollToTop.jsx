import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/** SPA: scroll to top on route change so each page starts at the header. */
export function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}
