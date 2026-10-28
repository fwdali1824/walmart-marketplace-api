const { loadCatalog, parseMs, hasAuth, setCorsHeaders } = require('../_lib/catalog');

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

  const { limit = '50', offset = '0', lastModifiedStartDate, lastModifiedEndDate, createdStartDate, createdEndDate } = req.query;
  const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 200);
  const parsedOffset = Math.max(parseInt(offset, 10) || 0, 0);

  const start = parseMs(lastModifiedStartDate || createdStartDate);
  const end = parseMs(lastModifiedEndDate || createdEndDate);

  let { orders } = loadCatalog(req.headers);

  if (start != null || end != null) {
    orders = orders.filter((o) => {
      const ts = parseMs(o.lastModifiedDate ?? o.orderDate);
      if (ts == null) return false;
      if (start != null && ts < start) return false;
      if (end != null && ts > end) return false;
      return true;
    });
  }

  const total = orders.length;
  const slice = orders.slice(parsedOffset, parsedOffset + parsedLimit);
  const next = parsedOffset + slice.length;

  res.status(200).json({
    list: {
      meta: {
        totalCount: total,
        limit: parsedLimit,
        nextCursor: next < total ? String(next) : null,
      },
      elements: { order: slice },
    },
  });
}

module.exports = { default: handler };
