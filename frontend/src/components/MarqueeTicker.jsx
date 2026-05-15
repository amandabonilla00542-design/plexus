import './MarqueeTicker.css'

const ITEMS = [
  { pair: 'EUR/USD', bid: '1.08412', chg: '+0.08%', up: true },
  { pair: 'GBP/USD', bid: '1.27304', chg: '-0.12%', up: false },
  { pair: 'XAU/USD', bid: '2,342.60', chg: '+0.41%', up: true },
  { pair: 'BTC/USD', bid: '61,240', chg: '+1.05%', up: true },
  { pair: 'US500', bid: '5,014.20', chg: '-0.06%', up: false },
  { pair: 'USD/JPY', bid: '149.82', chg: '+0.03%', up: true },
  { pair: 'WTI', bid: '78.34', chg: '-0.21%', up: false },
]

export function MarqueeTicker() {
  const doubled = [...ITEMS, ...ITEMS]

  return (
    <div className="marquee" aria-label="Market ticker">
      <div className="marquee__fade marquee__fade--left" aria-hidden />
      <div className="marquee__track">
        <div className="marquee__inner">
          {doubled.map((item, i) => (
            <div key={`${item.pair}-${i}`} className="marquee__item">
              <span className="marquee__pair">{item.pair}</span>
              <span className="marquee__bid numeric">{item.bid}</span>
              <span className={`marquee__chg ${item.up ? 'is-up' : 'is-down'}`}>{item.chg}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="marquee__fade marquee__fade--right" aria-hidden />
    </div>
  )
}
