const fs = require('fs');
const path = require('path');

let catalog = null;

function loadCatalog() {
  if (catalog) return catalog;

  try {
    const specPath = path.join(process.cwd(), 'walmart-spec.json');
    const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));

    const itemsEx =
      spec.paths?.['/v3/items']?.get?.responses?.['200']?.content?.['application/json']?.example;
    const ordersEx =
      spec.paths?.['/v3/orders']?.get?.responses?.['200']?.content?.['application/json']?.example;
    const returnsEx =
      spec.paths?.['/v3/returns']?.get?.responses?.['200']?.content?.['application/json']?.example;

    catalog = {
      items: Array.isArray(itemsEx?.ItemResponse) ? itemsEx.ItemResponse : [],
      orders: Array.isArray(ordersEx?.list?.elements?.order) ? ordersEx.list.elements.order : [],
      returns: Array.isArray(returnsEx?.returns) ? returnsEx.returns : [],
    };

    console.log(
      `📦 Catalog loaded: ${catalog.items.length} items, ${catalog.orders.length} orders, ${catalog.returns.length} returns`
    );
  } catch (err) {
    console.error('Failed to load catalog:', err.message);
    catalog = { items: [], orders: [], returns: [] };
  }

  return catalog;
}

function parseMs(value) {
  if (value == null || value === '') return null;
  if (typeof value === 'number') return value;
  const n = Number(value);
  if (!Number.isNaN(n) && String(value).trim() !== '') return n;
  const t = Date.parse(String(value));
  return Number.isNaN(t) ? null : t;
}

function hasAuth(headers) {
  const auth = headers['authorization'];
  const token = headers['wm_sec.access_token'];
  return Boolean((auth && String(auth).length > 7) || (token && String(token).length > 0));
}

function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, WM_SVC.NAME, WM_QOS.CORRELATION_ID, WM_SEC.ACCESS_TOKEN'
  );
}

module.exports = {
  loadCatalog,
  parseMs,
  hasAuth,
  setCorsHeaders,
};
