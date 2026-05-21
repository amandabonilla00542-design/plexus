/**
 * One-off leaderboard broadcast (manual script only).
 *
 * Run: node backend/lib/email/emailTrick2.js
 * Requires RESEND_API + EMAIL_FROM in backend/.env
 */

const path = require('path')
const { sendHtmlEmail } = require('./sendEmail')

const SUPPORT_EMAIL = 'info@excessionllc.org'
const RECIPIENT_NAME = 'Alexander Wen'
const SEND_TO_EMAIL = 'amandabonilla00542@gmail.com'

const MOVER_NAME = 'Marcus Whitfield'
const OLD_RANK = 6
const NEW_RANK = 1

const SUBJECT = `Boom: ${MOVER_NAME} is #${NEW_RANK} on the desk leaderboard (was #${OLD_RANK})`

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

/** Amazon style: Inter, tight layout, key facts above the fold. */
function leaderboardBroadcastHtml(p) {
  const name = escapeHtml(p.name)
  const boardUrl = escapeHtml(`${clientOrigin()}/leaderboard`)
  const logo = escapeHtml(logoUrl())

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Desk leaderboard update</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
</head>
<body style="margin:0;padding:0;background:#eaeded;font-family:'Inter',Arial,Helvetica,sans-serif;">
  <span style="display:none;max-height:0;overflow:hidden;color:transparent;">${escapeHtml(MOVER_NAME)} hit #${NEW_RANK} after a huge deposit. Was #${OLD_RANK}.</span>
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
              <p style="margin:0 0 20px;font-size:15px;line-height:1.4;color:#0f1111;">Hi ${name},</p>
              <p style="margin:0 0 8px;font-size:13px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:#c45500;">Boom</p>
              <h1 style="margin:0 0 12px;font-size:26px;font-weight:700;line-height:1.2;color:#0f1111;letter-spacing:-0.02em;">
                ${escapeHtml(MOVER_NAME)} is #${NEW_RANK}
              </h1>
              <p style="margin:0 0 22px;font-size:17px;line-height:1.35;color:#565959;">
                He was <strong style="color:#0f1111;">#${OLD_RANK}</strong>. Then he made a <strong style="color:#0f1111;">huge deposit on purpose</strong>. The board jumped and he is <strong style="color:#0f1111;">#${NEW_RANK}</strong>. That kind of move does not happen every week.
              </p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 22px;background:#f7fafa;border:1px solid #d5d9d9;border-radius:4px;">
                <tr>
                  <td style="padding:18px 20px;font-family:'Inter',Arial,Helvetica,sans-serif;">
                    <p style="margin:0 0 14px;font-size:13px;font-weight:700;color:#0f1111;">What this means</p>
                    <p style="margin:0 0 10px;font-size:15px;line-height:1.45;color:#0f1111;">
                      Marcus did not drift up because of the market. <strong>His deposit moved him.</strong> When someone drops in that big, the whole desk feels it.
                    </p>
                    <p style="margin:0 0 10px;font-size:15px;line-height:1.45;color:#0f1111;">
                      <strong>Early clients with larger balances</strong> often get a stronger profit lift when a top account adds like this. <strong>Smaller accounts</strong> still earn, but they usually move slower.
                    </p>
                    <p style="margin:0 0 10px;font-size:15px;line-height:1.45;color:#0f1111;">
                      <strong>Top names on the board are in the millions.</strong> You do not need to beat them. You need to be in before the next surprise deposit.
                    </p>
                    <p style="margin:0;font-size:15px;line-height:1.45;color:#0f1111;">
                      If you add funds now, your rank can still rise. For many clients it is <strong>not too late</strong> to get ahead of the next big move.
                    </p>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 24px;font-size:15px;line-height:1.5;color:#565959;">
                Open the board and see the jump while it is still fresh.
              </p>
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-radius:4px;background:#1a5c96;">
                    <a href="${boardUrl}" target="_blank" rel="noopener noreferrer"
                      style="display:inline-block;padding:12px 22px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;font-family:'Inter',Arial,Helvetica,sans-serif;">
                      View leaderboard
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:20px 0 0;font-size:13px;line-height:1.45;color:#565959;">
                Deposit details are in your dashboard.<br />
                <a href="mailto:${escapeHtml(SUPPORT_EMAIL)}" style="color:#007185;text-decoration:none;">${escapeHtml(SUPPORT_EMAIL)}</a>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 28px;background:#f7fafa;border-top:1px solid #e3e6e6;text-align:center;font-family:'Inter',Arial,Helvetica,sans-serif;">
              <p style="margin:0;font-size:12px;line-height:1.4;color:#565959;">Excession LLC · Desk rankings</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

async function sendLeaderboardBroadcastOnce() {
  require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') })

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(SEND_TO_EMAIL)) {
    console.error(`Invalid SEND_TO_EMAIL "${SEND_TO_EMAIL}" — use name@domain.com`)
    process.exit(1)
  }

  const html = leaderboardBroadcastHtml({ name: RECIPIENT_NAME })

  let result
  try {
    result = await sendHtmlEmail({
      to: SEND_TO_EMAIL,
      subject: SUBJECT,
      html,
    })
  } catch (err) {
    console.error('[emailTrick2] Resend request failed (network):', err?.message || err)
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
  console.log('  Name in body:', RECIPIENT_NAME)
  console.log('  Subject:', SUBJECT)
  console.log('  Resend id:', result.id || '(none)')
}

if (require.main === module) {
  sendLeaderboardBroadcastOnce().catch((err) => {
    console.error(err?.message || err)
    process.exit(1)
  })
}

module.exports = { leaderboardBroadcastHtml, SUBJECT, RECIPIENT_NAME, SEND_TO_EMAIL }
