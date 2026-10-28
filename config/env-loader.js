const fs = require('fs');
const path = require('path');

function loadEnv(envFile = '.env.local') {
  const envPath = path.join(process.cwd(), envFile);

  if (!fs.existsSync(envPath)) {
    console.warn(`⚠️  ${envFile} not found, using defaults`);
    return {};
  }

  const content = fs.readFileSync(envPath, 'utf8');
  const env = {};

  content.split('\n').forEach(line => {
    const trimmed = line.trim();

    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith('#')) {
      return;
    }

    const [key, value] = trimmed.split('=');
    if (key) {
      env[key] = value || '';
    }
  });

  return env;
}

function getVendorConfig(vendorId) {
  const envFile = `.env.${vendorId}`;
  const config = loadEnv(envFile);

  return {
    vendorId,
    environment: config.WALMART_ENV || 'local',
    baseUrl: config.WALMART_BASE_URL || 'http://localhost:3000',
    clientId: config.WALMART_CLIENT_ID,
    clientSecret: config.WALMART_CLIENT_SECRET,
    partnerId: config.WALMART_PARTNER_ID,
    sellerId: config.WALMART_SELLER_ID || vendorId,
    vendorName: config.VENDOR_NAME || vendorId,
    vendorCountry: config.VENDOR_COUNTRY || 'US',
    applicationUrl: config.WALMART_APPLICATION_URL,
    redirectUri: config.WALMART_REDIRECT_URI,
    authorizeUrl: config.WALMART_AUTHORIZE_URL,
    specUrl: config.WALMART_SPEC_URL,
    tokenCacheTtl: parseInt(config.TOKEN_CACHE_TTL || '900'),
    tokenRefreshBeforeExpiry: parseInt(config.TOKEN_REFRESH_BEFORE_EXPIRY || '120'),
    cacheDriver: config.CACHE_DRIVER || 'database'
  };
}

module.exports = {
  loadEnv,
  getVendorConfig
};
