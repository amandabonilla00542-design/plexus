import { useCallback, useState } from 'react'
import { ELON_PORTRAIT_SOURCES } from './elonPortraitSources'

/**
 * Cycles through local brand assets and Wikimedia on load error.
 * @param {{ className?: string; width?: number; height?: number; alt?: string; style?: import('react').CSSProperties }} props
 */
export function ElonPortraitImg({ className, width = 70, height = 70, alt = 'Elon Musk', style }) {
  const [srcIndex, setSrcIndex] = useState(0)
  const [failed, setFailed] = useState(false)

  const onError = useCallback(() => {
    setSrcIndex((i) => {
      if (i + 1 < ELON_PORTRAIT_SOURCES.length) return i + 1
      setFailed(true)
      return i
    })
  }, [])

  if (failed) {
    return (
      <span
        role="img"
        aria-label={alt}
        className={className}
        style={{
          ...style,
          width,
          height,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          fontWeight: 800,
          fontSize: Math.round(width * 0.28),
          letterSpacing: '0.04em',
          color: '#fff',
          background: 'linear-gradient(145deg, var(--primary, #1a5c96), var(--primary-hover, #144a78))',
        }}
      >
        EM
      </span>
    )
  }

  return (
    <img
      src={ELON_PORTRAIT_SOURCES[srcIndex]}
      alt={alt}
      width={width}
      height={height}
      className={className}
      style={style}
      onError={onError}
      decoding="async"
    />
  )
}
