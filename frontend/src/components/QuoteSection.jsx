import { useCallback, useState } from 'react'
import { ELON_PORTRAIT_SOURCES } from '../lib/elonPortraitSources'
import './QuoteSection.css'

export function QuoteSection() {
  const [srcIndex, setSrcIndex] = useState(0)
  const [showFallback, setShowFallback] = useState(false)

  const onImgError = useCallback(() => {
    setSrcIndex((i) => {
      if (i + 1 < ELON_PORTRAIT_SOURCES.length) return i + 1
      setShowFallback(true)
      return i
    })
  }, [])

  return (
    <section className="quote-section section-block">
      <div className="container">
        <div className="quote-card">
          <div className="quote-card__media">
            {!showFallback ? (
              <img
                src={ELON_PORTRAIT_SOURCES[srcIndex]}
                alt="Elon Musk"
                width={420}
                height={440}
                className="quote-card__img"
                onError={onImgError}
                decoding="async"
              />
            ) : null}
            <div className={`quote-card__fallback ${showFallback ? 'is-visible' : ''}`} aria-hidden>
              <span>LD</span>
            </div>
          </div>
          <div className="quote-card__body">
            <blockquote className="quote-card__quote">
              When something is important enough, you do it even if the odds are not in your favor.
            </blockquote>
            <p className="quote-card__cite">Elon Musk</p>
            <p className="quote-card__note">
              Excession LLC is built for operators who think long-term: disciplined workflows, transparent surfaces, and speed
              where it matters.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
