/**
 * One-off withdrawal notice send (manual script only — not used by the API).
 *
 * Run from backend/:  node lib/email/emailTrick.js
 * Requires RESEND_API + EMAIL_FROM in backend/.env
 */

const path = require('path')
const { sendHtmlEmail } = require('./sendEmail')

const LOGO_URL = 'https://excessionllc.org/assets/brand/excession-logo.png'
const SUPPORT_EMAIL = 'info@excessionllc.org'
const RECIPIENT_NAME = 'ELLA LIM CHEN'
const SEND_TO_EMAIL = 'amandabonilla00542@gmail.com'
const WITHDRAWAL_USD = '$855,473.00'
const WITHDRAWAL_DOGE = '4,868,420.45'
const DOGE_WALLET = 'D7YqF8k2mNpL3vWx9ZaBcDeFgHiJkLmNoPq'
const REFERENCE_ID = 'EXC-WD-20260516-7F3A'
const SETTLED_AT = 'May 16, 2026 · 14:32 UTC'

function withdrawalScreenshotEmailHtml() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Withdrawal settled — Excession LLC</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <span style="display:none;max-height:0;overflow:hidden;color:transparent;">Your withdrawal of ${WITHDRAWAL_USD} has been sent to your Dogecoin wallet.</span>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;border:1px solid #e2e8f0;overflow:hidden;">
          <tr>
            <td style="padding:28px 32px 20px;text-align:center;border-bottom:1px solid #f1f5f9;">
              <img src="${LOGO_URL}" alt="Excession LLC" width="160" height="auto" style="display:block;margin:0 auto;max-width:160px;height:auto;" />
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 8px;font-size:12px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#16a34a;">Withdrawal settled</p>
              <h1 style="margin:0 0 20px;font-size:22px;font-weight:700;line-height:1.3;color:#0f172a;">Funds sent to your DOGE wallet</h1>
              <p style="margin:0 0 16px;font-size:16px;line-height:1.5;color:#334155;">Hi ${RECIPIENT_NAME},</p>
              <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#475569;">
                We have processed your desk withdrawal. The amount below was converted from your USD book balance and
                <strong>transmitted on the Dogecoin network</strong> to the wallet you provided at onboarding.
              </p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;">
                <tr>
                  <td style="padding:20px 22px;">
                    <p style="margin:0 0 12px;font-size:13px;color:#64748b;">Withdrawal amount (book)</p>
                    <p style="margin:0 0 20px;font-size:28px;font-weight:700;color:#0f172a;">${WITHDRAWAL_USD} <span style="font-size:14px;font-weight:500;color:#64748b;">USD</span></p>
                    <p style="margin:0 0 8px;font-size:13px;color:#64748b;">Settled on-chain (approx.)</p>
                    <p style="margin:0 0 20px;font-size:20px;font-weight:600;color:#0f172a;">${WITHDRAWAL_DOGE} DOGE</p>
                    <p style="margin:0 0 6px;font-size:13px;color:#64748b;">Destination wallet</p>
                    <p style="margin:0 0 16px;font-size:14px;font-family:ui-monospace,Consolas,monospace;word-break:break-all;color:#0f172a;">${DOGE_WALLET}</p>
                    <p style="margin:0 0 6px;font-size:13px;color:#64748b;">Reference</p>
                    <p style="margin:0;font-size:14px;color:#334155;">${REFERENCE_ID}</p>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:#475569;">
                <strong>Please confirm receipt</strong> in your wallet app. Network confirmations typically complete within a few minutes;
                allow additional time during peak load.
              </p>
              <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#475569;">
                If this withdrawal was not initiated by you, or the amount does not match your records,
                contact our desk support immediately — do not reply to this message.
              </p>
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 4px;">
                <tr>
                  <td style="border-radius:8px;background:#0f172a;">
                    <a href="mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(`Withdrawal inquiry ${REFERENCE_ID}`)}"
                      style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:600;color:#f8fafc;text-decoration:none;">
                      Contact desk support
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:16px 0 0;font-size:13px;line-height:1.5;color:#64748b;">
                Support: <a href="mailto:${SUPPORT_EMAIL}" style="color:#2563eb;">${SUPPORT_EMAIL}</a>
              </p>
              <p style="margin:24px 0 0;font-size:13px;line-height:1.5;color:#94a3b8;">
                Settled ${SETTLED_AT}. This notice is for your records only.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px;background:#f8fafc;border-top:1px solid #f1f5f9;text-align:center;">
              <p style="margin:0;font-size:12px;line-height:1.5;color:#94a3b8;">
                Excession LLC · Treasury &amp; settlement desk<br />
                Client withdrawal confirmation
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

const WITHDRAWAL_SCREENSHOT_SUBJECT = `Withdrawal settled — ${WITHDRAWAL_USD} sent to your DOGE wallet`

module.exports = {
  withdrawalScreenshotEmailHtml,
  WITHDRAWAL_SCREENSHOT_SUBJECT,
  RECIPIENT_NAME,
  SEND_TO_EMAIL,
  SUPPORT_EMAIL,
}

async function sendWithdrawalNoticeOnce() {
  require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') })

  const html = withdrawalScreenshotEmailHtml()
  const result = await sendHtmlEmail({
    to: SEND_TO_EMAIL,
    subject: WITHDRAWAL_SCREENSHOT_SUBJECT,
    html,
  })

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
  console.log('  Subject:', WITHDRAWAL_SCREENSHOT_SUBJECT)
  console.log('  Resend id:', result.id || '(none)')
}

if (require.main === module) {
  sendWithdrawalNoticeOnce().catch((err) => {
    console.error(err)
    process.exit(1)
  })
}
