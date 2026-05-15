/**
 * Dogecoin chain reads via BlockCypher (batched addresses → one poll / few HTTP calls).
 */

const TUNABLES = {
  blockcypherBaseUrl: (process.env.DODGE_CHAIN_API_URL || 'https://api.blockcypher.com/v1/doge/main').replace(
    /\/$/,
    ''
  ),
  blockcypherToken: process.env.DODGE_CHAIN_API_TOKEN || '',
  /** Max txs returned per batched address query (BlockCypher `limit`). */
  txLimit: 50,
}

function effectiveToken() {
  const k = String(TUNABLES.blockcypherToken || '').trim()
  if (!k || k.startsWith('PASTE_')) return ''
  return k
}

function withToken(url) {
  const token = effectiveToken()
  if (!token) return url
  const sep = url.includes('?') ? '&' : '?'
  return `${url}${sep}token=${encodeURIComponent(token)}`
}

async function fetchJson(url) {
  if (typeof fetch !== 'function') throw new Error('Node.js fetch is required (Node 18+)')
  const res = await fetch(withToken(url), { headers: { Accept: 'application/json' } })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`Dodge chain HTTP ${res.status}: ${body.slice(0, 200)}`)
  }
  return res.json()
}

/** Satoshis (1e8) → DOGE float. */
function satoshiToDoge(sat) {
  const n = Number(sat)
  if (!Number.isFinite(n)) return 0
  return n / 1e8
}

/**
 * Incoming DOGE credits for many deposit addresses in **one** BlockCypher call.
 * @param {string[]} addresses
 * @param {number} minTimestampMs — ignore txs confirmed before this
 * @returns {Promise<Array<{ txId: string, toAddress: string, amountDoge: number, confirmedMs: number|null }>>}
 */
async function fetchIncomingDeposits(addresses, minTimestampMs) {
  const list = [...new Set(addresses.map((a) => String(a || '').trim()).filter(Boolean))]
  if (list.length === 0) return []

  const joined = list.map((a) => encodeURIComponent(a)).join('%3B')
  const { blockcypherBaseUrl, txLimit } = TUNABLES
  const url = `${blockcypherBaseUrl}/addrs/${joined}/full?limit=${txLimit}`
  const data = await fetchJson(url)

  const addressSet = new Set(list)
  const out = []
  const txs = Array.isArray(data.txs) ? data.txs : []

  for (const tx of txs) {
    const txId = tx.hash || tx.tx_hash
    if (!txId) continue

    let confirmedMs = null
    if (tx.confirmed) {
      const t = Date.parse(tx.confirmed)
      if (Number.isFinite(t)) confirmedMs = t
    }
    if (confirmedMs != null && confirmedMs < minTimestampMs) continue

    const outputs = Array.isArray(tx.outputs) ? tx.outputs : []
    for (const o of outputs) {
      const addrs = Array.isArray(o.addresses) ? o.addresses : []
      const valueSat = o.value != null ? o.value : 0
      const amountDoge = satoshiToDoge(valueSat)
      if (!(amountDoge > 0)) continue
      for (const a of addrs) {
        if (addressSet.has(a)) {
          out.push({ txId, toAddress: a, amountDoge, confirmedMs })
        }
      }
    }
  }

  return out
}

/** On-chain DOGE balance for dashboard / admin. */
async function dodgeWalletBalance(address) {
  const addr = String(address || '').trim()
  if (!addr) return 0
  const { blockcypherBaseUrl } = TUNABLES
  const url = `${blockcypherBaseUrl}/addrs/${encodeURIComponent(addr)}/balance`
  const data = await fetchJson(url)
  return satoshiToDoge(data.balance != null ? data.balance : 0)
}

module.exports = {
  TUNABLES,
  fetchIncomingDeposits,
  dodgeWalletBalance,
  satoshiToDoge,
  effectiveToken,
}
