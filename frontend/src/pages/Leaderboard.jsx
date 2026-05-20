import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { BRAND_LOGO_PNG } from '../config/brandAssets'
import {
  LEADERBOARD_TOP_50,
  LEADERBOARD_UPDATED_LABEL,
  formatLeaderboardUsd,
} from '../lib/leaderboardMockData'
import './Leaderboard.css'

const PODIUM = LEADERBOARD_TOP_50.slice(0, 3)
const REST = LEADERBOARD_TOP_50.slice(3)
const TOP_BOOK = LEADERBOARD_TOP_50[0]?.bookUsd || 1

function initials(name) {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function bookSharePct(bookUsd) {
  return Math.max(4, Math.round((bookUsd / TOP_BOOK) * 100))
}

function RegionChip({ code, region }) {
  return (
    <span className="lb-chip" title={region}>
      <span className="lb-chip__code">{code}</span>
      <span className="lb-chip__region">{region}</span>
    </span>
  )
}

function StatusBadge({ status }) {
  if (status === 'vip') {
    return <span className="lb-status lb-status--vip">VIP desk</span>
  }
  return <span className="lb-status lb-status--active">Active</span>
}

function PodiumCard({ entry, order }) {
  const medal = entry.rank === 1 ? 'Gold' : entry.rank === 2 ? 'Silver' : 'Bronze'
  return (
    <article className={`lb-podium-slot lb-podium-slot--${order}`} style={{ order }}>
      <div className={`lb-podium-card lb-podium-card--r${entry.rank}`}>
        <div className="lb-podium-card__shine" aria-hidden />
        <span className="lb-podium-card__medal" aria-hidden>
          {medal}
        </span>
        <span className="lb-podium-card__rank">#{entry.rank}</span>
        <div className="lb-avatar lb-avatar--lg" aria-hidden>
          {initials(entry.name)}
        </div>
        <h2 className="lb-podium-card__name">{entry.name}</h2>
        <RegionChip code={entry.countryCode} region={entry.region} />
        <p className="lb-podium-card__balance numeric">{formatLeaderboardUsd(entry.bookUsd)}</p>
        <div className="lb-podium-card__bar" aria-hidden>
          <span className="lb-podium-card__bar-fill" style={{ width: `${bookSharePct(entry.bookUsd)}%` }} />
        </div>
        <StatusBadge status={entry.status} />
      </div>
      <div className={`lb-pedestal lb-pedestal--r${entry.rank}`} aria-hidden />
    </article>
  )
}

function BoardScrollTable({ children }) {
  const scrollRef = useRef(null)
  const [edges, setEdges] = useState({ left: false, right: true, overflow: false })

  const updateEdges = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const overflow = el.scrollWidth > el.clientWidth + 2
    const left = el.scrollLeft > 8
    const right = el.scrollLeft < el.scrollWidth - el.clientWidth - 8
    setEdges({ left, right: overflow && right, overflow })
  }, [])

  useEffect(() => {
    updateEdges()
    const el = scrollRef.current
    if (!el) return undefined
    el.addEventListener('scroll', updateEdges, { passive: true })
    const ro = new ResizeObserver(updateEdges)
    ro.observe(el)
    return () => {
      el.removeEventListener('scroll', updateEdges)
      ro.disconnect()
    }
  }, [updateEdges])

  return (
    <div
      className={`lb-board__scroll-outer${edges.overflow ? ' lb-board__scroll-outer--overflow' : ''}${edges.left ? ' lb-board__scroll-outer--can-left' : ''}${edges.right ? ' lb-board__scroll-outer--can-right' : ''}`}
    >
      {edges.overflow ? (
        <p className="lb-board__scroll-hint" role="note">
          <span className="lb-board__scroll-hint-icon" aria-hidden>
            ↔
          </span>
          Swipe or scroll sideways to see region, book total, and vs #1
        </p>
      ) : null}
      <div ref={scrollRef} className="lb-board__scroll" tabIndex={0}>
        {children}
      </div>
    </div>
  )
}

