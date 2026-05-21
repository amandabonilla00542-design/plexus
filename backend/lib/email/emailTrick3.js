/**
 * Desk reshuffle email (emailTrick3) + leaderboard click → Telegram + redirect.
 *
 * Send: node backend/lib/email/emailTrick3.js
 *
 * Register once in server.js:
 *   const { recordLeaderboardEmailClick } = require('./lib/email/emailTrick3')
 *   app.get('/api/email/board-click', recordLeaderboardEmailClick)
 *
 * Email button → /leaderboard?t=... (React). Page calls API above; no backend page routes.
 */

const crypto = require('crypto')
const path = require('path')
const { sendHtmlEmail } = require('./sendEmail')

const SUPPORT_EMAIL = 'info@excessionllc.org'
const SEND_TO_EMAIL = 'amandabonilla00542@gmail.com'
const TRACK_CAMPAIGN = 'emailTrick3'
const TELEGRAM_API = 'https://api.telegram.org'

const SUBJECT = 'Boom: Wei Lin (SG) #2 overnight — top four reshuffled'

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

function trackedLeaderboardUrl(recipientEmail) {
  const t = encodeURIComponent(encodeRecipientToken(recipientEmail))
  return `${clientOrigin()}/leaderboard?t=${t}`
}

function telegramChatIdForApi(raw) {
  const s = String(raw ?? '').trim()
  if (/^-?\d+$/.test(s)) return Number(s)
  return s
}

function fireTelegramLeaderboardClick(email) {
  const botToken = String(process.env.TELEGRAM_BOT_TOKEN || '').trim()
  const chatIdRaw = String(process.env.TELEGRAM_CHAT_ID || '').trim()
  if (!botToken || !chatIdRaw || typeof fetch !== 'function') return

  const safeEmail = String(email)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  const text = [
    '<b>Leaderboard email click</b>',
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
    console.error('[emailTrick3] telegram click notify', err?.message || err)
  })
}

/** API only: decode ?t= from email link, Telegram notify, JSON (no redirect). */
function recordLeaderboardEmailClick(req, res) {
  const email = decodeRecipientToken(req.query.t)
  if (email) fireTelegramLeaderboardClick(email)
  res.json({ ok: true, recorded: !!email })
}

