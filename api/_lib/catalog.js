const fs = require('fs');
const path = require('path');

/** Shared raw catalog from walmart-spec.json (items/orders/returns). */
let rawCatalog = null;
/** Branded per-seller views — ABC vs Acme must not look identical in TrackIQ. */
const brandedBySeller = new Map();

function loadRawCatalog() {
  if (rawCatalog) return rawCatalog;

  try {
    const specPath = path.join(process.cwd(), 'walmart-spec.json');
    const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));

    const itemsEx =
      spec.paths?.['/v3/items']?.get?.responses?.['200']?.content?.['application/json']?.example;
    const ordersEx =
      spec.paths?.['/v3/orders']?.get?.responses?.['200']?.content?.['application/json']?.example;
    const returnsEx =
      spec.paths?.['/v3/returns']?.get?.responses?.['200']?.content?.['application/json']?.example;

    rawCatalog = {
      items: Array.isArray(itemsEx?.ItemResponse) ? itemsEx.ItemResponse : [],
      orders: Array.isArray(ordersEx?.list?.elements?.order) ? ordersEx.list.elements.order : [],
      returns: Array.isArray(returnsEx?.returns) ? returnsEx.returns : [],
    };

    console.log(
      `📦 Catalog loaded: ${rawCatalog.items.length} items, ${rawCatalog.orders.length} orders, ${rawCatalog.returns.length} returns`
    );
  } catch (err) {
    console.error('Failed to load catalog:', err.message);
    rawCatalog = { items: [], orders: [], returns: [] };
  }

  return rawCatalog;
}

/**
 * Decode mock JWT payload (middle segment) from Bearer / WM_SEC token.
 * Production tokens are opaque; our mock embeds seller identity for routing.
 */
function sellerFromHeaders(headers = {}) {
  const auth = headers['authorization'] || headers['Authorization'] || '';
  const wm = headers['wm_sec.access_token'] || headers['WM_SEC.ACCESS_TOKEN'] || '';
  const token = (auth.startsWith('Bearer ') ? auth.slice(7) : auth) || wm;
  if (!token || typeof token !== 'string') {
    return { seller_id: 'unknown', seller_name: 'Mock Seller', tag: 'Seller', vendor_id: 'unknown' };
  }

  try {
    const parts = token.split('.');
    if (parts.length >= 2) {
      const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
      const seller_id = String(payload.sub || '');
      const seller_name = String(payload.name || seller_id || 'Mock Seller');
      let tag = 'Seller';
      let vendor_id = 'unknown';
      if (seller_id.includes('abc') || /abc/i.test(seller_name)) {
        tag = 'ABC';
        vendor_id = 'abc';
      }
      else if (seller_id.includes('acme') || /acme/i.test(seller_name)) {
        tag = 'Acme';
        vendor_id = 'acme';
      }
      return { seller_id, seller_name, partner_id: payload.partner_id, tag, vendor_id };
    }
  } catch {
    /* fall through */
  }

  return { seller_id: 'unknown', seller_name: 'Mock Seller', tag: 'Seller', vendor_id: 'unknown' };
}

function brandForSeller(seller) {
  const key = seller.seller_id || seller.tag;
  if (brandedBySeller.has(key)) return brandedBySeller.get(key);

  const raw = loadRawCatalog();
  const tag = seller.tag || 'Seller';
  const vendor = seller.seller_name || tag;

  // Always brand the full /v3/items catalog (walmart-spec). Do NOT swap in
  // api/products/{vendor}-products.json here — that file is a tiny demo for
  // GET /api/v3/products?vendor= and has no `wpid`, which makes TrackIQ's
  // SyncWalmartProductsJob skip every row and then wipe the catalogue.
  const items = raw.items.map((item) => {
    const name = item.productName || item.title || item.sku || 'Item';
    const branded = name.startsWith(`[${tag}]`) ? name : `[${tag}] ${name}`;
    const wpid = item.wpid || item.wpId || item.sku || null;
    return {
      ...item,
      wpid,
      productName: branded,
      title: branded,
      vendor,
      brand: tag,
    };
  });

  const catalog = {
    items,
    orders: raw.orders.map((order, idx) => {
      const po = String(order.purchaseOrderId || order.customerOrderId || idx + 1);
      // Distinct PO / customer ids per seller so TrackIQ rows don't collide visually.
      const prefix = tag === 'ABC' ? 'A' : tag === 'Acme' ? 'M' : 'S';
      return {
        ...order,
        purchaseOrderId: `${prefix}${po}`,
        customerOrderId: `${tag}-${order.customerOrderId || po}`,
      };
    }),
    returns: raw.returns.map((ret) => {
      const po = String(ret.purchaseOrderId || '');
      const prefix = tag === 'ABC' ? 'A' : tag === 'Acme' ? 'M' : 'S';
      return po
        ? { ...ret, purchaseOrderId: po.startsWith(prefix) ? po : `${prefix}${po}` }
        : ret;
    }),
  };

  brandedBySeller.set(key, catalog);
  console.log(`🏷️  Catalog branded for ${vendor} (${tag}): ${catalog.items.length} items`);
  return catalog;
}

/** Prefer this: seller-scoped catalog from the request's access token. */
function loadCatalog(headers) {
  if (headers && typeof headers === 'object' && !Array.isArray(headers)) {
    return brandForSeller(sellerFromHeaders(headers));
  }
  // Legacy callers with no headers — unbranded raw (health checks, etc.)
  return loadRawCatalog();
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
  loadRawCatalog,
  sellerFromHeaders,
  parseMs,
  hasAuth,
  setCorsHeaders,
};
