import { Outlet } from 'react-router-dom'
import { Navbar } from '../components/Navbar'
import { Footer } from '../components/Footer'
import { LiveChatBubble } from '../components/LiveChatBubble'
import { ScrollToTop } from '../components/ScrollToTop'
import './MainLayout.css'

export function MainLayout() {
  return (
    <div className="layout">
      <ScrollToTop />
      <Navbar />
      <main className="layout__main">
        <Outlet />
      </main>
      <Footer />
      <LiveChatBubble />
    </div>
  )
}
