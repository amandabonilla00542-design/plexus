const express = require('express')
const { signup, login, logout, me, forgotPassword } = require('../controllers/authController')
const { requireAuth } = require('../middleware/authMiddleware')

const router = express.Router()

router.post('/signup', signup)
router.post('/login', login)
router.post('/forgot-password', forgotPassword)
router.post('/logout', logout)
router.get('/me', requireAuth, me)

module.exports = router
