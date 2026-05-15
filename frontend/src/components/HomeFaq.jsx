import './HomeFaq.css'

/** Matches backend `MIN_PRINCIPAL_DEPOSIT_USDT` / dashboard activation (1 book unit = 1 DOGE). */
const ACTIVATION_DOGE = '100,000'
const WITHDRAW_MIN_PRINCIPAL_DOGE = '400,000'

const FAQS = [
  {
    q: 'How do I fund my Excession account?',
    a: `Create an account and copy your personal Dogecoin deposit address (it starts with D). Send only native DOGE on the Dogecoin mainnet to that exact address. Each client receives a dedicated wallet at signup; deposits are detected automatically—usually within about 30–60 seconds after the network confirms your transfer.`,
  },
  {
    q: 'Why DOGE and not USDT or wire?',
    a: 'Excession LLC settles client funding in native DOGE on the Dogecoin network—fast, on-chain credits without mixing chains. Your dashboard book tracks DOGE 1:1: one DOGE received equals one book unit credited. Do not send USDT, ETH, BTC, or bank wires to your D address; those cannot be applied to your ledger.',
  },
  {
    q: 'What is the difference between pending and principal?',
    a: `New deposits first sit in pending until your combined pending balance plus any new on-chain deposits reaches ${ACTIVATION_DOGE} DOGE. When you hit that threshold, the full amount moves to principal (settled balance used for portfolio views and trading-style metrics). Until activation, funds remain visible as pending on your dashboard.`,
  },
  {
    q: 'What is the VIP / access code?',
    a: 'If you were issued a private access code, redeem it on your dashboard before your next deposit. Your next processed DOGE transfer will move pending plus that deposit straight to principal in one step—even below the standard activation minimum. Each code is single-use; after it is consumed, the normal activation rule applies again.',
  },
  {
    q: 'How long do deposits take to post?',
    a: 'After Dogecoin confirms your transaction, our deposit service scans wallets about every 30 seconds. Most credits appear within a minute. If the network is congested, confirmation may take longer on-chain; we credit once the transfer is confirmed and visible to our indexer.',
  },
  {
    q: 'What happens if I send the wrong coin or network?',
    a: 'Transfers must be DOGE on Dogecoin mainnet to your assigned D address only. Sending another asset, token, or chain to that address can result in permanent loss. Excession cannot recover funds sent on the wrong rail—always double-check asset, network, and address in your external wallet before you confirm.',
  },
  {
    q: 'When can I request a withdrawal?',
    a: `Withdrawal rails in the dashboard require settled principal of at least ${WITHDRAW_MIN_PRINCIPAL_DOGE} DOGE (book balance). Below that threshold, the desk keeps you in accumulate-and-earn mode. Exact timing and settlement paths are shown in your workspace when you are eligible.`,
  },
  {
    q: 'How are deposit wallets secured?',
    a: 'Deposit keys are generated at signup and stored encrypted on the server using your platform encryption secret. Only your public deposit address is shown in the app; private keys are used for operational recovery under admin controls—not shared in the client UI.',
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
            Clear answers on DOGE deposits, pending versus principal, and access codes—the same rules you will see
            after login on your dashboard.
          </p>
        </div>
        <div className="home-faq__list">
          {FAQS.map((item) => (
            <details key={item.q} className="home-faq__item">
              <summary className="home-faq__summary">{item.q}</summary>
              <p className="home-faq__answer">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
