import { useCallback, useState } from 'react'
import { ELON_PORTRAIT_SOURCES } from './lib/elonPortraitSources'

export function AdminElonStrip({ profileHero = false }) {
  const [srcIndex, setSrcIndex] = useState(0)
  const [showFallback, setShowFallback] = useState(false)

  const onImgError = useCallback(() => {
    setSrcIndex((i) => {
      if (i + 1 < ELON_PORTRAIT_SOURCES.length) return i + 1
      setShowFallback(true)
      return i
    })
  }, [])

  const src = ELON_PORTRAIT_SOURCES[Math.min(srcIndex, ELON_PORTRAIT_SOURCES.length - 1)]

  return (
    <div
      className={`admin-elon${profileHero ? ' admin-elon--profile-hero' : ''}`}
      aria-label={profileHero ? 'Desk profile' : 'Operator signal'}
    >
      <div className="admin-elon__card">
        <div className="admin-elon__media">
          {!showFallback ? (
            <img
              src={src}
              alt="Elon Musk"
              width={72}
              height={72}
              className="admin-elon__img"
              onError={onImgError}
              decoding="async"
            />
          ) : null}
          <div className={`admin-elon__fallback ${showFallback ? 'is-on' : ''}`} aria-hidden>
            EM
          </div>
        </div>
        <div className="admin-elon__body">
          <p className="admin-elon__quote">
            &ldquo;You want to be rich? Build something people want. I put my money where my mouth is &mdash;
            that&apos;s why I&apos;m here.&rdquo;
          </p>
          <p className="admin-elon__cite">&mdash; Elon Musk</p>
          <p className="admin-elon__note text-muted">
            Watch the combined book as deposits and yield move &mdash; one desk, full visibility.
          </p>
        </div>
      </div>
    </div>
  )
}