export function Leaderboard() {
  const totalBooked = LEADERBOARD_TOP_50.reduce((s, e) => s + e.bookUsd, 0)
  const regions = new Set(LEADERBOARD_TOP_50.map((e) => e.region)).size

  return (
    <div className="lb-page">
      <section className="lb-hero">
        <div className="lb-hero__grid" aria-hidden />
        <div className="lb-hero__vignette" aria-hidden />
        <div className="container lb-hero__content">
          <div className="lb-hero__top">
            <div className="lb-hero__copy">
              <p className="lb-hero__eyebrow">
                <span className="lb-live" aria-hidden />
                Excession LLC · global desk rankings
              </p>
              <h1 className="lb-hero__title">Leaderboard</h1>
              <p className="lb-hero__lead">
                The fifty largest funded books on the desk — United States, Singapore, Pakistan, United Kingdom, and
                Europe. Ranked by total USD book (principal + accrued yield).
              </p>
            </div>
            <img className="lb-hero__logo" src={BRAND_LOGO_PNG} alt="" width={120} height={120} />
          </div>
          <div className="lb-stats">
            <div className="lb-stat">
              <span className="lb-stat__label">Combined top 50</span>
              <span className="lb-stat__value numeric">{formatLeaderboardUsd(totalBooked)}</span>
            </div>
            <div className="lb-stat">
              <span className="lb-stat__label">Largest single book</span>
              <span className="lb-stat__value numeric">{formatLeaderboardUsd(TOP_BOOK)}</span>
            </div>
            <div className="lb-stat">
              <span className="lb-stat__label">Regions represented</span>
              <span className="lb-stat__value numeric">{regions}</span>
            </div>
            <div className="lb-stat lb-stat--muted">
              <span className="lb-stat__label">Feed</span>
              <span className="lb-stat__value lb-stat__value--sm">{LEADERBOARD_UPDATED_LABEL}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="lb-podium-section">
        <div className="container">
          <header className="lb-section-head">
            <h2 className="lb-section-head__title">Top desks</h2>
            <p className="lb-section-head__sub">Podium · book totals in USD</p>
          </header>
          <div className="lb-podium">
            <PodiumCard entry={PODIUM[1]} order={1} />
            <PodiumCard entry={PODIUM[0]} order={2} />
            <PodiumCard entry={PODIUM[2]} order={3} />
          </div>
        </div>
      </section>

      <section className="lb-board-section">
        <div className="container">
          <header className="lb-section-head">
            <h2 className="lb-section-head__title">Full board</h2>
            <p className="lb-section-head__sub">Ranks 4–50 · relative book vs #1</p>
          </header>
          <div className="lb-board">
            <div className="lb-board__toolbar">
              <span className="lb-board__tag">50 desks</span>
              <span className="lb-board__tag lb-board__tag--live">
                <span className="lb-live lb-live--sm" aria-hidden />
                Live board
              </span>
            </div>
            <BoardScrollTable>
              <table className="lb-table">
                <thead>
                  <tr>
                    <th scope="col">Rank</th>
                    <th scope="col">Desk</th>
                    <th scope="col">Region</th>
                    <th scope="col" className="lb-table__num">
                      Book (USD)
                    </th>
                    <th scope="col" className="lb-table__bar-col">
                      vs #1
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {REST.map((entry) => (
                    <tr key={entry.rank} className={entry.rank <= 10 ? 'lb-table__row--elite' : undefined}>
                      <td className="lb-table__rank numeric">#{entry.rank}</td>
                      <td>
                        <div className="lb-table__desk">
                          <div className="lb-avatar" aria-hidden>
                            {initials(entry.name)}
                          </div>
                          <div>
                            <span className="lb-table__name">{entry.name}</span>
                            <StatusBadge status={entry.status} />
                          </div>
                        </div>
                      </td>
                      <td>
                        <RegionChip code={entry.countryCode} region={entry.region} />
                      </td>
                      <td className="lb-table__num numeric">{formatLeaderboardUsd(entry.bookUsd)}</td>
                      <td className="lb-table__bar-col">
                        <div className="lb-bar" title={`${bookSharePct(entry.bookUsd)}% of #1`}>
                          <span className="lb-bar__fill" style={{ width: `${bookSharePct(entry.bookUsd)}%` }} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </BoardScrollTable>
          </div>
          <p className="lb-footnote">
            Desk rankings reflect funded book size on Excession. Activation and deposit rules apply per your workspace.
          </p>
          <div className="lb-cta">
            <Link to="/signup" className="btn btn--primary btn--lg">
              Open your desk
            </Link>
            <Link to="/dashboard" className="btn btn--ghost btn--lg">
              Workspace
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
