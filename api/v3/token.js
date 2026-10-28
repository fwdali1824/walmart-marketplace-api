/**
 * Walmart Marketplace OAuth token endpoint (local mock).
 *
 * Client credentials: HTTP Basic (client_id:client_secret) — same as production
 * and TrackIQ's WalmartAuthenticator. Body client_id / client_secret still work
 * for manual curl tests.
 *
 * Seller identity is derived from client_id so ABC vs Acme installs don't collide.
 */
const CLIENTS = {
  wm_abc_9be57d5d7f48fd9a169d8848: {
    seller_id: 'abc-computers-001',
    partner_id: 'abc_computers_001',
    seller_name: 'ABC Computers Inc',
  },
  wm_acme_9be57d5d7f48fd9a169d8848: {
    seller_id: 'acme-electronics-001',
    partner_id: 'acme_electronics_001',
    seller_name: 'Acme Electronics Inc',
  },
  // Legacy / default local client (track-app .env.example)
  wm_9be57d5d7f48fd9a169d8848: {
    seller_id: 'acme-electronics-001',
    partner_id: 'acme_electronics_001',
    seller_name: 'Acme Electronics Inc',
  },
};

function parseBasicAuth(req) {
  const header = req.headers.authorization || req.headers.Authorization || '';
  if (!header.startsWith('Basic ')) {
    return { clientId: null, clientSecret: null };
  }

  try {
    const decoded = Buffer.from(header.slice(6), 'base64').toString('utf8');
    const colon = decoded.indexOf(':');
    if (colon < 0) {
      return { clientId: decoded || null, clientSecret: null };
    }

    return {
      clientId: decoded.slice(0, colon) || null,
      clientSecret: decoded.slice(colon + 1) || null,
    };
  } catch {
    return { clientId: null, clientSecret: null };
  }
}

function sellerFor(clientId) {
  return (
    CLIENTS[clientId] || {
      seller_id: 'seller_001',
      partner_id: clientId || 'unknown',
      seller_name: 'Mock Walmart Seller',
    }
  );
}

function mockAccessToken(seller) {
  return (
    'eyJraWQiOiI1MWY3MzIzN2I5NzQzYjQ2NTkxNzg2OTJiOTZkOTBjMyIsImFsZyI6IlJTMjU2In0.' +
    Buffer.from(
      JSON.stringify({
        sub: seller.seller_id,
        name: seller.seller_name,
        partner_id: seller.partner_id,
        iat: 1609459200,
        exp: 1609545600,
      })
    ).toString('base64url') +
    '.signature_mock'
  );
}

function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    res.writeHead(405, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  let body = '';
  req.on('data', (chunk) => {
    body += chunk.toString();
  });

  req.on('end', () => {
    try {
      const params = new URLSearchParams(body);
      const basic = parseBasicAuth(req);
      const grantType = params.get('grant_type');
      const code = params.get('code');
      const refreshToken = params.get('refresh_token');
      const clientId = params.get('client_id') || basic.clientId;
      const clientSecret = params.get('client_secret') || basic.clientSecret;
      const seller = sellerFor(clientId);

      if (grantType === 'authorization_code') {
        if (!code || !clientId) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            error: 'invalid_request',
            error_description: 'Missing code or client_id',
          }));
          return;
        }

        const newRefreshToken = 'refresh_token_' + Math.random().toString(36).substr(2, 20);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          access_token: mockAccessToken(seller),
          refresh_token: newRefreshToken,
          token_type: 'Bearer',
          expires_in: 86400,
          seller_id: seller.seller_id,
          partner_id: seller.partner_id,
          seller_name: seller.seller_name,
        }));
        return;
      }

      if (grantType === 'refresh_token') {
        if (!refreshToken || !clientId) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            error: 'invalid_request',
            error_description: 'Missing refresh_token or client_id',
          }));
          return;
        }

        const newRefreshToken = 'refresh_token_' + Math.random().toString(36).substr(2, 20);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          access_token: mockAccessToken(seller),
          refresh_token: newRefreshToken,
          token_type: 'Bearer',
          expires_in: 86400,
          seller_id: seller.seller_id,
          partner_id: seller.partner_id,
          seller_name: seller.seller_name,
        }));
        return;
      }

      if (grantType === 'client_credentials') {
        if (!clientId || !clientSecret) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            error: 'invalid_request',
            error_description: 'Missing client_id or client_secret',
          }));
          return;
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          access_token: mockAccessToken(seller),
          token_type: 'Bearer',
          expires_in: 3600,
        }));
        return;
      }

      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        error: 'unsupported_grant_type',
        error_description: 'Grant type not supported: ' + grantType,
      }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        error: 'server_error',
        error_description: err.message,
      }));
    }
  });
}

module.exports = { default: handler };
