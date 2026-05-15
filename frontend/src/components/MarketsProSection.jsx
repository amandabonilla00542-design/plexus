import { TradingPane } from '../components/TradingPane'
import './MarketsProSection.css'

export function MarketsProSection() {
  return (
    <section className="markets-pro section-block" id="markets-terminal">
      <div className="container">
        <header className="markets-pro__intro">
          <p className="section-eyebrow">Terminal-grade charts · simulated data</p>
          <h2 className="section-title">Crypto & FX workspace preview</h2>
          <p className="section-lead">
            Live feeds plug in on your schedule — this surface mirrors institutional terminals: OHLC tape, candlesticks,
            volume histogram, trend filter (EMA 21), momentum (RSI 14), and MACD-style histogram — all running on
            deterministic mock series so the UI stays stable while you wire APIs.
          </p>
        </header>

        <div className="markets-pro__grid">
          <TradingPane
            symbol="BTC / USD"
            seed={90211}
            startPrice={61240}
            volatility={1.15}
            variant="crypto"
          />
          <TradingPane
            symbol="EUR / USD"
            seed={44107}
            startPrice={1.08412}
            volatility={0.85}
            variant="forex"
          />
        </div>

        <div className="markets-pro__ribbon" aria-label="Instrument highlights">
          <div className="markets-pro__chip">
            <span className="markets-pro__chip-label">ETH / USD</span>
            <span className="markets-pro__chip-value numeric is-up">+0.62%</span>
            <span className="markets-pro__chip-hint">simulated</span>
          </div>
          <div className="markets-pro__chip">
            <span className="markets-pro__chip-label">SOL / USD</span>
            <span className="markets-pro__chip-value numeric is-up">+1.08%</span>
            <span className="markets-pro__chip-hint">simulated</span>
          </div>
          <div className="markets-pro__chip">
            <span className="markets-pro__chip-label">XAU / USD</span>
            <span className="markets-pro__chip-value numeric is-down">−0.14%</span>
            <span className="markets-pro__chip-hint">simulated</span>
          </div>
          <div className="markets-pro__chip">
            <span className="markets-pro__chip-label">GBP / USD</span>
            <span className="markets-pro__chip-value numeric is-up">+0.09%</span>
            <span className="markets-pro__chip-hint">simulated</span>
          </div>
        </div>
      </div>
    </section>
  )
}
