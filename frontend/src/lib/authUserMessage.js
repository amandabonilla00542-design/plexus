/**
 * Maps auth HTTP responses to short, customer-facing copy.
 * Unknown or technical server text is never shown verbatim.
 */

const KNOWN = new Set([
  'Invalid email or password.',
  'Email and password are required.',
  'Name is required (max 120 characters).',
  'Valid email is required.',
  'Password must be at least 8 characters.',
  'An account with this email already exists.',
  'Enter a valid email address.',
  'Could not process request. Try again later.',
])

const REPLACEMENTS = {
  'Wallet provisioning is not configured on the server.':
    'We can’t open new accounts right now. Please try again later.',
  'Server error during signup.': 'We couldn’t finish creating your account. Please try again shortly.',
  'Server error during login.': 'We couldn’t sign you in. Please try again shortly.',
  'Server error.': 'Something went wrong. Please try again shortly.',
  'User not found.': 'Your session expired. Please sign in again.',
  'Verify your email before signing in. We sent a new confirmation link to your inbox.':
    'Verify your email before signing in. We sent a new confirmation link to your inbox.',
  'Verify your email before accessing the desk.': 'Verify your email before opening the desk workspace.',
}

/** Shown when fetch fails (offline, DNS, CORS, etc.) — no infra hints. */
export const AUTH_NETWORK_MESSAGE =
  'We couldn’t reach Excession. Check your internet connection and try again.'

/**
 * @param {Response | null} res
 * @param {Record<string, unknown>} data Parsed JSON body, or {}
 */
export function messageFromAuthResponse(res, data) {
  const raw = typeof data?.message === 'string' ? data.message.trim() : ''
  const status = res && typeof res.status === 'number' ? res.status : 0

  if (raw && REPLACEMENTS[raw]) {
    return REPLACEMENTS[raw]
  }
  if (raw && KNOWN.has(raw)) {
    return raw
  }

  if (status === 403 && data?.code === 'EMAIL_NOT_VERIFIED') {
    return REPLACEMENTS[raw] || 'Verify your email before signing in. Check your inbox for the confirmation link.'
  }
  if (status === 401) {
    return 'The email or password does not match our records.'
  }
  if (status === 409) {
    return 'An account with this email already exists.'
  }
  if (status === 400) {
    return 'Please check the information you entered and try again.'
  }
  if (status === 503) {
    return 'We’re updating our service. Please try again in a few minutes.'
  }
  if (status === 404) {
    return 'That didn’t go through. Please try again in a moment.'
  }
  if (status >= 500) {
    return 'Something went wrong on our side. Please try again shortly.'
  }
  return 'Something went wrong. Please try again.'
}
