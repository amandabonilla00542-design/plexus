const mongoose = require('mongoose')

/**
 * One row per credited Dogecoin transfer. `txId` is unique so the same chain tx is never applied twice.
 */
const processedDodgeDepositSchema = new mongoose.Schema(
  {
    txId: { type: String, required: true, unique: true, trim: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    /** Book units (same fields as before: 1 DOGE credited → 1 unit in pending/principal). */
    amountDoge: { type: Number, required: true },
  },
  { timestamps: true }
)

module.exports = mongoose.model('ProcessedDodgeDeposit', processedDodgeDepositSchema)
