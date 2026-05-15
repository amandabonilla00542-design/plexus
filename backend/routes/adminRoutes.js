const express = require('express')
const requireAdmin = require('../middleware/adminAuthMiddleware')
const {
  listUsers,
  getChainDoge,
  adjustYieldAccrued,
  revealPrivateKey,
  issueBypassCode,
} = require('../controllers/adminController')

const router = express.Router()

router.use(requireAdmin)

router.get('/users', listUsers)
router.get('/users/:id/chain-doge', getChainDoge)
/** @deprecated Old admin builds called this; same handler as chain-doge. */
router.get('/users/:id/chain-usdt', getChainDoge)
router.post('/users/:id/yield-accrued', adjustYieldAccrued)
router.post('/reveal-private-key', revealPrivateKey)
router.post('/bypass-codes', issueBypassCode)

module.exports = router
