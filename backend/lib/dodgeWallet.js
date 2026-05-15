const bitcoin = require('bitcoinjs-lib')
const { ECPairFactory } = require('ecpair')
const ecc = require('tiny-secp256k1')
const coininfo = require('coininfo')

const DOGE_NETWORK = coininfo.dogecoin.main.toBitcoinJS()
const ECPair = ECPairFactory(ecc)

/** Create a new Dogecoin P2PKH deposit wallet (D… address). */
function createDodgeWallet() {
  const keyPair = ECPair.makeRandom({ network: DOGE_NETWORK })
  const { address } = bitcoin.payments.p2pkh({
    pubkey: keyPair.publicKey,
    network: DOGE_NETWORK,
  })
  if (!address) throw new Error('Failed to derive Dogecoin address')
  return {
    address,
    privateKeyWif: keyPair.toWIF(),
    publicKey: keyPair.publicKey.toString('hex'),
  }
}

function isLikelyDodgeAddress(addr) {
  const s = String(addr || '').trim()
  return /^D[1-9A-HJ-NP-Za-km-z]{25,34}$/.test(s)
}

module.exports = { createDodgeWallet, isLikelyDodgeAddress, DOGE_NETWORK }
