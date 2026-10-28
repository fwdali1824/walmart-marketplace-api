const { loadCatalog } = require('./_lib/catalog');

function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const { items, orders, returns } = loadCatalog();

  res.status(200).json({
    status: 'ok',
    service: 'Walmart Marketplace API',
    catalog: {
      items: items.length,
      orders: orders.length,
      returns: returns.length,
    },
  });
}

module.exports = { default: handler };
