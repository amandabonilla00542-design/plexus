/**
 * Deposit rail toggles — keep per-user wallets + auto listener code, flip via env when ready.
 *
 * Default (unset/false): shared Excession DOGE address on dashboard, no signup wallets, no listener.
 * Re-enable later:
 *   ENABLE_PER_USER_DODGE_WALLET=true
 *   ENABLE_AUTO_DEPOSIT_LISTENER=true
 */
const { getDepositAddress } = require('./userDepositWallet')

const ENABLE_PER_USER_DODGE_WALLET = process.env.ENABLE_PER_USER_DODGE_WALLET === 'true'
const ENABLE_AUTO_DEPOSIT_LISTENER = process.env.ENABLE_AUTO_DEPOSIT_LISTENER === 'true'

function sharedDepositAddress() {
  return String(
    process.env.SHARED_DOGE_DEPOSIT_ADDRESS || process.env.EXCESSION_DOGE_DEPOSIT_ADDRESS || ''
  ).trim()
}

/** Address shown to user / admin list (shared desk or per-user wallet). */
function resolveDepositAddress(user) {
  if (ENABLE_PER_USER_DODGE_WALLET) {
    return getDepositAddress(user) || ''
  }
  return sharedDepositAddress()
}

/** USD book minimum — pending + new deposit credits must reach this to activate principal. */
const MIN_ACTIVATION_USD = 100_000
/** @deprecated alias — book units are USD, not DOGE */
const MIN_PRINCIPAL_DEPOSIT_USDT = MIN_ACTIVATION_USD

module.exports = {
  ENABLE_PER_USER_DODGE_WALLET,
  ENABLE_AUTO_DEPOSIT_LISTENER,
  sharedDepositAddress,
  resolveDepositAddress,
  MIN_ACTIVATION_USD,
  MIN_PRINCIPAL_DEPOSIT_USDT,
}
