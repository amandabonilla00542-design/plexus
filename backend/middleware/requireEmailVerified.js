const User = require('../models/User')

/** After `requireAuth` — blocks desk APIs until `emailVerified` is true. */
async function requireEmailVerified(req, res, next) {
  try {
    const user = await User.findById(req.userId).select('emailVerified').lean()
    if (!user) {
      return res.status(401).json({ message: 'User not found.' })
    }
    if (user.emailVerified === false) {
      return res.status(403).json({
        message: 'Verify your email before accessing the desk.',
        code: 'EMAIL_NOT_VERIFIED',
      })
    }
    return next()
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Server error.' })
  }
}

module.exports = { requireEmailVerified }
