/**
 * Protects `/api/admin/*`. Send header: `X-Admin-Secret: <ADMIN_PANEL_SECRET>`.
 * Set a long random secret in `.env` — never commit it.
 */
/** Minimum length (after trim). Use 24+ in production when you can. */
const MIN_SECRET_LEN = 16

function requireAdmin(req, res, next) {
  const configured = String(process.env.ADMIN_PANEL_SECRET || '').trim()
  if (!configured || configured.length < MIN_SECRET_LEN) {
    return res.status(503).json({
      message: `Admin API disabled. Set ADMIN_PANEL_SECRET in .env (at least ${MIN_SECRET_LEN} characters, no extra spaces).`,
    })
  }
  const sent = String(req.get('x-admin-secret') || '').trim()
  if (!sent || sent !== configured) {
    return res.status(401).json({ message: 'Invalid or missing admin secret.' })
  }
  next()
}

module.exports = requireAdmin
