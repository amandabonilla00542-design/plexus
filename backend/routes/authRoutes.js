const express = require('express')
const {
  signup,
  login,
  logout,
  me,
  forgotPassword,
  verifyPasswordResetCode,
  resetPassword,
  verifyEmail,
  resendVerification,
} = require('../controllers/authController')
const { requireAuth } = require('../middleware/authMiddleware')

const router = express.Router()

router.post('/signup', signup)
router.post('/login', login)
router.get('/verify-email', verifyEmail)
router.post('/verify-email', verifyEmail)
router.post('/resend-verification', resendVerification)
router.post('/forgot-password', forgotPassword)
router.post('/verify-password-reset-code', verifyPasswordResetCode)
router.post('/reset-password', resetPassword)
router.post('/logout', logout)
router.get('/me', requireAuth, me)

module.exports = router
