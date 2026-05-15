export function AdminElonStrip({ profileHero = false }) {
  return (
    <div
      className={`admin-elon${profileHero ? ' admin-elon--profile-hero' : ''}`}
      aria-label={profileHero ? 'Desk profile' : 'Excession desk'}
    >
      <div className="admin-elon__card">
        <div className="admin-elon__media">
          <img
            src="/assets/brand/elon-portrait.png"
            alt="Elon Musk"
            width={72}
            height={72}
            className="admin-elon__img"
          />
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
