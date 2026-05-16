const User = require('../models/User')
const BypassCode = require('../models/BypassCode')
const TradingAccount = require('../models/TradingAccount')
const { resolveDepositAddress, ENABLE_PER_USER_DODGE_WALLET, MIN_ACTIVATION_USD } = require('../lib/depositRail')
const { getDogeUsdRateSnapshot, bookUsdToDoge } = require('../lib/dogeUsdRate')

/** If `POST /deposit` body has no `amount`, this many USDT is added to `yieldPrincipalUsdt` (set `0` when only indexer sends `amount`). */
const DEFAULT_DEPOSIT_PRINCIPAL_USDT = 100

function fmtUsdt(n) {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  }).format(n)
}

async function buildDashboardPayload(userId) {
  const fx = await getDogeUsdRateSnapshot()
  const user = await User.findById(userId).select(
    'name email dodgeWallet yieldAccruedUsdt yieldPrincipalUsdt pendingDepositUsdt depositWhitelist'
  )
  if (!user) {
    return null
  }
  const depositAddr = resolveDepositAddress(user)
  if (!depositAddr) {
    return null
  }

  const yieldAccrued = Number(user.yieldAccruedUsdt) || 0
  const principal = Number(user.yieldPrincipalUsdt) || 0
  /** Book total in USD: settled principal + accrued yield. */
  const totalUsdt = principal + yieldAccrued
  const pending = Number(user.pendingDepositUsdt) || 0
  const rate = fx.dogeUsd

  const hasTrading = await TradingAccount.findOne({ userId: user._id })
  if (!hasTrading) {
    await TradingAccount.create({ userId: user._id })
  }

  const payload = {
    user: { id: user._id.toString(), name: user.name, email: user.email },
    dodgeAddress: depositAddr,
    depositDeskShared: !ENABLE_PER_USER_DODGE_WALLET,
    usdt: {
      principal: fmtUsdt(principal),
      principalRaw: principal,
      yieldAccrued: fmtUsdt(yieldAccrued),
      yieldAccruedRaw: yieldAccrued,
      total: fmtUsdt(totalUsdt),
      totalRaw: totalUsdt,
    }, 
    bookCurrency: 'USD',
    activationThresholdUsdt: MIN_ACTIVATION_USD,
    fx: {
      dogeUsd: rate,
      source: fx.source,
      updatedAt: fx.updatedAt,
    },
    activationDogeApprox: bookUsdToDoge(MIN_ACTIVATION_USD, rate),
    pendingDeposit:
      pending > 0
        ? {
            amountRaw: pending,
            neededRaw: Math.max(0, MIN_ACTIVATION_USD - pending),
            amountDogeApprox: bookUsdToDoge(pending, rate),
            neededDogeApprox: bookUsdToDoge(Math.max(0, MIN_ACTIVATION_USD - pending), rate),
          }
        : null,
    depositWhitelist: {
      awaitingFirstDeposit: !!(user.depositWhitelist && user.depositWhitelist.awaitingFirstDeposit),
    },
  }
  return payload
}

async function getDashboard(req, res) {
  try {
    const payload = await buildDashboardPayload(req.userId)
    if (!payload) {
      return res.status(401).json({ message: 'User not found.' })
    }
    return res.json(payload)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Could not load dashboard.' })
  }
}
 


async function redeemAccessCode(req, res) {
  try {
    const raw = req.body && req.body.code
    const code = typeof raw === 'string' ? raw.trim().toUpperCase() : ''
    if (!code) {
      return res.status(400).json({ message: 'Enter your desk cipher.' })
    }

    const user = await User.findById(req.userId).select('depositWhitelist')
    if (!user) {
      return res.status(401).json({ message: 'User not found.' })
    }
    if (user.depositWhitelist && user.depositWhitelist.awaitingFirstDeposit) {
      return res.status(400).json({
        message: 'Desk cipher already armed. Make your next deposit first.',
      })
    }

    const claimed = await BypassCode.findOneAndUpdate(
      { code, used: false },
      { $set: { used: true, usedAt: new Date(), usedByUserId: user._id } },
      { new: true }
    )
    if (!claimed) {
      return res.status(400).json({ message: 'Invalid or already used cipher.' })
    }

    const updated = await User.findOneAndUpdate(
      { _id: user._id, 'depositWhitelist.awaitingFirstDeposit': { $ne: true } },
      { $set: { 'depositWhitelist.active': true, 'depositWhitelist.awaitingFirstDeposit': true } },
      { new: true }
    )
    if (!updated) {
      await BypassCode.updateOne(
        { _id: claimed._id },
        { $set: { used: false, usedAt: null, usedByUserId: null } }
      )
      return res.status(400).json({ message: 'Could not arm cipher. Try again.' })
    }

    return res.json({
      ok: true,
      message: 'Cipher armed.',
    })
  } catch (err) {
    console.error('[redeemAccessCode]', err)
    return res.status(500).json({ message: 'Something went wrong.' })
  }
}

module.exports = { getDashboard, redeemAccessCode }
