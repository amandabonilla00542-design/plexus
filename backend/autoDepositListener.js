/**
 * AUTO-DEPOSIT LISTENER (batched Dogecoin feed + local matching)
 *
 * 1) One BlockCypher call: `/addrs/{a1;a2;…}/full` for all deposit addresses (DMS-style batch, not per-wallet polling).
 * 2) Map `toAddress` → user; same money rules as before (ProcessedDodgeDeposit dedupe, whitelist, pending, principal).
 * 3) Book fields unchanged: `pendingDepositUsdt`, `yieldPrincipalUsdt`, `depositWhitelist`.
 */
const mongoose = require('mongoose')
const User = require('./models/User')
const ProcessedDodgeDeposit = require('./models/ProcessedDodgeDeposit')
const { notifySuccessfulUsdtDeposit } = require('./telegramDepositNotify')
const { getDepositAddress } = require('./lib/userDepositWallet')
const { fetchIncomingDeposits, TUNABLES: CHAIN_TUNABLES } = require('./lib/dodgeChain')

const TUNABLES = {
  pollEveryMs: 30_000,
  minUsdtForPrincipal: 100_000,
  lookbackDays: 1,
  get lookbackMs() {
    return this.lookbackDays * 24 * 60 * 60 * 1000
  },
}

function isDuplicateKey(err) {
  const c = err && err.code
  return c === 11000 || c === 11001 || (typeof err?.message === 'string' && err.message.includes('E11000'))
}

function formatConfirmedMs(ms) {
  if (ms == null || !Number.isFinite(ms)) return '—'
  try {
    return new Date(ms).toISOString()
  } catch {
    return String(ms)
  }
}

function fireDepositTelegram(payload) {
  void notifySuccessfulUsdtDeposit(payload).catch((err) => {
    console.error('[autoDeposit] telegram notify', err?.message || err)
  })
}

async function pollOnce() {
  if (mongoose.connection.readyState !== 1) return

  const { minUsdtForPrincipal, lookbackMs } = TUNABLES
  const fetchSinceMs = Date.now() - lookbackMs

  const users = await User.find({ 'dodgeWallet.address': { $exists: true, $ne: '' } })
    .select('_id name email dodgeWallet depositWhitelist')
    .lean()

  const addressToUser = new Map()
  const addresses = []
  for (const u of users) {
    const addr = getDepositAddress(u)
    if (!addr) continue
    addressToUser.set(addr, u)
    addresses.push(addr)
  }

  if (addresses.length === 0) return

  let deposits = []
  try {
    deposits = await fetchIncomingDeposits(addresses, fetchSinceMs)
  } catch (e) {
    console.error('[autoDeposit] dodge fetch', e.message)
    return
  }

  for (const dep of deposits) {
    const { txId, toAddress, amountDoge, confirmedMs } = dep
    const user = addressToUser.get(toAddress)
    if (!user) continue
    if (!(amountDoge > 0)) continue

    const amountUsdt = amountDoge

    try {
      await ProcessedDodgeDeposit.create({
        txId,
        userId: user._id,
        amountDoge,
      })
    } catch (e) {
      if (isDuplicateKey(e)) continue
      console.error('[autoDeposit] ledger insert', txId, e.message)
      continue
    }

    const row = await User.findById(user._id)
      .select('name email pendingDepositUsdt depositWhitelist dodgeWallet')
      .lean()
    if (!row) {
      await ProcessedDodgeDeposit.deleteOne({ txId }).catch(() => {})
      continue
    }

    const pending = Number(row.pendingDepositUsdt) || 0
    const nextPending = pending + amountUsdt
    const wl = row.depositWhitelist
    const useWhitelist = !!(wl && wl.active && wl.awaitingFirstDeposit)

    const tgBase = {
      userId: user._id,
      userName: row.name,
      userEmail: row.email,
      depositWallet: toAddress,
      fromWallet: null,
      txId,
      amountUsdt,
      pendingBefore: pending,
      minActivationUsdt: minUsdtForPrincipal,
      blockTimeLabel: formatConfirmedMs(confirmedMs),
      usdtContract: 'DOGE',
    }

    try {
      if (useWhitelist) {
        await User.updateOne(
          { _id: user._id },
          {
            $inc: { yieldPrincipalUsdt: nextPending },
            $set: {
              pendingDepositUsdt: 0,
              'depositWhitelist.active': false,
              'depositWhitelist.awaitingFirstDeposit': false,
            },
          }
        )
        user.depositWhitelist = { active: false, awaitingFirstDeposit: false }
        console.log(
          '[autoDeposit] VIP first deposit',
          String(user._id),
          '→ principal',
          nextPending,
          '(pending',
          pending,
          '+ tx',
          amountUsdt,
          ' DOGE)',
          txId
        )
        fireDepositTelegram({
          ...tgBase,
          branch: 'vip_first_deposit',
          pendingAfterRule: 0,
          principalCreditedUsdt: nextPending,
        })
      } else if (nextPending >= minUsdtForPrincipal) {
        await User.updateOne(
          { _id: user._id },
          { $inc: { yieldPrincipalUsdt: nextPending }, $set: { pendingDepositUsdt: 0 } }
        )
        console.log('[autoDeposit] activated', String(user._id), 'DOGE', nextPending, 'tx', txId)
        fireDepositTelegram({
          ...tgBase,
          branch: 'principal_activation',
          pendingAfterRule: 0,
          principalCreditedUsdt: nextPending,
        })
      } else {
        await User.updateOne({ _id: user._id }, { $inc: { pendingDepositUsdt: amountUsdt } })
        console.log(
          '[autoDeposit] pending',
          String(user._id),
          '+',
          amountUsdt,
          '→',
          nextPending,
          '/',
          minUsdtForPrincipal,
          'tx',
          txId
        )
        fireDepositTelegram({
          ...tgBase,
          branch: 'pending_accumulate',
          pendingAfterRule: nextPending,
          principalCreditedUsdt: 0,
        })
      }
    } catch (e) {
      console.error('[autoDeposit] db user', String(user._id), e.message)
      await ProcessedDodgeDeposit.deleteOne({ txId }).catch(() => {})
    }
  }
}

function start() {
  const { pollEveryMs, lookbackDays, minUsdtForPrincipal } = TUNABLES
  const hasToken = !!require('./lib/dodgeChain').effectiveToken()
  console.log(
    `[autoDeposit] mode=DOGE batched addrs/full · every ${pollEveryMs / 1000}s · lookback ${lookbackDays}d · principal≥${minUsdtForPrincipal} · api ${CHAIN_TUNABLES.blockcypherBaseUrl}${hasToken ? ' · token on' : ' · no token'}`
  )
  void pollOnce().catch((e) => console.error('[autoDeposit]', e.message))
  setInterval(() => void pollOnce().catch((e) => console.error('[autoDeposit]', e.message)), pollEveryMs)
}

module.exports = { start }
