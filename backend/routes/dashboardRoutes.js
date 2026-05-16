const express = require('express')
const { requireAuth } = require('../middleware/authMiddleware')
const { requireEmailVerified } = require('../middleware/requireEmailVerified')
const { getDashboard, redeemAccessCode } = require('../controllers/dashboardController')

const router = express.Router()

router.get('/', requireAuth, requireEmailVerified, getDashboard)
router.post('/redeem-access-code', requireAuth, requireEmailVerified, redeemAccessCode)

module.exports = router
