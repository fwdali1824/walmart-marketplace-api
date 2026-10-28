const { loadCatalog, hasAuth, setCorsHeaders } = require('../_lib/catalog');

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

  const { limit = '200' } = req.query;
  const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 200, 1), 500);

  const { returns } = loadCatalog();
  const slice = returns.slice(0, parsedLimit);

  res.status(200).json({
    returns: slice,
  });
}

module.exports = { default: handler };