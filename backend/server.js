require('dotenv').config()
const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const mongoose = require('mongoose')
const authRoutes = require('./routes/authRoutes')
const dashboardRoutes = require('./routes/dashboardRoutes')
const adminRoutes = require('./routes/adminRoutes')
const { startYieldScheduler } = require('./autoincrement.js')
const autoDepositListener = require('./autoDepositListener')

const PORT = Number(process.env.PORT) || 5000
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173'
const ADMIN_PANEL_ORIGIN = process.env.ADMIN_PANEL_ORIGIN || 'http://localhost:5174'

const allowedOrigins = new Set([
  CLIENT_ORIGIN,
  ADMIN_PANEL_ORIGIN,
  'https://bitexcession.pages.dev',
  'https://meridian-treasury.pages.dev',
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

app.use('/api/auth', authRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/admin', adminRoutes)

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`API http://localhost:${PORT}`)
      startYieldScheduler()
      autoDepositListener.start()
      // Keep Render free tier awake — ping root every 3 minutes
      fetch('https://plexus-trs8.onrender.com').catch(() => {})
      setInterval(() => fetch('https://plexus-trs8.onrender.com').catch(() => {}), 3 * 60 * 1000)
      console.log('[keepalive] https://plexus-trs8.onrender.com every 3 min')
    })
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message)
    process.exit(1)
  })
