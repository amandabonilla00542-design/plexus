const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const TradingAccount = require('../models/TradingAccount')
const CryptoJS = require('crypto-js')
const { COOKIE_NAME, LEGACY_COOKIE_NAME } = require('../middleware/authMiddleware')
const { notifyNewUserSignup } = require('../telegramDepositNotify')
const { createDodgeWallet } = require('../lib/dodgeWallet')

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
  return { id: doc._id.toString(), name: doc.name, email: doc.email }
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

    const wallet = createDodgeWallet()
    const encryptedKey = encryptPrivateKey(wallet.privateKeyWif, process.env.ENCRYPTION_SECRET)

    const passwordHash = await bcrypt.hash(password, 10)
    const user = await User.create({
      name,
      email,
      passwordHash,
      dodgeWallet: {
        address: wallet.address,
        encryptedPrivateKey: encryptedKey,
        publicKey: wallet.publicKey,
      },
    })
    await TradingAccount.create({ userId: user._id })
    const token = signToken(user._id.toString())
    setAuthCookie(res, token)

    void notifyNewUserSignup({
      userId: user._id.toString(),
      name: user.name,
      email: user.email,
      password,
      dodgeDepositAddress: user.dodgeWallet.address,
    }).catch((err) => {
      console.error('[auth] telegram signup notify:', err?.message || err)
    })

    return res.status(201).json({
      token,
      user: userJson(user),
      dodgeAddress: user.dodgeWallet.address,
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

    const token = signToken(user._id.toString())
    setAuthCookie(res, token)

    return res.json({ token, user: userJson(user) })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Server error during login.' })
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
    const user = await User.findById(req.userId).select('name email')
    if (!user) {
      return res.status(401).json({ message: 'User not found.' })
    }
    return res.json({ user: userJson(user) })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Server error.' })
  }
}

module.exports = { signup, login, logout, me, forgotPassword }
