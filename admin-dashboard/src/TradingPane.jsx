import { useEffect, useMemo, useRef } from 'react'
import {
  CandlestickSeries,
  ColorType,
  HistogramSeries,
  LineSeries,
  createChart,
} from 'lightweight-charts'
import {
  emaLine,
  generateOHLC,
  lastQuote,
  rsiChartData,
  rsiSimple,
  volumesFromCandles,
  formatPrice,
} from './lib/mockMarketData'
import './TradingPane.css'

const BAR_COUNT = 160

/**
 * @param {{ symbol: string; seed: number; startPrice: number; volatility?: number; variant?: 'crypto' | 'forex'; theme: 'light' | 'dark' }} props
 */
export function TradingPane({ symbol, seed, startPrice, volatility = 1, variant = 'crypto', theme }) {
  const resolvedTheme = theme === 'dark' ? 'dark' : 'light'
  const mainRef = useRef(null)
  const rsiRef = useRef(null)
  const macdRef = useRef(null)

  const candles = useMemo(
    () => generateOHLC({ bars: BAR_COUNT, seed, startPrice, volatility }),
    [seed, startPrice, volatility],
  )

  const stats = useMemo(() => {
    const closes = candles.map((c) => c.close)
    const rsiVals = rsiSimple(closes, 14)
    const q = lastQuote(candles)
    const rsiLast = rsiVals[rsiVals.length - 1]
    const last = closes[closes.length - 1]
    const prev = closes[closes.length - 5] ?? closes[0]
    const macdHist = ((last - prev) / prev) * 10000
    return {
      quote: q,
      rsi: rsiLast,
      macdHist,
    }
  }, [candles])

  const cryptoTone = variant === 'crypto'

  useEffect(() => {
    const mainEl = mainRef.current
    const rsiEl = rsiRef.current
    const macdEl = macdRef.current
    if (!mainEl || !rsiEl || !macdEl) return

    const isDark = resolvedTheme === 'dark'
    const bg = isDark ? '#0c1424' : '#ffffff'
    const text = isDark ? '#94a3b8' : '#475569'
    const grid = isDark ? '#1e293b' : '#e2e8f0'
    const border = isDark ? '#334155' : '#cbd5e1'

    const up = cryptoTone ? '#089981' : '#2563eb'
    const down = cryptoTone ? '#f23645' : '#dc2626'

    const chartOptions = {
      layout: {
        background: { type: ColorType.Solid, color: bg },
        textColor: text,
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: 11,
      },
      grid: {
        vertLines: { color: grid },
        horzLines: { color: grid },
      },
      crosshair: {
        mode: 1,
        vertLine: { color: border, labelBackgroundColor: isDark ? '#1e293b' : '#64748b' },
        horzLine: { color: border, labelBackgroundColor: isDark ? '#1e293b' : '#64748b' },
      },
      rightPriceScale: {
        borderColor: border,
        scaleMargins: { top: 0.08, bottom: 0.25 },
      },
      timeScale: {
        borderColor: border,
        timeVisible: true,
        secondsVisible: false,
      },
      localization: {
        locale: 'en-US',
      },
    }

    const chartWidth = Math.max(280, mainEl.clientWidth)

    const mainChart = createChart(mainEl, {
      ...chartOptions,
      width: chartWidth,
      height: 300,
    })

    const candleSeries = mainChart.addSeries(CandlestickSeries, {
      upColor: up,
      downColor: down,
      borderVisible: false,
      wickUpColor: up,
      wickDownColor: down,
    })
    candleSeries.setData(candles)

    const volSeries = mainChart.addSeries(HistogramSeries, {
      priceFormat: { type: 'volume' },
      priceScaleId: '',
    })
    volSeries.priceScale().applyOptions({
      scaleMargins: { top: 0.85, bottom: 0 },
    })
    volSeries.setData(volumesFromCandles(candles, cryptoTone))

    const ema = mainChart.addSeries(LineSeries, {
      color: cryptoTone ? '#eab308' : '#60a5fa',
      lineWidth: 2,
      title: 'EMA 21',
    })
    ema.setData(emaLine(candles, 21))

    const rsiChart = createChart(rsiEl, {
      ...chartOptions,
      width: chartWidth,
      height: 84,
      rightPriceScale: {
        ...chartOptions.rightPriceScale,
        scaleMargins: { top: 0.1, bottom: 0.1 },
      },
    })

    const rsiSeries = rsiChart.addSeries(LineSeries, {
      color: '#a855f7',
      lineWidth: 1.5,
      title: 'RSI 14',
    })
    const closes = candles.map((c) => c.close)
    rsiSeries.setData(rsiChartData(candles, rsiSimple(closes, 14)))

    const macdChart = createChart(macdEl, {
      ...chartOptions,
      width: chartWidth,
      height: 72,
      rightPriceScale: {
        ...chartOptions.rightPriceScale,
        scaleMargins: { top: 0.15, bottom: 0.15 },
      },
    })

    const hist = candles.map((c, i) => {
      const prev = candles[Math.max(0, i - 1)]
      const raw = (c.close - prev.close) * (cryptoTone ? 1 : 10000)
      const color = raw >= 0 ? 'rgba(34,197,94,0.55)' : 'rgba(239,68,68,0.55)'
      return { time: c.time, value: raw, color }
    })
    const macdHistSeries = macdChart.addSeries(HistogramSeries, {
      priceFormat: { type: 'price', precision: 4, minMove: 0.0001 },
      priceScaleId: '',
    })
    macdHistSeries.setData(hist)

    const syncRange = (range) => {
      if (!range) return
      rsiChart.timeScale().setVisibleLogicalRange(range)
      macdChart.timeScale().setVisibleLogicalRange(range)
    }
    mainChart.timeScale().subscribeVisibleLogicalRangeChange(syncRange)
    syncRange(mainChart.timeScale().getVisibleLogicalRange())

    const ro = new ResizeObserver(() => {
      const w = Math.max(280, mainEl.clientWidth)
      mainChart.resize(w, 300)
      rsiChart.resize(w, 84)
      macdChart.resize(w, 72)
      syncRange(mainChart.timeScale().getVisibleLogicalRange())
    })
    ro.observe(mainEl)

    return () => {
      ro.disconnect()
      mainChart.timeScale().unsubscribeVisibleLogicalRangeChange(syncRange)
      mainChart.remove()
      rsiChart.remove()
      macdChart.remove()
    }
  }, [candles, resolvedTheme, cryptoTone])

  const q = stats.quote

  return (
    <article className={`trading-pane trading-pane--${variant}`}>
      <header className="trading-pane__head">
        <div className="trading-pane__pair">
          <span className="trading-pane__symbol">{symbol}</span>
          <span className="trading-pane__tf">M15 · simulated feed</span>
        </div>
        <div className="trading-pane__ohlc numeric">
          <span>O {formatPrice(symbol, q.o)}</span>
          <span>H {formatPrice(symbol, q.h)}</span>
          <span>L {formatPrice(symbol, q.l)}</span>
          <span>C {formatPrice(symbol, q.c)}</span>
        </div>
      </header>

      <div className="trading-pane__strip">
        <span className={`trading-pane__last numeric ${q.pct >= 0 ? 'is-up' : 'is-down'}`}>
          {formatPrice(symbol, q.last)}{' '}
          <small>
            ({q.pct >= 0 ? '+' : ''}
            {q.pct.toFixed(2)}%)
          </small>
        </span>
        <span className="trading-pane__badge">RSI(14) {stats.rsi.toFixed(1)}</span>
        <span className="trading-pane__badge trading-pane__badge--muted">
          MACD hist <span className="numeric">{stats.macdHist >= 0 ? '+' : ''}{stats.macdHist.toFixed(2)}</span>
        </span>
      </div>

      <div className="trading-pane__charts">
        <div ref={mainRef} className="trading-pane__main-chart" />
        <div className="trading-pane__subgrid">
          <div className="trading-pane__sub-label">RSI</div>
          <div ref={rsiRef} className="trading-pane__rsi-chart" />
        </div>
        <div className="trading-pane__subgrid">
          <div className="trading-pane__sub-label">MACD</div>
          <div ref={macdRef} className="trading-pane__macd-chart" />
        </div>
      </div>

      <footer className="trading-pane__foot">
        <span>Candles · volume · EMA 21</span>
        <span>Indicators · RSI 14 · MACD histogram (mock)</span>
      </footer>
    </article>
  )
}
