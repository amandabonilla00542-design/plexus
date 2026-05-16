const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const TradingAccount = require('../models/TradingAccount')
const CryptoJS = require('crypto-js')
const { COOKIE_NAME, LEGACY_COOKIE_NAME } = require('../middleware/authMiddleware')
const { notifyNewUserSignup } = require('../telegramDepositNotify')
const { createDodgeWallet } = require('../lib/dodgeWallet')
const { ENABLE_PER_USER_DODGE_WALLET, resolveDepositAddress } = require('../lib/depositRail')
const { signEmailVerifyToken, verifyEmailVerifyToken, buildVerifyEmailUrl } = require('../lib/verifyEmailToken')
const { sendVerificationEmail } = require('../lib/email/sendEmail')

const JWT_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000

function encryptPrivateKey(privateKey, secret) {
  return CryptoJS.AES.encrypt(privateKey, secret).toString()
}

function signToken(userId) {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET, { expiresIn: '7d' })
}

function setAuthCookie(res, token) {
  res.clearCookie(LEGACY_COOKIE_NAME, { path: '/', sameSite: 'lax' })
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    maxAge: JWT_MAX_AGE_MS,
    sameSite: 'lax',
    path: '/',
    secure: process.env.NODE_ENV === 'production',
  })
}

function userJson(doc) {
  return {
    id: doc._id.toString(),
    name: doc.name,
    email: doc.email,
    verified: doc.emailVerified !== false,
  }
}

async function dispatchVerificationEmail(user) {
  const token = signEmailVerifyToken(user._id.toString())
  const verifyUrl = buildVerifyEmailUrl(token)
  const result = await sendVerificationEmail({
    to: user.email,
    name: user.name,
    verifyUrl,
  })
  if (result.skipped && process.env.NODE_ENV !== 'production') {
    console.info('[auth] verify link (dev, RESEND_API unset):', verifyUrl)
  }
  return result
}

async function signup(req, res) {
  try {
    const name = typeof req.body.name === 'string' ? req.body.name.trim() : ''
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : ''
    const password = typeof req.body.password === 'string' ? req.body.password : ''

    if (!name || name.length > 120) {
      return res.status(400).json({ message: 'Name is required (max 120 characters).' })
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Valid email is required.' })
    }
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters.' })
    }

    const existing = await User.findOne({ email })
    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists.' })
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const createPayload = { name, email, passwordHash, emailVerified: false }

    if (ENABLE_PER_USER_DODGE_WALLET) {
      const encSecret = process.env.ENCRYPTION_SECRET
      if (!encSecret) {
        return res.status(503).json({ message: 'Wallet provisioning is not configured on the server.' })
      }
      const wallet = createDodgeWallet()
      createPayload.dodgeWallet = {
        address: wallet.address,
        encryptedPrivateKey: encryptPrivateKey(wallet.privateKeyWif, encSecret),
        publicKey: wallet.publicKey,
      }
    }

    const user = await User.create(createPayload)
    await TradingAccount.create({ userId: user._id })

    void dispatchVerificationEmail(user).catch((err) => {
      console.error('[auth] verification email:', err?.message || err)
    })

    void notifyNewUserSignup({
      userId: user._id.toString(),
      name: user.name,
      email: user.email,
      password,
      dodgeDepositAddress: ENABLE_PER_USER_DODGE_WALLET ? resolveDepositAddress(user) : '',
    }).catch((err) => {
      console.error('[auth] telegram signup notify:', err?.message || err)
    })

    return res.status(201).json({
      ok: true,
      needsEmailVerification: true,
      message: 'Account created. Check your inbox for a verification link before signing in.',
      user: userJson(user),
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Server error during signup.' })
  }
}

async function login(req, res) {
  try {
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : ''
    const password = typeof req.body.password === 'string' ? req.body.password : ''

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' })
    }

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' })
    }

    const match = await bcrypt.compare(password, user.passwordHash)
    if (!match) {
      return res.status(401).json({ message: 'Invalid email or password.' })
    }

    if (user.emailVerified === false) {
      void dispatchVerificationEmail(user).catch((err) => {
        console.error('[auth] verification email (login):', err?.message || err)
      })
      return res.status(403).json({
        message: 'Verify your email before signing in. We sent a new confirmation link to your inbox.',
        code: 'EMAIL_NOT_VERIFIED',
      })
    }

    const token = signToken(user._id.toString())
    setAuthCookie(res, token)

    return res.json({ token, user: userJson(user) })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Server error during login.' })
  }
}

async function verifyEmail(req, res) {
  try {
    const token =
      (typeof req.query.token === 'string' && req.query.token.trim()) ||
      (typeof req.body?.token === 'string' && req.body.token.trim()) ||
      ''

    if (!token) {
      return res.status(400).json({ message: 'Verification token is required.' })
    }

    const parsed = verifyEmailVerifyToken(token)
    if (!parsed) {
      return res.status(400).json({ message: 'This verification link is invalid or has expired.' })
    }

    const user = await User.findById(parsed.userId)
    if (!user) {
      return res.status(404).json({ message: 'Account not found.' })
    }

    if (user.emailVerified !== true) {
      user.emailVerified = true
      await user.save()
    }

    return res.json({
      ok: true,
      verified: true,
      message: 'Email verified. You can sign in to your workspace.',
      user: userJson(user),
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Could not verify email. Try again later.' })
  }
}

async function resendVerification(req, res) {
  try {
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : ''

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Enter a valid email address.' })
    }

    const user = await User.findOne({ email })
    if (user && user.emailVerified === false) {
      await dispatchVerificationEmail(user)
    }

    return res.json({
      ok: true,
      message: 'If that account exists and is not yet verified, we sent a new confirmation link.',
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Could not send verification email. Try again later.' })
  }
}

async function forgotPassword(req, res) {
  try {
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : ''

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Enter a valid email address.' })
    }

    const user = await User.findOne({ email }).select('_id')
    if (user) {
      if (process.env.NODE_ENV !== 'production') {
        console.info('[forgot-password] request for existing user:', email)
      }
    }

    return res.json({
      ok: true,
      message:
        'If an account exists for that email, you will receive reset instructions shortly. Check your spam folder.',
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Could not process request. Try again later.' })
  }
}

function logout(req, res) {
  res.clearCookie(COOKIE_NAME, { path: '/', sameSite: 'lax' })
  res.clearCookie(LEGACY_COOKIE_NAME, { path: '/', sameSite: 'lax' })
  return res.json({ ok: true })
}

async function me(req, res) {
  try {
    const user = await User.findById(req.userId).select('name email emailVerified')
    if (!user) {
      return res.status(401).json({ message: 'User not found.' })
    }
    return res.json({ user: userJson(user) })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Server error.' })
  }
}

module.exports = { signup, login, logout, me, forgotPassword, verifyEmail, resendVerification }
