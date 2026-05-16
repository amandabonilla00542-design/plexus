const { getDogeUsdRateSnapshot, bookUsdToDoge } = require('../lib/dogeUsdRate')

async function getDogeUsd(req, res) {
  try {
    const fx = await getDogeUsdRateSnapshot()
    return res.json({
      ok: true,
      dogeUsd: fx.dogeUsd,
      source: fx.source,
      updatedAt: fx.updatedAt,
      minActivationUsd: fx.minActivationUsd,
      minActivationDogeApprox: bookUsdToDoge(fx.minActivationUsd, fx.dogeUsd),
    })
  } catch (err) {
    console.error('[fx] getDogeUsd', err)
    return res.status(500).json({ message: 'Could not load exchange rate.' })
  }
}

module.exports = { getDogeUsd }
