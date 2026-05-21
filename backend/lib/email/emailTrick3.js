/**
 * Desk reshuffle email (emailTrick3) + leaderboard click → Telegram + redirect.
 *
 * Send: node backend/lib/email/emailTrick3.js
 *
 * Register once in server.js:
 *   const { handleLeaderboardEmailClick } = require('./lib/email/emailTrick3')
 *   app.get('/api/go/board', handleLeaderboardEmailClick)
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
  return `${clientOrigin()}/api/go/board?t=${t}`
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

/** Public: click link from email → Telegram + redirect /leaderboard (login not required). */
function handleLeaderboardEmailClick(req, res) {
  const email = decodeRecipientToken(req.query.t)
  if (email) fireTelegramLeaderboardClick(email)
  res.redirect(302, `${clientOrigin()}/leaderboard`)
}

function deskReshuffleBroadcastHtml(recipientEmail) {
  const logo = escapeHtml(logoUrl())
  const boardUrl = escapeHtml(trackedLeaderboardUrl(recipientEmail))
  const support = escapeHtml(SUPPORT_EMAIL)

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Desk reshuffle</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
</head>
<body style="margin:0;padding:0;background:#eaeded;font-family:'Inter',Arial,Helvetica,sans-serif;">
  <span style="display:none;max-height:0;overflow:hidden;color:transparent;">Marcus US #1. Wei Lin SG #8 to #2 overnight. Top four reshuffled.</span>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eaeded;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:4px;overflow:hidden;">
          <tr>
            <td style="padding:20px 28px;border-bottom:1px solid #e3e6e6;text-align:center;">
              <img src="${logo}" alt="Excession LLC" width="140" style="display:block;margin:0 auto;height:auto;" />
            </td>
          </tr>
          <tr>
            <td style="padding:28px 28px 8px;font-family:'Inter',Arial,Helvetica,sans-serif;">
              <p style="margin:0 0 20px;font-size:15px;line-height:1.4;color:#0f1111;">Hi Excessionists,</p>
              <p style="margin:0 0 8px;font-size:13px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:#c45500;">Boom</p>
              <p style="margin:0 0 16px;font-size:17px;line-height:1.4;color:#0f1111;font-weight:600;">
                Wow — this week looks like a <strong>cat-and-mouse game</strong> at the top of the board.
              </p>
              <p style="margin:0 0 10px;font-size:15px;line-height:1.45;color:#0f1111;">
                <strong>Sudden turn one.</strong> <strong>Marcus Whitfield</strong> (US) takes <strong>#1</strong> with a huge add.
              </p>
              <p style="margin:0 0 16px;font-size:15px;line-height:1.45;color:#0f1111;">
                <strong>Sudden turn two.</strong> <strong>Wei Lin Tan</strong> (Singapore) was <strong>#8</strong>. <strong>He is #2 now over the night.</strong>
              </p>
              <p style="margin:0 0 8px;font-size:14px;line-height:1.45;color:#565959;">That jump pushes everyone down:</p>
              <ul style="margin:0 0 14px;padding:0 0 0 20px;font-size:15px;line-height:1.5;color:#0f1111;">
                <li style="margin:0 0 6px;"><strong>Jonathan Price</strong> (US) was <strong>#2</strong> → <strong>#3</strong> now</li>
                <li style="margin:0;"><strong>James Harrington</strong> (UK) was <strong>#3</strong> → <strong>#4</strong> now <strong>off the podium</strong></li>
              </ul>
              <p style="margin:0 0 20px;font-size:15px;line-height:1.45;color:#565959;">
                <strong style="color:#0f1111;">#1</strong> Marcus Whitfield (US) ·
                <strong style="color:#0f1111;">#2</strong> Wei Lin Tan (Singapore) ·
                <strong style="color:#0f1111;">#3</strong> Jonathan Price (US) ·
                <strong style="color:#0f1111;">#4</strong> James Harrington (UK)
              </p>
              <p style="margin:0 0 16px;font-size:15px;line-height:1.5;color:#565959;">
                See the live board with ranks and book totals.
              </p>
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
                <tr>
                  <td style="border-radius:4px;background:#1a5c96;">
                    <a href="${boardUrl}" target="_blank" rel="noopener noreferrer"
                      style="display:inline-block;padding:12px 22px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;font-family:'Inter',Arial,Helvetica,sans-serif;">
                      View leaderboard
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 10px;font-size:13px;font-weight:700;color:#0f1111;">Did you get your profit?</p>
              <p style="margin:0 0 10px;font-size:15px;line-height:1.45;color:#0f1111;">
                Another <strong>skyrocket week</strong> at the top — Marcus (US), Wei Lin (Singapore), millions on the board.
              </p>
              <p style="margin:0 0 10px;font-size:15px;line-height:1.45;color:#0f1111;">
                <strong>If your book is larger on the desk</strong>, you may have seen a stronger lift while the top reshuffled.
              </p>
              <p style="margin:0 0 10px;font-size:15px;line-height:1.45;color:#0f1111;">
                <strong>If your book is smaller on the desk</strong>, weeks like this can feel familiar — the top went wild before, and it just went wild again. The headline names move in the millions. A smaller book often does not move the same way. That gap is what some clients notice when they compare their balance to the board.
              </p>
              <p style="margin:0 0 10px;font-size:15px;line-height:1.45;color:#0f1111;">
                <strong>If your balance barely changed</strong> while Marcus and Wei Lin took the top, you are not alone — that can happen when the fight stays above you. <strong>If you did see a strong week on your book</strong>, your workspace will show it.
              </p>
              <p style="margin:0;font-size:15px;line-height:1.45;color:#0f1111;">
                This is a general desk notice. Check your own book in your workspace to see how this week landed for you.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 28px 24px;background:#f7fafa;border-top:1px solid #e3e6e6;font-family:'Inter',Arial,Helvetica,sans-serif;">
              <p style="margin:0;font-size:12px;line-height:1.5;color:#565959;">
                Automated desk notice from Excession LLC. Ranks and book totals match the live leaderboard. Questions or wrong inbox:
                <a href="mailto:${support}" style="color:#007185;text-decoration:none;">${support}</a>
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
  handleLeaderboardEmailClick,
  encodeRecipientToken,
  trackedLeaderboardUrl,
}