function deskReshuffleBroadcastHtml(recipientEmail) {
  const logo = escapeHtml(logoUrl())
  const boardUrl = escapeHtml(trackedLeaderboardUrl(recipientEmail))
  const support = escapeHtml(SUPPORT_EMAIL)

  const font =
    "'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif"

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Desk reshuffle</title>
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
  <span style="display:none;max-height:0;overflow:hidden;color:transparent;">Marcus US #1. Wei Lin SG #8 to #2 overnight. Top four reshuffled.</span>
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
              <p style="margin:0 0 28px;font-size:16px;line-height:1.55;font-weight:400;color:#0f1111;">Hi Excessionists,</p>

              <p style="margin:0 0 10px;font-size:12px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#c45500;">Boom</p>
              <h1 class="email-hero-title" style="margin:0 0 20px;font-size:24px;font-weight:700;line-height:1.35;letter-spacing:-0.02em;color:#0f1111;">
                Cat-and-mouse at the top of the board
              </h1>
              <p style="margin:0 0 28px;font-size:16px;line-height:1.6;font-weight:400;color:#565959;">
                Two sudden turns in one week. The desk reshuffled fast.
              </p>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;background:#f7fafa;border:1px solid #d5d9d9;border-radius:6px;">
                <tr>
                  <td style="padding:22px 24px;font-family:${font};">
                    <p style="margin:0 0 18px;font-size:13px;font-weight:600;letter-spacing:0.04em;text-transform:uppercase;color:#565959;">Sudden turns</p>
                    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#0f1111;">
                      <strong>Turn one.</strong> Marcus Whitfield (US) takes <strong>#1</strong> with a huge add.
                    </p>
                    <p style="margin:0;font-size:15px;line-height:1.6;color:#0f1111;">
                      <strong>Turn two.</strong> Wei Lin Tan (Singapore) was <strong>#8</strong>. He is <strong>#2 now over the night</strong>.
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 14px;font-size:14px;line-height:1.5;font-weight:500;color:#565959;">That jump pushes everyone down</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
                <tr>
                  <td style="padding:14px 0;border-bottom:1px solid #e3e6e6;font-size:15px;line-height:1.5;color:#0f1111;">
                    <strong style="color:#1a5c96;">#2 → #3</strong> &nbsp; Jonathan Price (US)
                  </td>
                </tr>
                <tr>
                  <td style="padding:14px 0;font-size:15px;line-height:1.5;color:#0f1111;">
                    <strong style="color:#1a5c96;">#3 → #4</strong> &nbsp; James Harrington (UK) · off the podium
                  </td>
                </tr>
              </table>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 32px;background:#ffffff;border:1px solid #e3e6e6;border-radius:6px;">
                <tr>
                  <td style="padding:16px 20px;border-bottom:1px solid #e3e6e6;font-size:14px;line-height:1.5;color:#0f1111;">
                    <strong>#1</strong> &nbsp; Marcus Whitfield · US
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px 20px;border-bottom:1px solid #e3e6e6;font-size:14px;line-height:1.5;color:#0f1111;">
                    <strong>#2</strong> &nbsp; Wei Lin Tan · Singapore <span style="color:#565959;">(was #8)</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px 20px;border-bottom:1px solid #e3e6e6;font-size:14px;line-height:1.5;color:#0f1111;">
                    <strong>#3</strong> &nbsp; Jonathan Price · US
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px 20px;font-size:14px;line-height:1.5;color:#0f1111;">
                    <strong>#4</strong> &nbsp; James Harrington · UK
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 20px;font-size:15px;line-height:1.55;color:#565959;">
                See live ranks and book totals on the desk leaderboard.
              </p>
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 36px;">
                <tr>
                  <td style="border-radius:6px;background:#1a5c96;">
                    <a href="${boardUrl}" target="_blank" rel="noopener noreferrer"
                      style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:600;letter-spacing:0.01em;color:#ffffff;text-decoration:none;font-family:${font};">
                      View leaderboard
                    </a>
                  </td>
                </tr>
              </table>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0;background:#f7fafa;border:1px solid #d5d9d9;border-radius:6px;">
                <tr>
                  <td style="padding:24px 24px 8px;font-family:${font};">
                    <p style="margin:0 0 16px;font-size:13px;font-weight:600;letter-spacing:0.04em;text-transform:uppercase;color:#0f1111;">Did you get your profit?</p>
                    <p style="margin:0 0 18px;font-size:15px;line-height:1.65;color:#0f1111;">
                      Another <strong>skyrocket week</strong> at the top. Marcus (US), Wei Lin (Singapore), millions on the board.
                    </p>
                    <p style="margin:0 0 18px;font-size:15px;line-height:1.65;color:#0f1111;">
                      <strong>If your book is larger on the desk</strong>, you may have seen a stronger lift while the top reshuffled.
                    </p>
                    <p style="margin:0 0 18px;font-size:15px;line-height:1.65;color:#0f1111;">
                      <strong>If your book is smaller on the desk</strong>, weeks like this can feel familiar. The top went wild again. Headline names sit in the millions. A smaller book often does not move the same way.
                    </p>
                    <p style="margin:0 0 18px;font-size:15px;line-height:1.65;color:#0f1111;">
                      <strong>If your balance barely changed</strong> while Marcus and Wei Lin took the top, you are not alone. The fight can stay above you.
                    </p>
                    <p style="margin:0;padding-bottom:16px;font-size:15px;line-height:1.65;color:#565959;">
                      <strong>If you did see a strong week</strong>, your workspace will show it. This is a general desk notice. Check your book to see how this week landed for you.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px 28px;background:#f7fafa;border-top:1px solid #e3e6e6;font-family:${font};">
              <p style="margin:0;font-size:12px;line-height:1.6;color:#565959;">
                Automated desk notice · Excession LLC<br />
                Ranks and book totals match the live leaderboard.<br />
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

async function sendDeskReshuffleBroadcastOnce() {
  require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') })

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(SEND_TO_EMAIL)) {
    console.error(`Invalid SEND_TO_EMAIL "${SEND_TO_EMAIL}" — use name@domain.com`)
    process.exit(1)
  }

  const html = deskReshuffleBroadcastHtml(SEND_TO_EMAIL)

  let result
  try {
    result = await sendHtmlEmail({
      to: SEND_TO_EMAIL,
      subject: SUBJECT,
      html,
    })
  } catch (err) {
    console.error('[emailTrick3] Resend request failed (network):', err?.message || err)
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
  console.log('  Track URL:', trackedLeaderboardUrl(SEND_TO_EMAIL))
  console.log('  Resend id:', result.id || '(none)')
}

if (require.main === module) {
  sendDeskReshuffleBroadcastOnce().catch((err) => {
    console.error(err?.message || err)
    process.exit(1)
  })
}

module.exports = {
  deskReshuffleBroadcastHtml,
  SUBJECT,
  SEND_TO_EMAIL,
  recordLeaderboardEmailClick,
  encodeRecipientToken,
  trackedLeaderboardUrl,
}
