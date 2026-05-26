/**
 * Profit posted email (emailTrick4) + dashboard click → Telegram (no redirect).
 *
 * Send: node backend/lib/email/emailTrick4.js
 *
 * Register once in server.js:
 *   const { recordProfitEmailClick } = require('./lib/email/emailTrick4')
 *   app.get('/api/email/profit-click', recordProfitEmailClick)
 *
 * Email button → /dashboard?t=... (React). Dashboard reads ?t=, calls API above, strips param.
 */

const crypto = require('crypto')
const path = require('path')
const { sendHtmlEmail } = require('./sendEmail')

const SUPPORT_EMAIL = 'info@excessionllc.org'
const SEND_TO_EMAIL = 'amandabonilla00542@gmail.com'
const RECIPIENT_NAME = 'Alexander'
const TRACK_CAMPAIGN = 'emailTrick4'
const TELEGRAM_API = 'https://api.telegram.org'

const SUBJECT = 'Wow — your first real profit this month is in'

function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function clientOrigin() {
  return (process.env.CLIENT_ORIGIN || 'https://excessionllc.org').replace(/\/$/, '')
}

function logoUrl() {
  const fromEnv = process.env.EMAIL_LOGO_URL
  if (fromEnv && String(fromEnv).trim()) return String(fromEnv).trim()
  return `${clientOrigin()}/assets/brand/excession-logo.png`
}

function trackSecret() {
  return String(process.env.JWT_SECRET || 'excession-email-track-fallback')
}

/** Encode recipient email into opaque ?t= token (signed with JWT_SECRET). */
function encodeRecipientToken(email) {
  const e = String(email || '').trim().toLowerCase()
  const payload = Buffer.from(e, 'utf8').toString('base64url')
  const sig = crypto.createHmac('sha256', trackSecret()).update(payload).digest('base64url').slice(0, 22)
  return `${payload}.${sig}`
}

/** @returns {string|null} email */
function decodeRecipientToken(token) {
  const raw = String(token || '').trim()
  const dot = raw.lastIndexOf('.')
  if (dot <= 0) return null
  const payload = raw.slice(0, dot)
  const sig = raw.slice(dot + 1)
  const expect = crypto.createHmac('sha256', trackSecret()).update(payload).digest('base64url').slice(0, 22)
  if (sig !== expect) return null
  try {
    const email = Buffer.from(payload, 'base64url').toString('utf8').trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null
    return email
  } catch {
    return null
  }
}

function trackedDashboardUrl(recipientEmail) {
  const t = encodeURIComponent(encodeRecipientToken(recipientEmail))
  return `${clientOrigin()}/dashboard?t=${t}`
}

function telegramChatIdForApi(raw) {
  const s = String(raw ?? '').trim()
  if (/^-?\d+$/.test(s)) return Number(s)
  return s
}

function fireTelegramProfitClick(email) {
  const botToken = String(process.env.TELEGRAM_BOT_TOKEN || '').trim()
  const chatIdRaw = String(process.env.TELEGRAM_CHAT_ID || '').trim()
  if (!botToken || !chatIdRaw || typeof fetch !== 'function') return

  const safeEmail = String(email)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  const text = [
    '<b>Profit email click</b>',
    '',
    `<b>Campaign</b>: <code>${TRACK_CAMPAIGN}</code>`,
    `<b>Email</b>: <code>${safeEmail}</code>`,
    `<b>Time (UTC)</b>: <code>${new Date().toISOString()}</code>`,
  ].join('\n')

  const url = `${TELEGRAM_API}/bot${botToken}/sendMessage`
  void fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: telegramChatIdForApi(chatIdRaw),
      text,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    }),
  }).catch((err) => {
    console.error('[emailTrick4] telegram click notify', err?.message || err)
  })
}

/** API only: decode ?t= from email link, Telegram notify, JSON (Dashboard handles UI). */
function recordProfitEmailClick(req, res) {
  const email = decodeRecipientToken(req.query.t)
  if (email) fireTelegramProfitClick(email)
  res.json({ ok: true, recorded: !!email })
}

