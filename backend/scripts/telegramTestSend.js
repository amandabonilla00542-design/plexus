/**
 * One-shot: send a test message to Telegram using backend .env
 *
 *   cd backend && node scripts/telegramTestSend.js
 *   npm run telegram:test   (from backend root)
 */
require('dotenv').config()

const TELEGRAM_API = 'https://api.telegram.org'

async function main() {
  const token = String(process.env.TELEGRAM_BOT_TOKEN || '').trim()
  const chatId = String(process.env.TELEGRAM_CHAT_ID || '').trim()

  if (!token || !chatId) {
    console.error('Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID in .env')
    process.exit(1)
  }

  if (typeof fetch !== 'function') {
    console.error('Node 18+ required (global fetch).')
    process.exit(1)
  }

  const text = `✅ <b>Meridian / Excession LLC test</b>\n\n<code>${new Date().toISOString()}</code>\nIf you see this, bot token + chat id are valid.`

  const url = `${TELEGRAM_API}/bot${token}/sendMessage`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    }),
  })

  const body = await res.text()
  if (!res.ok) {
    console.error('Telegram error', res.status, body.slice(0, 800))
    process.exit(1)
  }

  console.log('OK — check your Telegram chat. Response:', body.slice(0, 200))
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
