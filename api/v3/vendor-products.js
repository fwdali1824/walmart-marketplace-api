const fs = require('fs');
const path = require('path');

function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  try {
    // Get vendor from URL or query params
    const url = new URL(req.url || '/', `http://${req.headers.host}`);
    const vendorId = url.searchParams.get('vendor') || req.query?.vendor || 'acme';
    const limit = parseInt(url.searchParams.get('limit') || req.query?.limit || '50');
    const offset = parseInt(url.searchParams.get('offset') || req.query?.offset || '0');

    // Load vendor-specific products
    const productsPath = path.join(process.cwd(), `api/products/${vendorId}-products.json`);

    if (!fs.existsSync(productsPath)) {
      return res.status(404).json({
        error: 'Vendor not found',
        vendor: vendorId,
        availableVendors: ['acme', 'abc']
      });
    }

    const vendorData = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
    const allProducts = vendorData.products || [];

    // Apply pagination
    const paginatedProducts = allProducts.slice(offset, offset + limit);

    // Build response
    const response = {
      vendor: vendorData.vendor,
      category: vendorData.category,
      pagination: {
        offset,
        limit,
        total: allProducts.length,
        returned: paginatedProducts.length
      },
      products: paginatedProducts
    };

    res.status(200).end(JSON.stringify(response, null, 2));
  } catch (err) {
    console.error('Error:', err.message);
    res.status(500).json({
      error: 'Internal server error',
      message: err.message
    });
  }
}

module.exports = { default: handler };
