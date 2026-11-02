const { hasAuth, setCorsHeaders } = require('../../../_lib/catalog');
const { availableDates, reconPage } = require('../../../_lib/recon');

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

  const reportDate = String(req.query.reportDate || '').trim();
  if (!reportDate) {
    res.status(400).json({
      title: 'Bad Request',
      status: 400,
      detail: 'reportDate is required',
    });
    return;
  }

  const known = availableDates();
  if (!known.includes(reportDate)) {
    res.status(404).json({
      title: 'Not Found',
      status: 404,
      detail: `No recon file for reportDate=${reportDate}`,
    });
    return;
  }

  const offset = req.query.offset || 0;
  res.status(200).json(reconPage(reportDate, offset, req.headers));
}

module.exports = { default: handler };
