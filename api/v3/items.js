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

  const { limit = '50', offset = '0' } = req.query;
  const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 200);
  const parsedOffset = Math.max(parseInt(offset, 10) || 0, 0);

  const { items } = loadCatalog();
  const total = items.length;
  const slice = items.slice(parsedOffset, parsedOffset + parsedLimit);
  const next = parsedOffset + slice.length;

  res.status(200).json({
    ItemResponse: slice,
    meta: { totalCount: total, limit: parsedLimit, offset: parsedOffset },
    totalItems: total,
    nextCursor: next < total ? String(next) : null,
  });
}

module.exports = { default: handler };
