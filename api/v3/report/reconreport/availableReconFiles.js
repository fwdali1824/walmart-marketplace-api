const { hasAuth, setCorsHeaders } = require('../../../_lib/catalog');
const { availableDates } = require('../../../_lib/recon');

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

  res.status(200).json({
    availableApReportDates: availableDates(),
  });
}

module.exports = { default: handler };
