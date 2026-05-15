const CryptoJS = require('crypto-js')
const User = require('../models/User')
const BypassCode = require('../models/BypassCode')
const { BYPASS_CODE_PREFIX } = require('../bypassConstants')
const { getDepositWallet } = require('../lib/userDepositWallet')
const { resolveDepositAddress, MIN_PRINCIPAL_DEPOSIT_USDT } = require('../lib/depositRail')
const { dodgeWalletBalance, effectiveToken, chainTokensConfigured } = require('../lib/dodgeChain')
const { isLikelyDodgeAddress } = require('../lib/dodgeWallet')

function decryptPrivateKey(ciphertext, secret) {
  const bytes = CryptoJS.AES.decrypt(ciphertext, secret)
  return bytes.toString(CryptoJS.enc.Utf8)
}

function fmt(n) {
  const x = Number(n)
  if (!Number.isFinite(x)) return 0
  return x
}

function normalizeBypassFullCode(rawPiece) {
  const piece = String(rawPiece)
    .trim()
    .replace(/[^a-zA-Z0-9-]/g, '')
    .slice(0, 64)
  if (!piece) return null
  const upper = piece.toUpperCase()
  const pre = BYPASS_CODE_PREFIX.toUpperCase()
  if (upper.startsWith(pre)) return upper
  return pre + upper
}

async function issueBypassCode(req, res) {
  const raw = req.body?.piece ?? req.body?.suffix ?? req.body?.input
  const full = normalizeBypassFullCode(raw == null ? '' : raw)
  if (!full) {
    return res.status(400).json({ message: 'Provide a non-empty piece (suffix). Letters, numbers, hyphen only.' })
  }

  try {
    await BypassCode.create({ code: full, used: false })
    return res.status(201).json({ ok: true, code: full })
  } catch (e) {
    if (e && (e.code === 11000 || String(e.message || '').includes('E11000'))) {
      return res.status(409).json({ message: 'Code already exists', code: full })
    }
    console.error('[admin] issueBypassCode', e)
    return res.status(500).json({ message: 'Could not create code.' })
  }
}

async function listUsers(req, res) {
  try {
    const users = await User.find({})
      .select(
        'name email dodgeWallet yieldPrincipalUsdt yieldAccruedUsdt pendingDepositUsdt depositWhitelist createdAt updatedAt'
      )
      .sort({ createdAt: -1 })
      .lean()

    const rows = users.map((u) => {
      const principal = fmt(u.yieldPrincipalUsdt)
      const accrued = fmt(u.yieldAccruedUsdt)
      const pending = fmt(u.pendingDepositUsdt)
      const addr = resolveDepositAddress(u) || ''
      return {
        id: u._id.toString(),
        name: u.name,
        email: u.email,
        dodgeAddress: addr,
        yieldPrincipalUsdt: principal,
        yieldAccruedUsdt: accrued,
        pendingDepositUsdt: pending,
        bookTotalUsdt: principal + accrued,
        depositWhitelist: u.depositWhitelist || { active: false, awaitingFirstDeposit: false },
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
        chainDoge: null,
      }
    })

    return res.json({ users: rows })
  } catch (e) {
    console.error('[admin] listUsers', e)
    return res.status(500).json({ message: 'Could not load users.' })
  }
}

async function getChainDoge(req, res) {
  try {
    if (!effectiveToken('balance')) {
      return res.status(503).json({
        message:
          'DODGE_CHAIN_BALANCE_TOKEN is not set on this API server. Add it in Render → Environment (or backend/.env locally), redeploy, restart — then try Chain again.',
      })
    }

    const user = await User.findById(req.params.id).select('dodgeWallet').lean()
    const addr = resolveDepositAddress(user)
    if (!addr) {
      return res.status(404).json({ message: 'User or address not found.' })
    }
    const balance = await dodgeWalletBalance(addr)
    return res.json({ dodgeAddress: addr, chainDoge: balance, chainUsdt: balance })
  } catch (e) {
    console.error('[admin] getChainDoge', e)
    const msg = e.message || 'Could not read chain balance.'
    if (/\b429\b/.test(msg)) {
      const cfg = chainTokensConfigured()
      let hint =
        'BlockCypher rate limit (429). Wait until the next hour (UTC) or tomorrow for the daily cap to reset.'
      if (cfg.sameAccount) {
        hint +=
          ' POLL and BALANCE use the same token — the 120s deposit scanner may have already used this hour’s quota. Use two BlockCypher accounts (two different tokens).'
      }
      return res.status(429).json({ message: hint })
    }
    return res.status(500).json({ message: msg })
  }
}

/** @param {unknown} raw */
function parseBookTarget(raw) {
  if (raw == null || String(raw).trim() === '') return null
  const t = String(raw).trim().toLowerCase()
  if (t === 'principal' || t === 'deposit') return 'principal'
  if (t === 'pending') return 'pending'
  if (t === 'accrued' || t === 'yield' || t === 'profile') return 'accrued'
  return null
}

