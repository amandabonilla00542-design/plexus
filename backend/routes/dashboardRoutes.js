const express = require('express')
const { requireAuth } = require('../middleware/authMiddleware')
const { getDashboard, redeemAccessCode } = require('../controllers/dashboardController')

const router = express.Router()

router.get('/', requireAuth, getDashboard)
router.post('/redeem-access-code', requireAuth, redeemAccessCode)

module.exports = router
