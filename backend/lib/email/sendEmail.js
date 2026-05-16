/**
 * Resend transactional email via REST API (`RESEND_API` in .env).
 */

const { verificationEmailHtml } = require('./emailTemplate')

function resendApiKey() {
  return process.env.RESEND_API || process.env.RESEND_API_KEY || ''
}

function emailFrom() {
  return process.env.EMAIL_FROM || 'Excession <onboarding@resend.dev>'
}

/**
 * @param {{ to: string, subject: string, html: string }} mail
 */
async function sendHtmlEmail(mail) {
  const apiKey = resendApiKey()
  if (!apiKey) {
    console.warn('[email] RESEND_API not set — skipping send to', mail.to)
    return { ok: false, skipped: true }
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: emailFrom(),
      to: [mail.to],
      subject: mail.subject,
      html: mail.html,
    }),
  })

  const body = await res.text().catch(() => '')
  if (!res.ok) {
    console.error('[email] Resend error', res.status, body.slice(0, 400))
    return { ok: false, status: res.status, body }
  }

  let id = null
  try {
    id = JSON.parse(body)?.id
  } catch {
    /* ignore */
  }
  return { ok: true, id }
}

/**
 * @param {{ to: string, name: string, verifyUrl: string }} p
 */
async function sendVerificationEmail(p) {
  const html = verificationEmailHtml({ name: p.name, verifyUrl: p.verifyUrl })
  return sendHtmlEmail({
    to: p.to,
    subject: 'Verify your Excession account',
    html,
  })
}

module.exports = { sendHtmlEmail, sendVerificationEmail }
