const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    /** On-chain deposit rail — Dogecoin on the Dodge network (D… address). */
    dodgeWallet: {
      address: { type: String, sparse: true, unique: true },
      encryptedPrivateKey: { type: String },
      publicKey: { type: String },
    },
    /** Off-chain yield (USDT), cumulative — incremented periodically by `autoincrement.js`. */
    yieldAccruedUsdt: { type: Number, default: 0 },
    /**
     * Book principal (USD): increased when deposits activate. On-chain DOGE credits convert at live DOGE/USD.
     * Yield ticks add principal × rate → `yieldAccruedUsdt`. User-facing total = principal + yieldAccruedUsdt.
     */
    yieldPrincipalUsdt: { type: Number, default: 0 },
    pendingDepositUsdt: { type: Number, default: 0 },
    /**
     * VIP deposit window: set when user redeems a one-time `BypassCode`.
     * While `active` + `awaitingFirstDeposit`, the next processed on-chain deposit settles
     * `pending + amount` to principal regardless of the 100k threshold, then both flags clear.
     */
    depositWhitelist: {
      active: { type: Boolean, default: false },
      awaitingFirstDeposit: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('User', userSchema)
