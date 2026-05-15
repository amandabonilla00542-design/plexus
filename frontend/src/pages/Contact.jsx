import { useCallback, useEffect, useRef, useState } from 'react'
import './AboutContact.css'

const TOAST_MS = 4500
const SUBMIT_MIN_MS = 2400

function delay(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

export function Contact() {
  const formRef = useRef(null)
  const [toastOpen, setToastOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const hideTimer = useRef(null)

  useEffect(() => {
    if (!toastOpen) return
    hideTimer.current = window.setTimeout(() => setToastOpen(false), TOAST_MS)
    return () => {
      if (hideTimer.current) window.clearTimeout(hideTimer.current)
    }
  }, [toastOpen])

  const onSubmit = useCallback(async (e) => {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    try {
      await delay(SUBMIT_MIN_MS)
      formRef.current?.reset()
      setToastOpen(true)
    } finally {
      setSubmitting(false)
    }
  }, [submitting])

  return (
    <div className="page-simple">
      <div className="container page-simple__inner page-simple__inner--narrow">
        <p className="section-eyebrow">Contact</p>
        <h1 className="page-simple__title">Talk to the desk</h1>
        <p className="page-simple__lead">
          Share what you need—routing, coverage, or onboarding. We read every message and reply as soon as we can.
        </p>

        <form ref={formRef} className="contact-form" onSubmit={(ev) => void onSubmit(ev)} aria-busy={submitting}>
          <fieldset className="contact-form__fields" disabled={submitting}>
            <label className="contact-field">
              <span>Name</span>
              <input name="name" required autoComplete="name" placeholder="Your name" />
            </label>
            <label className="contact-field">
              <span>Email</span>
              <input name="email" type="email" required autoComplete="email" placeholder="you@firm.com" />
            </label>
            <label className="contact-field">
              <span>Message</span>
              <textarea name="message" rows={5} required placeholder="How can we help?" />
            </label>
          </fieldset>
          <button type="submit" className="btn btn--primary contact-form__submit" disabled={submitting}>
            {submitting ? (
              <span className="contact-form__submit-inner">
                <span className="contact-form__spinner" aria-hidden />
                Sending…
              </span>
            ) : (
              'Send message'
            )}
          </button>
        </form>

        {toastOpen ? (
          <div className="contact-toast" role="status" aria-live="polite">
            Message received. We&apos;ll respond shortly.
          </div>
        ) : null}
      </div>
    </div>
  )
}
