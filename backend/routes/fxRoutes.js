const express = require('express')
const { getDogeUsd } = require('../controllers/fxController')

const router = express.Router()

router.get('/doge-usd', getDogeUsd)

module.exports = router
