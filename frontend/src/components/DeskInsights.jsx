import { Link } from 'react-router-dom'
import './DeskInsights.css'

const POSTS = [
  {
    tag: 'Rates',
    title: 'Curve steepening and what desks are watching this week',
    meta: '6 min read · desk note',
  },
  {
    tag: 'Risk',
    title: 'Margin shocks: how to rehearse kill-switch drills without spooking clients',
    meta: '8 min read · risk',
  },
  {
    tag: 'Product',
    title: 'Why consolidated tape UX still matters in a fragmented crypto market',
    meta: '5 min read · product',
  },
]

export function DeskInsights() {
  return (
    <section className="desk-insights section-block" aria-labelledby="insights-heading">
      <div className="container">
        <div className="desk-insights__head">
          <p className="section-eyebrow">From the desk</p>
          <h2 id="insights-heading" className="section-title">
            Commentary that earns the bookmark bar
          </h2>
          <p className="section-lead">
            Wire this grid to your CMS or Substack. For now it signals that Excession LLC is a broker narrative—not only a
            charting toy.
          </p>
        </div>
        <ul className="desk-insights__grid">
          {POSTS.map((post) => (
            <li key={post.title}>
              <article className="desk-insights__card">
                <p className="desk-insights__tag">{post.tag}</p>
                <h3 className="desk-insights__title">
                  <span className="desk-insights__title-link">{post.title}</span>
                </h3>
                <p className="desk-insights__meta">{post.meta}</p>
              </article>
            </li>
          ))}
        </ul>
        <p className="desk-insights__foot">
          <Link to="/markets" className="desk-insights__link">
            View markets & coverage →
          </Link>
        </p>
      </div>
    </section>
  )
}
