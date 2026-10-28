function handler(req, res) {
  let query = {};

  // Parse query string from URL
  if (req.url && req.url.includes('?')) {
    const queryString = req.url.split('?')[1];
    const params = new URLSearchParams(queryString);
    query = {
      client_id: params.get('client_id'),
      redirect_uri: params.get('redirect_uri'),
      response_type: params.get('response_type'),
      state: params.get('state')
    };
  }

  const { client_id, redirect_uri, response_type, state } = query;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Walmart OAuth Authorization</title>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      margin: 0;
      padding: 20px;
      background: #f5f5f5;
    }
    .container {
      max-width: 500px;
      margin: 100px auto;
      background: white;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    h1 {
      color: #0071ce;
      margin: 0 0 10px 0;
      font-size: 24px;
    }
    .subtitle {
      color: #666;
      margin-bottom: 30px;
      font-size: 14px;
    }
    .info-box {
      background: #f0f0f0;
      padding: 15px;
      border-radius: 4px;
      margin-bottom: 20px;
      font-size: 13px;
      color: #333;
    }
    .info-box strong {
      display: block;
      color: #0071ce;
      margin-bottom: 5px;
    }
    .permissions {
      background: #f9f9f9;
      padding: 15px;
      border-radius: 4px;
      margin-bottom: 30px;
      border-left: 3px solid #0071ce;
    }
    .permissions h3 {
      margin: 0 0 10px 0;
      font-size: 14px;
      color: #333;
    }
    .permissions ul {
      margin: 0;
      padding-left: 20px;
      font-size: 13px;
      color: #666;
    }
    .permissions li {
      margin-bottom: 5px;
    }
    .button-group {
      display: flex;
      gap: 10px;
    }
    button {
      flex: 1;
      padding: 12px;
      border: none;
      border-radius: 4px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .allow-btn {
      background: #0071ce;
      color: white;
    }
    .allow-btn:hover {
      background: #005aa3;
    }
    .deny-btn {
      background: #e0e0e0;
      color: #333;
    }
    .deny-btn:hover {
      background: #d0d0d0;
    }
    .mock-notice {
      background: #fff3cd;
      border: 1px solid #ffc107;
      color: #856404;
      padding: 12px;
      border-radius: 4px;
      margin-top: 20px;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🛒 Walmart Marketplace</h1>
    <p class="subtitle">Authorization Request</p>

    <div class="info-box">
      <strong>Application:</strong>
      ${client_id || 'Unknown Client'}
    </div>

    <div class="permissions">
      <h3>This application requests access to:</h3>
      <ul>
        <li>Read your orders</li>
        <li>Read your inventory</li>
        <li>Manage product listings</li>
        <li>View performance metrics</li>
      </ul>
    </div>

    <form id="authForm" method="POST">
      <input type="hidden" name="client_id" value="${client_id || ''}">
      <input type="hidden" name="redirect_uri" value="${redirect_uri || ''}">
      <input type="hidden" name="response_type" value="${response_type || 'code'}">
      <input type="hidden" name="state" value="${state || ''}">

      <div class="button-group">
        <button type="button" class="allow-btn" onclick="authorize()">
          Allow Access
        </button>
        <button type="button" class="deny-btn" onclick="deny()">
          Deny
        </button>
      </div>
    </form>

    <div class="mock-notice">
      ⚠️ Mock Server Notice: This is a mock authorization page. In production, this would show real Walmart seller credentials.
    </div>
  </div>

  <script>
    function authorize() {
      const form = document.getElementById('authForm');
      const redirectUri = form.querySelector('[name="redirect_uri"]').value;
      const state = form.querySelector('[name="state"]').value;

      // Generate mock auth code
      const authCode = 'mock_code_' + Math.random().toString(36).substr(2, 9);

      if (!redirectUri || redirectUri.trim() === '') {
        alert('Error: No redirect URI provided');
        console.log('Redirect URI:', redirectUri);
        return;
      }

      console.log('Redirecting to:', redirectUri);

      // Redirect with auth code
      const separator = redirectUri.includes('?') ? '&' : '?';
      const finalUrl = redirectUri + separator + 'code=' + authCode + '&state=' + encodeURIComponent(state);
      console.log('Final URL:', finalUrl);
      window.location.href = finalUrl;
    }

    function deny() {
      alert('Authorization denied.');
      history.back();
    }
  </script>
</body>
</html>
  `;

  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(html);
}

module.exports = { default: handler };
