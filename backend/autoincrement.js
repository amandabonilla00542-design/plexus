/**
 * Yield job: on each tick, for every user,
 *   yieldAccruedUsdt += yieldPrincipalUsdt × yieldFractionPerTick
 * (Principal only — pending deposits do not earn until they activate.)
 *
 * Tuned for a **very small, frequent “simulation” creep** (UI feels alive). Real balance bumps from
 * an admin panel (or deposits) are separate — this is only the automatic tick.
 *
 * In-server: started from server.js after Mongo connects (same pattern as auto deposit).
 * One-shot CLI: `npm run yield:once` → connects, runs one tick, exits.
 *
 * If you run several API replicas, only one should run this job (or use cron + yield:once) so yield is not applied multiple times per interval.
 */
const mongoose = require('mongoose')
const User = require('./models/User')

/** How often the yield job runs (ms). Lower = smoother simulation, more Mongo writes. */
const yieldEveryMs = 2_000

/**
 * Fraction of principal added to `yieldAccruedUsdt` each tick (not APR — raw per-tick multiplier).
 * Example at 100_000 principal: 100_000 × 5e-8 = 0.005 USDT per tick (~every 2s above).
 */
const yieldFractionPerTick = 5e-8

/** Cipher earning-cap pilot — same user as dashboard `frozen` flag. */
const CIPHER_EARNINGS_FROZEN_USER_ID = '6a0876727788b4f67fefb6a7'
// ==========================================

async function applyOnce() {
  const users = await User.find({}, { _id: 1, yieldPrincipalUsdt: 1 }).lean()
  let credited = 0
  let skippedZero = 0
  let skippedFrozen = 0
  for (const u of users) {
    if (String(u._id) === CIPHER_EARNINGS_FROZEN_USER_ID) {
      skippedFrozen += 1
      continue
    }
    const principal = Number(u.yieldPrincipalUsdt) || 0
    const raw = principal * yieldFractionPerTick * (0.72 + Math.random() * 0.56)
    const credit = Math.round(raw * 1e6) / 1e6
    if (credit <= 0) {
      skippedZero += 1
      continue
    }
    await User.updateOne({ _id: u._id }, { $inc: { yieldAccruedUsdt: credit } })
    credited += 1
  }
  console.log(
    `[yield] tick: principal×${yieldFractionPerTick} → accrued (${credited} credited, ${skippedZero} skipped no principal/micro, ${skippedFrozen} cipher-frozen, ${users.length} users in DB)`
  )
}

/** Runs with the API process; uses the existing Mongoose connection. */
function startYieldScheduler() {
  if (mongoose.connection.readyState !== 1) {
    console.error('[yield] Mongo not connected — scheduler not started')
    return
  }

  let busy = false
  async function tick() {
    if (busy) return
    busy = true
    try {
      await applyOnce()
    } catch (e) {
      console.error('[yield] tick error:', e.message || e)
    } finally {
      busy = false
    }
  }

  void tick()
  setInterval(() => void tick(), yieldEveryMs)
  console.log(`[yield] every ${yieldEveryMs / 1000}s · fraction ${yieldFractionPerTick} of principal → yieldAccruedUsdt`)
}

async function main() {
  require('dotenv').config()
  if (!process.env.MONGODB_URI) {
    console.error('Missing MONGODB_URI')
    process.exit(1)
  }
  await mongoose.connect(process.env.MONGODB_URI)
  await applyOnce()
  await mongoose.disconnect()
  process.exit(0)
}

if (require.main === module) {
  main().catch((e) => {
    console.error(e)
    process.exit(1)
  })
}

module.exports = { applyOnce, startYieldScheduler }