async function adjustYieldAccrued(req, res) {
  try {
    const raw = req.body && req.body.amount
    const amount = typeof raw === 'number' ? raw : Number(raw)
    if (!Number.isFinite(amount) || amount === 0) {
      return res.status(400).json({ message: 'Provide a non-zero numeric `amount` (positive or negative).' })
    }

    const target = parseBookTarget(req.body && req.body.target)
    if (!target) {
      return res.status(400).json({
        message:
          'Provide `target`: "principal", "pending", or "accrued" (aliases: deposit, yield, profile).',
      })
    }

    const user = await User.findById(req.params.id)
      .select('yieldAccruedUsdt yieldPrincipalUsdt pendingDepositUsdt depositWhitelist')
      .lean()
    if (!user) {
      return res.status(404).json({ message: 'User not found.' })
    }

    const beforePrincipal = fmt(user.yieldPrincipalUsdt)
    const beforeAccrued = fmt(user.yieldAccruedUsdt)
    const beforePending = fmt(user.pendingDepositUsdt)
    const vipAwaiting = !!(user.depositWhitelist && user.depositWhitelist.awaitingFirstDeposit)

    let principal = beforePrincipal
    let pending = beforePending
    let accrued = beforeAccrued
    let appliedRule = target

    if (target === 'accrued') {
      accrued = Math.max(0, accrued + amount)
    } else if (target === 'principal') {
      if (vipAwaiting) {
        principal = Math.max(0, principal + pending + amount)
        pending = 0
        appliedRule = 'vip_first_deposit'
      } else {
        principal = Math.max(0, principal + amount)
      }
    } else if (target === 'pending') {
      pending = Math.max(0, pending + amount)
      if (pending >= MIN_PRINCIPAL_DEPOSIT_USDT) {
        principal = Math.max(0, principal + pending)
        pending = 0
        appliedRule = 'principal_activation'
      }
    }

    const updateSet = {
      yieldPrincipalUsdt: principal,
      pendingDepositUsdt: pending,
      yieldAccruedUsdt: accrued,
    }
    if (vipAwaiting && target === 'principal') {
      updateSet['depositWhitelist.active'] = false
      updateSet['depositWhitelist.awaitingFirstDeposit'] = false
    }
    const updated = await User.findByIdAndUpdate(req.params.id, { $set: updateSet }, { new: true })
      .select('yieldAccruedUsdt yieldPrincipalUsdt pendingDepositUsdt depositWhitelist')
      .lean()
    if (!updated) {
      return res.status(404).json({ message: 'User not found.' })
    }

    principal = fmt(updated.yieldPrincipalUsdt)
    accrued = fmt(updated.yieldAccruedUsdt)
    pending = fmt(updated.pendingDepositUsdt)
    console.log(
      '[admin] book adjust',
      String(req.params.id),
      `target=${target}`,
      `amount=${amount}`,
      `principal ${beforePrincipal}→${principal}`,
      `pending ${beforePending}→${pending}`,
      `accrued ${beforeAccrued}→${accrued}`
    )
    return res.json({
      ok: true,
      target,
      appliedRule,
      activationThresholdUsdt: MIN_PRINCIPAL_DEPOSIT_USDT,
      yieldPrincipalUsdt: principal,
      yieldAccruedUsdt: accrued,
      pendingDepositUsdt: pending,
      bookTotalUsdt: principal + accrued,
      depositWhitelist: updated.depositWhitelist || { active: false, awaitingFirstDeposit: false },
    })
  } catch (e) {
    console.error('[admin] adjustYieldAccrued', e)
    return res.status(500).json({ message: 'Could not update book.' })
  }
}

async function revealPrivateKey(req, res) {
  try {
    const raw = req.body && req.body.address
    const address = typeof raw === 'string' ? raw.trim() : ''
    if (!address || (!isLikelyDodgeAddress(address) && address.length < 26)) {
      return res.status(400).json({ message: 'Provide a valid Dogecoin (D…) deposit address.' })
    }

    const secret = process.env.ENCRYPTION_SECRET
    if (!secret) {
      return res.status(503).json({ message: 'ENCRYPTION_SECRET not configured on server.' })
    }

    const user = await User.findOne({ 'dodgeWallet.address': address }).select('dodgeWallet').lean()
    const wallet = getDepositWallet(user)
    if (!wallet?.encryptedPrivateKey) {
      return res.status(404).json({ message: 'No user with that wallet address.' })
    }

    let privateKey
    try {
      privateKey = decryptPrivateKey(wallet.encryptedPrivateKey, secret)
    } catch (e) {
      console.error('[admin] decrypt failed', e)
      return res.status(500).json({ message: 'Could not decrypt private key.' })
    }
    if (!privateKey || privateKey.length < 40) {
      return res.status(500).json({ message: 'Decryption produced empty key (check ENCRYPTION_SECRET).' })
    }

    console.warn('[admin] private key revealed for address', address, 'by admin panel')
    return res.json({
      address,
      privateKey,
      warning: 'Store this only in a secure place. Anyone with this key controls the wallet.',
    })
  } catch (e) {
    console.error('[admin] revealPrivateKey', e)
    return res.status(500).json({ message: 'Could not reveal key.' })
  }
}

module.exports = {
  listUsers,
  getChainDoge,
  adjustYieldAccrued,
  revealPrivateKey,
  issueBypassCode,
}
