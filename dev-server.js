#!/usr/bin/env node
/**
 * Local development server for serverless functions
 * Run with: node dev-server.js
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const PORT = 3000;

// Import serverless functions
const items = require('./api/v3/items.js').default;
const orders = require('./api/v3/orders.js').default;
const returns = require('./api/v3/returns.js').default;
const health = require('./api/health.js').default;
const spec = require('./api/walmart-spec.js').default;
const authorize = require('./api/v3/authorize.js').default;
const token = require('./api/v3/token.js').default;

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://localhost:${PORT}`);
  const pathname = url.pathname;

  // Express-style query for serverless handlers (items/orders/returns).
  req.query = Object.fromEntries(url.searchParams.entries());

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, WM_SVC.NAME, WM_QOS.CORRELATION_ID, WM_SEC.ACCESS_TOKEN'
  );

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Wrap res with Express-style methods for serverless functions
  const expressRes = {
    status: function(code) {
      this.statusCode = code;
      return this;
    },
    json: function(data) {
      const payload = JSON.stringify(data);
      res.writeHead(this.statusCode || 200, {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': Buffer.byteLength(payload),
      });
      res.end(payload);
    },
    setHeader: function(key, value) {
      res.setHeader(key, value);
    },
    end: function(data) {
      res.end(data);
    },
    writeHead: function(code, headers) {
      res.writeHead(code, headers);
    },
  };

  // Route requests to appropriate handlers
  try {
    if (pathname === '/' || pathname === '/swagger' || pathname === '/swagger/') {
      const htmlPath = path.join(__dirname, 'public/index.html');
      const html = fs.readFileSync(htmlPath, 'utf8');
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(html);
      return;
    }

    if (pathname === '/api/health') {
      health(req, expressRes);
      return;
    }

    if (pathname === '/api/walmart-spec' || pathname === '/api/walmart-spec.json' || pathname === '/walmart-spec.json') {
      spec(req, expressRes);
      return;
    }

    // TrackIQ uses /v3/* (WALMART_BASE_URL); Vercel-style paths keep /api/v3/*.
    if (pathname === '/api/v3/items' || pathname === '/v3/items') {
      items(req, expressRes);
      return;
    }

    if (pathname === '/api/v3/orders' || pathname === '/v3/orders') {
      orders(req, expressRes);
      return;
    }

    if (pathname === '/api/v3/returns' || pathname === '/v3/returns') {
      returns(req, expressRes);
      return;
    }

    if (pathname === '/v3/authorize' || pathname === '/api/v3/authorize') {
      authorize(req, res);
      return;
    }

    if (pathname === '/v3/token' || pathname === '/api/v3/token') {
      token(req, res);
      return;
    }

    // 404
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found', path: pathname }));
  } catch (err) {
    console.error('Error:', err.message);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Internal server error', message: err.message }));
  }
});

server.listen(PORT, () => {
  console.log('');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║     Walmart Marketplace API - Local Dev Server            ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`📚 Swagger UI:      http://localhost:${PORT}`);
  console.log(`📋 Health Check:    http://localhost:${PORT}/api/health`);
  console.log(`📊 API Spec:        http://localhost:${PORT}/api/walmart-spec`);
  console.log('');
  console.log('📦 Endpoints:');
  console.log(`   GET /api/v3/items?limit=50    (Auth: Bearer token)`);
  console.log(`   GET /api/v3/orders?limit=50   (Auth: Bearer token)`);
  console.log(`   GET /api/v3/returns?limit=200 (Auth: Bearer token)`);
  console.log('');
  console.log('🧪 Test with curl:');
  console.log(`   curl -H "Authorization: Bearer test-token" http://localhost:${PORT}/api/v3/items`);
  console.log('');
  console.log('Press Ctrl+C to stop');
  console.log('');
});

process.on('SIGINT', () => {
  console.log('\n✋ Server stopped');
  process.exit(0);
});
