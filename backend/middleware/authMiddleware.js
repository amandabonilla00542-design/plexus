const jwt = require('jsonwebtoken')

const COOKIE_NAME = 'excession_token'
/** @deprecated read for migration; cleared on logout */
const LEGACY_COOKIE_NAME = 'layerdodge_token'

function readToken(req) {
  const auth = req.headers.authorization
  if (auth && auth.startsWith('Bearer ')) {
    return auth.slice(7).trim()
  }
  if (req.cookies && req.cookies[COOKIE_NAME]) {
    return req.cookies[COOKIE_NAME]
  }
  if (req.cookies && req.cookies[LEGACY_COOKIE_NAME]) {
    return req.cookies[LEGACY_COOKIE_NAME]
  }
  return null
}

function requireAuth(req, res, next) {
  const token = readToken(req)
  if (!token) {
    return res.status(401).json({ message: 'Not signed in' })
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    req.userId = payload.sub
    return next()
  } catch {
    return res.status(401).json({ message: 'Session invalid or expired' })
  }
}

module.exports = { requireAuth, COOKIE_NAME, LEGACY_COOKIE_NAME }
