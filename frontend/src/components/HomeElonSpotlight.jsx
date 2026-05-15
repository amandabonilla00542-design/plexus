import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ElonPortraitImg } from './ElonPortraitImg'
import './HomeElonSpotlight.css'

export function HomeElonSpotlight() {
  const { checked, isAuthed } = useAuth()

  return (
    <section className="home-elon-spotlight section-block" aria-labelledby="home-elon-spotlight-title">
      <div className="container">
        <p id="home-elon-spotlight-title" className="section-eyebrow">
          Operator signal · build what people want
        </p>
        <div className="home-elon-spotlight__quote-wrap">
          <div className="home-elon-spotlight__card">
            <ElonPortraitImg className="home-elon-spotlight__avatar" width={140} height={140} />
            <div className="home-elon-spotlight__body">
              <p className="home-elon-spotlight__text">
                &ldquo;You want to be rich? Build something people want. I put my money where my mouth is &mdash;
                that&apos;s why I&apos;m here.&rdquo;
              </p>
              <p className="home-elon-spotlight__author">&mdash; Elon Musk</p>
              <p className="home-elon-spotlight__hint">
                Excession LLC is for desks that think in decades: transparent surfaces, disciplined workflows, and speed where
                execution matters.
              </p>
              <div className="home-elon-spotlight__actions">
                {!checked ? (
                  <span className="home-elon-spotlight__actions-skeleton" aria-hidden />
                ) : isAuthed ? (
                  <>
                    <Link to="/dashboard" className="btn btn--primary">
                      Open workspace
                    </Link>
                    <Link to="/platform" className="btn btn--ghost">
                      Platform
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/signup" className="btn btn--primary">
                      Get started
                    </Link>
                    <Link to="/login" className="btn btn--ghost">
                      Sign in
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
