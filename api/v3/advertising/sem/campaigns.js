const {
  loadCampaigns,
  brandAds,
  sellerFromHeaders,
  hasAuth,
  setCorsHeaders,
} = require('../../../_lib/ads');

/**
 * GET /v3/advertising/sem/campaigns
 * Used by WalmartAdvertisingApi\Client::listSemCampaigns
 */
function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
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

  const seller = sellerFromHeaders(req.headers);
  const payload = brandAds(loadCampaigns(), seller);

  res.status(200).json(payload);
}

module.exports = { default: handler };
