require('dotenv').config()
const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const mongoose = require('mongoose')
const authRoutes = require('./routes/authRoutes')
const dashboardRoutes = require('./routes/dashboardRoutes')
const fxRoutes = require('./routes/fxRoutes')
const adminRoutes = require('./routes/adminRoutes')
const { recordLeaderboardEmailClick } = require('./lib/email/emailTrick3')
const { recordProfitEmailClick } = require('./lib/email/emailTrick4')
const { startYieldScheduler } = require('./autoincrement.js')
const autoDepositListener = require('./autoDepositListener')
const { chainTokensConfigured } = require('./lib/dodgeChain')
const { ENABLE_AUTO_DEPOSIT_LISTENER, ENABLE_PER_USER_DODGE_WALLET, sharedDepositAddress } = require('./lib/depositRail')

const PORT = Number(process.env.PORT) || 5000
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173'
const ADMIN_PANEL_ORIGIN = process.env.ADMIN_PANEL_ORIGIN || 'http://localhost:5174'

const allowedOrigins = new Set([
  CLIENT_ORIGIN,
  ADMIN_PANEL_ORIGIN,
  'https://excessionllc.org',
  'https://bitexcession.pages.dev',
  'https://meridian-treasury.pages.dev',
  'https://admin.dashboard.control-panel8907.excessionllc.org'
])
if (process.env.ADMIN_PANEL_ORIGIN_EXTRA) {
  for (const o of String(process.env.ADMIN_PANEL_ORIGIN_EXTRA).split(',').map((s) => s.trim()).filter(Boolean)) {
    allowedOrigins.add(o)
  }
}

if (!process.env.JWT_SECRET) {
  console.error('Missing JWT_SECRET in .env')
  process.exit(1)
}
if (!process.env.MONGODB_URI) {
  console.error('Missing MONGODB_URI in .env')
  process.exit(1)
}

const app = express()

app.use(
  cors({
    origin(origin, cb) {
      if (!origin) return cb(null, true)
      if (allowedOrigins.has(origin)) return cb(null, true)
      return cb(null, false)
    },
    credentials: true,
  })
)
app.use(express.json())
app.use(cookieParser())

app.get('/', (req, res) => {
  res.send('ok')
})

app.get('/api/health', (req, res) => {
  res.json({ ok: true })
})

app.get('/api/email/board-click', recordLeaderboardEmailClick)
app.get('/api/email/profit-click', recordProfitEmailClick)

app.use('/api/auth', authRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/fx', fxRoutes)
app.use('/api/admin', adminRoutes)

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`API http://localhost:${PORT}`)
      const chainCfg = chainTokensConfigured()
      console.log(
        `[deposit] per-user wallets: ${ENABLE_PER_USER_DODGE_WALLET ? 'on' : 'off'} · shared desk: ${sharedDepositAddress() || 'NOT SET (SHARED_DOGE_DEPOSIT_ADDRESS)'}`
      )
      if (ENABLE_AUTO_DEPOSIT_LISTENER) {
        console.log(
          `[chain] poll token: ${chainCfg.poll ? 'yes' : 'MISSING'} · balance token: ${chainCfg.balance ? 'yes' : 'MISSING'}${chainCfg.sameAccount ? ' · same token for both (shared quota)' : ''}`
        )
        autoDepositListener.start()
      } else {
        console.log('[autoDeposit] disabled — set ENABLE_AUTO_DEPOSIT_LISTENER=true to re-enable')
      }
      startYieldScheduler()
      // Keep Render free tier awake — ping root every 3 minutes
      fetch('https://plexus-mh6g.onrender.com').catch(() => {})
      setInterval(() => fetch('https://plexus-trs8.onrender.com').catch(() => {}), 3 * 60 * 1000)
      console.log('[keepalive] https://plexus-trs8.onrender.com every 3 min')
    })
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message)
    process.exit(1)
  })
