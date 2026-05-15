import { useCallback, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import './LiveChatBubble.css'

const SUPPORT_EMAIL = 'info@excessionllc.org'
const MAILTO = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('Excession desk support')}`

export function LiveChatBubble() {
  const { pathname } = useLocation()
  const enabled = pathname === '/' || pathname === '/dashboard'

  const rootRef = useRef(null)
  const dragRef = useRef({
    active: false,
    moved: false,
    pointerId: null,
    offsetX: 0,
    offsetY: 0,
    startX: 0,
    startY: 0,
  })
  const [pos, setPos] = useState(null)

  const endDrag = useCallback((e) => {
    const d = dragRef.current
    if (!d.active) return
    rootRef.current?.releasePointerCapture?.(e.pointerId)
    if (!d.moved) {
      window.location.href = MAILTO
    }
    d.active = false
    d.pointerId = null
  }, [])

  const onPointerDown = useCallback((e) => {
    if (e.button !== 0) return
    const el = rootRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    setPos({ left: rect.left, top: rect.top })
    dragRef.current = {
      active: true,
      moved: false,
      pointerId: e.pointerId,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
      startX: e.clientX,
      startY: e.clientY,
    }
    el.setPointerCapture(e.pointerId)
    e.preventDefault()
  }, [])

  const onPointerMove = useCallback((e) => {
    const d = dragRef.current
    if (!d.active || e.pointerId !== d.pointerId) return
    if (!d.moved && (Math.abs(e.clientX - d.startX) > 5 || Math.abs(e.clientY - d.startY) > 5)) {
      d.moved = true
    }
    setPos({ left: e.clientX - d.offsetX, top: e.clientY - d.offsetY })
  }, [])

  if (!enabled) return null

  const isDashboard = pathname === '/dashboard'

  return (
    <button
      type="button"
      ref={rootRef}
      className={`live-chat-bubble${isDashboard ? ' live-chat-bubble--dash' : ''}${pos ? ' live-chat-bubble--placed' : ''}`}
      style={pos ? { left: pos.left, top: pos.top } : undefined}
      aria-label="Live desk support — tap to email our team"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      <span className="live-chat-bubble__hint" aria-hidden>
        <span className="live-chat-bubble__hint-text">Hi — need help?</span>
        <span className="live-chat-bubble__typing">
          <span />
          <span />
          <span />
        </span>
      </span>

      <span className="live-chat-bubble__ring" aria-hidden />

      <span className="live-chat-bubble__avatar" aria-hidden>
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="32" r="32" fill="url(#liveChatFace)" />
          <ellipse cx="32" cy="38" rx="14" ry="12" fill="#f4c9a8" />
          <path
            d="M18 34c2-8 8-12 14-12s12 4 14 12"
            stroke="#5c4030"
            strokeWidth="2"
            fill="#3d2817"
          />
          <circle cx="26" cy="36" r="2" fill="#2a1810" />
          <circle cx="38" cy="36" r="2" fill="#2a1810" />
          <path d="M28 44c2 2 6 2 8 0" stroke="#8b5a45" strokeWidth="1.5" strokeLinecap="round" />
          <path
            d="M44 30c6 2 8 8 6 14"
            stroke="#2a3f5c"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
          <ellipse cx="48" cy="38" rx="5" ry="7" fill="#1e3350" opacity="0.9" />
          <defs>
            <linearGradient id="liveChatFace" x1="16" y1="8" x2="48" y2="56" gradientUnits="userSpaceOnUse">
              <stop stopColor="#2d6ba8" />
              <stop offset="1" stopColor="#144a78" />
            </linearGradient>
          </defs>
        </svg>
      </span>

      <span className="live-chat-bubble__status" aria-hidden>
        <span className="live-chat-bubble__status-dot" />
      </span>
    </button>
  )
}
