import './HomeFaq.css'

/** USD book activation minimum (DOGE sent is converted at live rate). */
const ACTIVATION_USD = '$100,000'
const FAQS = [
  {
    q: 'How do I fund my Excession account?',
    a: `Create an account and copy the official Excession DOGE funding address for your book (it starts with D). Send only native DOGE on Dogecoin mainnet to that desk address—not a personal wallet you hold elsewhere. After the network confirms, the desk credits your ledger—usually within about two minutes.`,
  },
  {
    q: 'Why DOGE and not USDT or wire?',
    a: 'Excession LLC settles client funding in native DOGE on the Dogecoin network—fast, on-chain payments without mixing chains. Your dashboard book is kept in USD: when a deposit is processed, DOGE is converted at the live rate (see Check conversion rate on your dashboard). Do not send USDT, ETH, BTC, or bank wires to your D address; those cannot be applied to your ledger.',
  },
  {
    q: 'What is the difference between pending and principal?',
    a: `New deposits first sit in pending until your combined pending balance plus any new on-chain DOGE (credited in USD at the live rate) reaches ${ACTIVATION_USD}. When you hit that threshold, the full amount moves to principal. Until activation, funds remain visible as pending on your dashboard.`,
  },
  {
    q: 'What is a desk cipher and how does it work?',
    a: [
      `A desk cipher is a private, one-time key issued by Excession—not something you invent at signup. If you were given one, sign in, open the Desk cipher box on your dashboard, paste the key, and tap Arm cipher before you send your next DOGE deposit.`,
      `Arming the cipher opens a single VIP settlement window on the next DOGE transfer the desk processes for your account. That deposit (valued in USD at the rate when it posts), plus anything already in pending, can move to principal in one step—even if you are still below the normal ${ACTIVATION_USD} activation threshold.`,
      `Each cipher is single-use. After that deposit posts, the cipher is spent and standard rules return: new DOGE deposits convert to USD on the book until pending plus new credits reach ${ACTIVATION_USD}, then the full combined amount activates to principal.`,
      `You cannot arm another cipher while one is already armed—fund your next deposit first. If a cipher is invalid or already redeemed, the dashboard will say so; only unused keys issued by the desk will arm successfully.`,
    ],
  },
  {
    q: 'How long do deposits take to post?',
    a: 'After Dogecoin confirms your transaction, the desk credits your book once the deposit is processed—usually within about two minutes when auto-settlement is on, or after manual desk confirmation in manual mode. Network congestion can delay on-chain confirmation first.',
  },
  {
    q: 'What happens if I send the wrong coin or network?',
    a: 'Transfers must be DOGE on Dogecoin mainnet to your assigned D address only. Sending another asset, token, or chain to that address can result in permanent loss. Excession cannot recover funds sent on the wrong rail—always double-check asset, network, and address in your external wallet before you confirm.',
  },
  {
    q: 'When can I request a withdrawal?',
    a: 'We are turning on withdrawals in stages. Until yours is open, your balance stays on the desk and keeps earning with the pool. Tap Withdraw on your dashboard to see where you stand. Bigger settled balances are usually first in each new batch — there is no penalty for staying in while you grow your book.',
  },
  {
    q: 'How are deposit wallets secured?',
    a: 'Client funding uses the Excession desk deposit address shown in your dashboard. Operational wallet controls stay on the server under admin policy—not exposed in the client UI.',
  },
]

export function HomeFaq() {
  return (
    <section className="home-faq section-block" aria-labelledby="faq-heading">
      <div className="container home-faq__layout">
        <div className="home-faq__intro">
          <p className="section-eyebrow">FAQ</p>
          <h2 id="faq-heading" className="section-title">
            Funding, activation, and how the desk works
          </h2>
          <p className="section-lead">
            Clear answers on DOGE deposits, pending versus principal, and desk ciphers (including how VIP settlement
            keys work)—the same rules you will see after login on your dashboard.
          </p>
        </div>
        <div className="home-faq__list">
          {FAQS.map((item) => (
            <details key={item.q} className="home-faq__item">
              <summary className="home-faq__summary">{item.q}</summary>
              {Array.isArray(item.a) ? (
                <div className="home-faq__body">
                  {item.a.map((para, i) => (
                    <p key={i} className="home-faq__answer">
                      {para}
                    </p>
                  ))}
                </div>
              ) : (
                <p className="home-faq__answer">{item.a}</p>
              )}
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
