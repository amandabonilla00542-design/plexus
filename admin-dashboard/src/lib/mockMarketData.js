/**
 * Deterministic mock OHLC + indicators for demo charts (simulated — not live data).
 */

function pseudoRandom(n) {
  const x = Math.sin(n * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

/**
 * @returns {{ time: number, open: number, high: number, low: number, close: number }[]}
 */
export function generateOHLC({ bars, seed, startPrice, volatility }) {
  const out = []
  let close = startPrice
  const stepSec = 900
  const now = Math.floor(Date.now() / 1000)

  for (let i = bars - 1; i >= 0; i--) {
    const t = now - i * stepSec
    const rnd = pseudoRandom(seed * 7919 + i * 104729)
    const open = close
    const drift = (pseudoRandom(seed + i * 31) - 0.48) * volatility * close * 0.0015
    const noise = (rnd - 0.5) * volatility * close * 0.0022
    close = Math.max(open * 0.985, open + drift + noise)
    const bodyHigh = Math.max(open, close)
    const bodyLow = Math.min(open, close)
    const wickUp = pseudoRandom(seed + i) * volatility * close * 0.001
    const wickDn = pseudoRandom(seed + i + 17) * volatility * close * 0.001
    const high = bodyHigh + wickUp
    const low = Math.max(bodyLow - wickDn, close * 0.998)
    out.push({ time: t, open, high, low, close })
  }
  return out
}

export function volumesFromCandles(candles, cryptoTone) {
  const up = cryptoTone ? 'rgba(8,153,129,0.5)' : 'rgba(37,99,235,0.45)'
  const down = cryptoTone ? 'rgba(242,54,69,0.5)' : 'rgba(220,38,38,0.45)'
  return candles.map((c, i) => {
    const vol = Math.round(
      800000 + Math.abs(c.close - c.open) * 3e6 + pseudoRandom(i * 9973) * 400000,
    )
    const isUp = c.close >= c.open
    return { time: c.time, value: vol, color: isUp ? up : down }
  })
}

export function emaLine(candles, period = 21) {
  const k = 2 / (period + 1)
  const out = []
  let ema = candles[0].close
  for (let i = 0; i < candles.length; i++) {
    const close = candles[i].close
    ema = i === 0 ? close : (close - ema) * k + ema
    out.push({ time: candles[i].time, value: ema })
  }
  return out
}

/** Simple rolling RSI for visualization (not for trading decisions). */
export function rsiSimple(closes, period = 14) {
  const out = []
  for (let i = 0; i < closes.length; i++) {
    if (i < period) {
      out.push(50)
      continue
    }
    let gains = 0
    let losses = 0
    for (let j = 0; j < period; j++) {
      const diff = closes[i - j] - closes[i - j - 1]
      if (diff >= 0) gains += diff
      else losses -= diff
    }
    const avgG = gains / period
    const avgL = losses / period
    const rs = avgL === 0 ? 100 : avgG / avgL
    out.push(100 - 100 / (1 + rs))
  }
  return out
}

export function rsiChartData(candles, rsiValues) {
  return candles.map((c, i) => ({
    time: c.time,
    value: rsiValues[i],
  }))
}

export function lastQuote(candles) {
  const c = candles[candles.length - 1]
  const prev = candles[candles.length - 2]
  const pct = prev ? ((c.close - prev.close) / prev.close) * 100 : 0
  return {
    last: c.close,
    pct,
    o: c.open,
    h: c.high,
    l: c.low,
    c: c.close,
  }
}

export function formatPrice(symbol, v) {
  if (symbol.includes('BTC') || symbol.includes('ETH')) {
    return v.toLocaleString(undefined, { maximumFractionDigits: v > 100 ? 2 : 4 })
  }
  if (symbol.includes('JPY')) {
    return v.toFixed(3)
  }
  return v.toFixed(5)
}
