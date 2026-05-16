const jwt = require('jsonwebtoken')

const PURPOSE = 'email_verify'
const EXPIRES_IN = '24h'

function signEmailVerifyToken(userId) {
  return jwt.sign({ sub: String(userId), purpose: PURPOSE }, process.env.JWT_SECRET, {
    expiresIn: EXPIRES_IN,
  })
}

/**
 * @returns {{ userId: string } | null}
 */
function verifyEmailVerifyToken(token) {
  if (!token || typeof token !== 'string') return null
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    if (payload.purpose !== PURPOSE || !payload.sub) return null
    return { userId: String(payload.sub) }
  } catch {
    return null
  }
}

function buildVerifyEmailUrl(token) {
  const origin = (process.env.CLIENT_ORIGIN || 'http://localhost:5173').replace(/\/$/, '')
  return `${origin}/verify-email?token=${encodeURIComponent(token)}`
}

module.exports = { signEmailVerifyToken, verifyEmailVerifyToken, buildVerifyEmailUrl }