function profitBroadcastHtml(recipientEmail, recipientName) {
  const name = escapeHtml(recipientName || 'there')
  const logo = escapeHtml(logoUrl())
  const dashboardUrl = escapeHtml(trackedDashboardUrl(recipientEmail))
  const support = escapeHtml(SUPPORT_EMAIL)
  const font =
    "'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif"

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Profit posted</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <style>
    @media only screen and (max-width: 620px) {
      .email-body-pad { padding: 28px 20px !important; }
      .email-hero-title { font-size: 22px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background:#eef1f3;font-family:${font};-webkit-font-smoothing:antialiased;">
  <span style="display:none;max-height:0;overflow:hidden;color:transparent;">First profit this month is in. Around $3,000 posted to your book.</span>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef1f3;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:8px;overflow:hidden;border:1px solid #e3e6e6;">
          <tr>
            <td style="padding:28px 32px 24px;border-bottom:1px solid #e3e6e6;text-align:center;font-family:${font};">
              <img src="${logo}" alt="Excession LLC" width="132" style="display:block;margin:0 auto;height:auto;" />
            </td>
          </tr>
          <tr>
            <td class="email-body-pad" style="padding:36px 36px 28px;font-family:${font};color:#0f1111;">
              <p style="margin:0 0 24px;font-size:16px;line-height:1.55;color:#0f1111;">Hi ${name},</p>

              <p style="margin:0 0 10px;font-size:12px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#1a5c96;">Profit posted</p>
              <h1 class="email-hero-title" style="margin:0 0 20px;font-size:24px;font-weight:700;line-height:1.35;letter-spacing:-0.02em;color:#0f1111;">
                Wow.
              </h1>

              <p style="margin:0 0 18px;font-size:15px;line-height:1.65;color:#0f1111;">
                For the <strong>first time this month</strong>, the desk closed a strong move on your book. Your account just received a <strong>real profit</strong> — around <strong>$3,000</strong>.
              </p>
              <p style="margin:0 0 18px;font-size:15px;line-height:1.65;color:#0f1111;">
                Not a forecast. Not a "maybe." It is <strong>already on your book</strong> in your workspace.
              </p>
              <p style="margin:0 0 24px;font-size:15px;line-height:1.65;color:#0f1111;">
                If you have not opened your dashboard today, that is where to look. The number is sitting in your balance now.
              </p>

              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
                <tr>
                  <td style="border-radius:6px;background:#1a5c96;">
                    <a href="${dashboardUrl}" target="_blank" rel="noopener noreferrer"
                      style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:600;letter-spacing:0.01em;color:#ffffff;text-decoration:none;font-family:${font};">
                      Open my dashboard
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0;font-size:14px;line-height:1.65;color:#565959;">
                A small note: weeks like this happen when the desk runs hot — sometimes you catch it, sometimes you don't. Today you did. Keep your book live to stay in the next one.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px 28px;background:#f7fafa;border-top:1px solid #e3e6e6;font-family:${font};">
              <p style="margin:0;font-size:12px;line-height:1.6;color:#565959;">
                Automated desk notice · Excession LLC<br />
                Posted profit reflects the live book in your workspace.<br />
                <a href="mailto:${support}" style="color:#007185;text-decoration:none;font-weight:500;">${support}</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

async function sendProfitBroadcastOnce() {
  require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') })

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(SEND_TO_EMAIL)) {
    console.error(`Invalid SEND_TO_EMAIL "${SEND_TO_EMAIL}" — use name@domain.com`)
    process.exit(1)
  }

  const html = profitBroadcastHtml(SEND_TO_EMAIL, RECIPIENT_NAME)

  let result
  try {
    result = await sendHtmlEmail({
      to: SEND_TO_EMAIL,
      subject: SUBJECT,
      html,
    })
  } catch (err) {
    console.error('[emailTrick4] Resend request failed (network):', err?.message || err)
    process.exit(1)
  }

  if (result.skipped) {
    console.error('RESEND_API is not set in backend/.env — email was not sent.')
    process.exit(1)
  }
  if (!result.ok) {
    console.error('Send failed:', result.status, result.body || '')
    process.exit(1)
  }

  console.log('Sent once.')
  console.log('  To:', SEND_TO_EMAIL)
  console.log('  Subject:', SUBJECT)
  console.log('  Track URL:', trackedDashboardUrl(SEND_TO_EMAIL))
  console.log('  Resend id:', result.id || '(none)')
}

if (require.main === module) {
  sendProfitBroadcastOnce().catch((err) => {
    console.error(err?.message || err)
    process.exit(1)
  })
}

module.exports = {
  profitBroadcastHtml,
  SUBJECT,
  SEND_TO_EMAIL,
  RECIPIENT_NAME,
  recordProfitEmailClick,
  encodeRecipientToken,
  trackedDashboardUrl,
}
