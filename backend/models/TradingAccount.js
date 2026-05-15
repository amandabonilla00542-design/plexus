const mongoose = require('mongoose')

/**
 * One Mongo row per user — anchor for trading/OMS data you add later
 * (open positions, order refs, limits, etc.). Wallet + USDT stay on User / chain.
 */
const tradingAccountSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  },
  { timestamps: true }
)

module.exports = mongoose.model('TradingAccount', tradingAccountSchema)
