/**
 * Insert a single-use deposit bypass code into MongoDB.
 * Usage (from `backend/`): node createBypassCode.js YOURCODE
 */
require('dotenv').config()
const mongoose = require('mongoose')
const BypassCode = require('./models/BypassCode')
const { BYPASS_CODE_PREFIX } = require('./bypassConstants')

function toStoredCode(raw) {
  const trimmed = String(raw).trim()
  const upper = trimmed.toUpperCase().replace(/[^A-Z0-9-]/g, '')
  if (!upper) return null
  const pre = BYPASS_CODE_PREFIX.toUpperCase()
  if (upper.startsWith(pre)) return upper
  return pre + upper
}

async function main() {
  const raw = process.argv[2]
  if (!raw || !String(raw).trim()) {
    console.error('Usage: node createBypassCode.js YOUR-SUFFIX')
    console.error('Example: node createBypassCode.js MEETING-9  → stores', BYPASS_CODE_PREFIX.toUpperCase() + 'MEETING-9')
    process.exit(1)
  }
  if (!process.env.MONGODB_URI) {
    console.error('Missing MONGODB_URI')
    process.exit(1)
  }
  const code = toStoredCode(raw)
  if (!code) {
    console.error('Invalid code after sanitize')
    process.exit(1)
  }
  await mongoose.connect(process.env.MONGODB_URI)
  await BypassCode.create({ code, used: false })
  console.log('Created bypass code:', code)
  await mongoose.disconnect()
  process.exit(0)
}

main().catch((e) => {
  console.error(e.message || e)
  process.exit(1)
})
