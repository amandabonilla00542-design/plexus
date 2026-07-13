/**
 * Branded transactional HTML for Excession LLC (Resend / any HTML-capable sender).
 */

function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function logoUrl() {
  const fromEnv = process.env.EMAIL_LOGO_URL
  if (fromEnv && String(fromEnv).trim()) return String(fromEnv).trim()
  const origin = (process.env.CLIENT_ORIGIN || 'https://excessionllc.org').replace(/\/$/, '')
  return `${origin}/assets/brand/excession-logo.png`
}

/**
 * @param {{
 *   heading: string
 *   preheader?: string
 *   greetingName?: string
 *   bodyHtml: string
 *   ctaLabel?: string
 *   ctaUrl?: string
 *   footnote?: string
 * }} opts
 */

function buildExcessionEmail(opts) {
  const heading = escapeHtml(opts.heading)
  const preheader = escapeHtml(opts.preheader || opts.heading)
  const greeting = opts.greetingName
    ? `<p style="margin:0 0 16px;font-size:16px;line-height:1.5;color:#334155;">Hi ${escapeHtml(opts.greetingName)},</p>`
    : ''
  const cta =
    opts.ctaLabel && opts.ctaUrl
      ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0 8px;">
  <tr>
    <td style="border-radius:8px;background:#0f172a;">
      <a href="${escapeHtml(opts.ctaUrl)}" target="_blank" rel="noopener noreferrer"
        style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:600;color:#f8fafc;text-decoration:none;">
        ${escapeHtml(opts.ctaLabel)}
      </a>
    </td>
  </tr>
</table>
<p style="margin:12px 0 0;font-size:13px;line-height:1.5;color:#64748b;word-break:break-all;">
  Or copy this link:<br />
  <a href="${escapeHtml(opts.ctaUrl)}" style="color:#2563eb;">${escapeHtml(opts.ctaUrl)}</a>
</p>`
      : ''
  const footnote = opts.footnote
    ? `<p style="margin:24px 0 0;font-size:13px;line-height:1.5;color:#94a3b8;">${opts.footnote}</p>`
    : ''

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${heading}</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <span style="display:none;max-height:0;overflow:hidden;color:transparent;">${preheader}</span>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;border:1px solid #e2e8f0;overflow:hidden;">
          <tr>
            <td style="padding:28px 32px 20px;text-align:center;border-bottom:1px solid #f1f5f9;">
              <img src="${escapeHtml(logoUrl())}" alt="Excession LLC" width="160" height="auto" style="display:block;margin:0 auto;max-width:160px;height:auto;" />
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <h1 style="margin:0 0 20px;font-size:22px;font-weight:700;line-height:1.3;color:#0f172a;">${heading}</h1>
              ${greeting}
              <div style="font-size:15px;line-height:1.6;color:#475569;">
                ${opts.bodyHtml}
              </div>
              ${cta}
              ${footnote}
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px;background:#f8fafc;border-top:1px solid #f1f5f9;text-align:center;">
              <p style="margin:0;font-size:12px;line-height:1.5;color:#94a3b8;">
                Excession LLC · Client desk communications<br />
                This message was sent because of activity on your account.
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

/**
 * @param {{ name: string, verifyUrl: string }} p
 */
function verificationEmailHtml(p) {
  return buildExcessionEmail({
    heading: 'Confirm your email',
    preheader: 'Verify your Excession account to open your desk workspace.',
    greetingName: p.name,
    bodyHtml: `<p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:#475569;">
  Thanks for opening an account with <strong>Excession LLC</strong>. Before you can access your trading workspace,
  please confirm that this email address belongs to you.
</p>
<p style="margin:0;font-size:15px;line-height:1.6;color:#475569;">
  This secure link expires in <strong>24 hours</strong>. If you did not create an account, you can ignore this message.
</p>`,
    ctaLabel: 'Verify email address',
    ctaUrl: p.verifyUrl,
    footnote:
      'After verification, sign in at excessionllc.org with the password you chose during registration.',
  })
}

/**
 * @param {{ name: string, code: string, minutesValid: number }} p
 */
function passwordResetCodeEmailHtml(p) {
  const code = escapeHtml(p.code)
  const mins = Number(p.minutesValid) || 15
  return buildExcessionEmail({
    heading: 'Your password reset code',
    preheader: `Use code ${p.code} to reset your Excession password. Expires in ${mins} minutes.`,
    greetingName: p.name,
    bodyHtml: `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#475569;">
  We received a request to reset the password for your <strong>Excession LLC</strong> account.
  Enter this one-time code on the password reset page:
</p>
<p style="margin:0 0 20px;text-align:center;">
  <span style="display:inline-block;padding:16px 28px;font-size:28px;font-weight:700;letter-spacing:0.35em;color:#0f172a;background:#f1f5f9;border-radius:10px;border:1px solid #e2e8f0;font-family:ui-monospace,Consolas,monospace;">
    ${code}
  </span>
</p>
<p style="margin:0;font-size:15px;line-height:1.6;color:#475569;">
  This code expires in <strong>${mins} minutes</strong>. If you did not request a reset, you can ignore this email—your password will stay the same.
</p>`,
    footnote: 'For your security, never share this code with anyone. Excession staff will never ask for it.',
  })
}

module.exports = { buildExcessionEmail, verificationEmailHtml, passwordResetCodeEmailHtml, logoUrl }
