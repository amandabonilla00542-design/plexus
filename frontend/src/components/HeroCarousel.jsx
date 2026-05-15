import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './HeroCarousel.css'

const AUTOPLAY_MS = 8000

const SLIDES = [
  {
    id: 'liquidity',
    title: 'Institutional clarity. Retail speed.',
    subtitle:
      'Unified access to global markets with pricing transparency and execution engineered for serious traders.',
    image: '/assets/hero/slide-1.svg',
    alt: 'Markets hero — slide 1',
  },
  {
    id: 'risk',
    title: 'Risk controls that scale with you.',
    subtitle:
      'Portfolio snapshots, margin awareness, and guardrails designed to keep decisions deliberate—not emotional.',
    image: '/assets/hero/slide-2.svg',
    alt: 'Markets hero — slide 2',
  },
  {
    id: 'instruments',
    title: 'One platform. Many instruments.',
    subtitle:
      'FX, indices, commodities, and digital markets—presented in one coherent workspace with consistent tooling.',
    image: '/assets/hero/slide-3.svg',
    alt: 'Markets hero — slide 3',
  },
]

function jpgPath(slideIndex) {
  return `/assets/hero/slide-${slideIndex + 1}.jpg`
}

export function HeroCarousel() {
  const [index, setIndex] = useState(0)
  const { checked, isAuthed } = useAuth()

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % SLIDES.length)
    }, AUTOPLAY_MS)
    return () => window.clearInterval(id)
  }, [])

  const slide = SLIDES[index]

  return (
    <section className="hero-carousel" aria-roledescription="carousel">
      <div className="hero-carousel__bg" aria-hidden>
        <img
          key={slide.id}
          className="hero-carousel__bg-slide is-active"
          src={jpgPath(index)}
          alt=""
          width={1600}
          height={900}
          loading="eager"
          decoding="async"
          draggable={false}
          onError={(e) => {
            const el = e.currentTarget
            if (!el.src.includes('.svg')) {
              el.onerror = null
              el.src = slide.image
            }
          }}
        />
        <div className="hero-carousel__scrim" />
        <div className="hero-carousel__noise" />
        <div className="hero-carousel__vignette" aria-hidden />
      </div>

      <div className="hero-carousel__progress" key={slide.id} aria-hidden>
        <div className="hero-carousel__progress-fill" style={{ animationDuration: `${AUTOPLAY_MS}ms` }} />
      </div>

      <div className="hero-carousel__content container">
        <div className="hero-carousel__copy">
          <div className="hero-carousel__copy-inner" key={slide.id}>
            <p className="hero-carousel__eyebrow">Excession LLC · Global brokerage</p>
            <h1 className="hero-carousel__title">{slide.title}</h1>
            <p className="hero-carousel__subtitle">{slide.subtitle}</p>
            <div className="hero-carousel__cta">
              {!checked ? null : isAuthed ? (
                <>
                  <Link to="/dashboard" className="btn btn--accent">
                    Workspace
                  </Link>
                  <Link to="/markets" className="btn btn--outline-light">
                    Markets
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/signup" className="btn btn--accent">
                    Open account
                  </Link>
                  <Link to="/dashboard" className="btn btn--outline-light">
                    View dashboard demo
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="hero-carousel__panel" aria-hidden>
          <div className="hero-carousel__panel-frame">
            <img
              key={`${slide.id}-preview`}
              src={jpgPath(index)}
              alt={slide.alt}
              width={560}
              height={360}
              loading="eager"
              decoding="async"
              className="hero-carousel__preview-img"
              onError={(e) => {
                const el = e.currentTarget
                if (!el.src.includes('.svg')) {
                  el.onerror = null
                  el.src = slide.image
                }
              }}
            />
            <div className="hero-carousel__panel-shine" aria-hidden />
          </div>
        </div>
      </div>

      <div className="hero-carousel__controls container">
        <button
          type="button"
          className="hero-carousel__arrow"
          aria-label="Previous slide"
          onClick={() => setIndex((i) => (i - 1 + SLIDES.length) % SLIDES.length)}
        >
          ‹
        </button>
        <div className="hero-carousel__dots" role="tablist" aria-label="Slides">
          {SLIDES.map((s, i) => (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={i === index}
              className={`hero-carousel__dot ${i === index ? 'is-active' : ''}`}
              onClick={() => setIndex(i)}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
        <button
          type="button"
          className="hero-carousel__arrow"
          aria-label="Next slide"
          onClick={() => setIndex((i) => (i + 1) % SLIDES.length)}
        >
          ›
        </button>
      </div>
    </section>
  )
}
