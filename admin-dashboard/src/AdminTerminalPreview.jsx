import { TradingPane } from './TradingPane'
import './AdminTerminalPreview.css'

/**
 * Same terminal layout as the main site Markets section: dual panes + ribbon (simulated OHLC).
 * @param {{ theme: 'light' | 'dark' }} props
 */
export function AdminTerminalPreview({ theme }) {
  return (
    <section className="admin-terminal" aria-label="Terminal preview">
      <header className="admin-terminal__intro">
        <p className="section-label" style={{ marginBottom: 8 }}>
          Terminal-grade charts · simulated data
        </p>
        <h2 className="admin-terminal__title">Crypto &amp; FX workspace</h2>
        <p className="admin-terminal__lead text-muted">
          OHLC, candlesticks, volume, EMA 21, RSI 14, and MACD-style histogram — deterministic mock series (same stack as
          the public Markets preview).
        </p>
      </header>

      <div className="admin-terminal__grid">
        <TradingPane
          symbol="BTC / USD"
          seed={90211}
          startPrice={61240}
          volatility={1.15}
          variant="crypto"
          theme={theme}
        />
        <TradingPane
          symbol="EUR / USD"
          seed={44107}
          startPrice={1.08412}
          volatility={0.85}
          variant="forex"
          theme={theme}
        />
      </div>

      <div className="admin-terminal__ribbon" aria-label="Instrument highlights">
        <div className="admin-terminal__chip">
          <span className="admin-terminal__chip-label">ETH / USD</span>
          <span className="admin-terminal__chip-value numeric is-up">+0.62%</span>
          <span className="admin-terminal__chip-hint">simulated</span>
        </div>
        <div className="admin-terminal__chip">
          <span className="admin-terminal__chip-label">SOL / USD</span>
          <span className="admin-terminal__chip-value numeric is-up">+1.08%</span>
          <span className="admin-terminal__chip-hint">simulated</span>
        </div>
        <div className="admin-terminal__chip">
          <span className="admin-terminal__chip-label">XAU / USD</span>
          <span className="admin-terminal__chip-value numeric is-down">−0.14%</span>
          <span className="admin-terminal__chip-hint">simulated</span>
        </div>
        <div className="admin-terminal__chip">
          <span className="admin-terminal__chip-label">GBP / USD</span>
          <span className="admin-terminal__chip-value numeric is-up">+0.09%</span>
          <span className="admin-terminal__chip-hint">simulated</span>
        </div>
      </div>
    </section>
  )
}
