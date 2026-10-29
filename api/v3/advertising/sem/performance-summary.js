const {
  loadPerformance,
  brandAds,
  sellerFromHeaders,
  hasAuth,
  setCorsHeaders,
  readJsonBody,
} = require('../../../_lib/ads');

/**
 * POST /v3/advertising/sem/campaigns/performance-summary
 * Used by WalmartAdvertisingApi\Client::semCampaignPerformanceSummary
 *
 * Body (optional): { page, filters, sort } — mock ignores filters, returns fixture.
 */
async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!hasAuth(req.headers)) {
    res.status(401).json({
      title: 'Unauthorized',
      status: 401,
      detail: 'Bearer or WM_SEC.ACCESS_TOKEN required',
    });
    return;
  }

  await readJsonBody(req); // accept body for API parity; fixture is static

  const seller = sellerFromHeaders(req.headers);
  const payload = brandAds(loadPerformance(), seller);

  res.status(200).json(payload);
}

module.exports = { default: handler };
