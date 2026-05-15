/** On-chain deposit wallet on the Dodge network (Dogecoin). */
function getDepositWallet(user) {
  if (!user) return null
  if (user.dodgeWallet && user.dodgeWallet.address) return user.dodgeWallet
  return null
}

function getDepositAddress(user) {
  const w = getDepositWallet(user)
  return w ? w.address : null
}

module.exports = { getDepositWallet, getDepositAddress }
