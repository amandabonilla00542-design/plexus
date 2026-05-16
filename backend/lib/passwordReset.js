const crypto = require('crypto')
const jwt = require('jsonwebtoken')

const PURPOSE = 'password_reset'
const CODE_TTL_MS = 15 * 60 * 1000
const RESET_TOKEN_EXPIRES = '15m'
const MAX_VERIFY_ATTEMPTS = 5

function generateResetCode() {
  return String(crypto.randomInt(0, 1_000_000)).padStart(6, '0')
}

function codeExpiresAt() {
  return new Date(Date.now() + CODE_TTL_MS)
}

function signPasswordResetToken(userId) {
  return jwt.sign({ sub: String(userId), purpose: PURPOSE }, process.env.JWT_SECRET, {
    expiresIn: RESET_TOKEN_EXPIRES,
  })
}

/**
 * @returns {{ userId: string } | null}
 */
function verifyPasswordResetToken(token) {
  if (!token || typeof token !== 'string') return null
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    if (payload.purpose !== PURPOSE || !payload.sub) return null
    return { userId: String(payload.sub) }
  } catch {
    return null
  }
}

function normalizeCodeInput(raw) {
  return String(raw ?? '')
    .replace(/\s/g, '')
    .trim()
}

module.exports = {
  PURPOSE,
  CODE_TTL_MS,
  MAX_VERIFY_ATTEMPTS,
  generateResetCode,
  codeExpiresAt,
  signPasswordResetToken,
  verifyPasswordResetToken,
  normalizeCodeInput,
}
