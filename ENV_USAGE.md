# Environment Configuration Guide

## Setup Complete! 🎉

Your multi-vendor environment is now configured with separate .env files for each vendor.

## Files Structure

```
marketplace/
├── .env.local              # Main local development
├── .env.acme               # Acme Electronics config
├── .env.abc                # ABC Computers config  
├── .env.production         # Production config
├── .env.example            # Template reference
├── config/
│   ├── env-loader.js       # Loader utility
│   └── vendors.json        # Vendor registry
└── [other files...]
```

## Usage

### 1. Load Local Environment (Default)

```bash
# Default loads .env.local
npm run dev
```

### 2. Load Vendor-Specific Environment

```bash
# Load Acme config
NODE_ENV=acme npm run dev

# Load ABC config
NODE_ENV=abc npm run dev
```

### 3. Load Production Environment

```bash
NODE_ENV=production npm run dev
```

### 4. Using in Code

```javascript
const { loadEnv, getVendorConfig } = require('./config/env-loader');

// Load default (local)
const env = loadEnv('.env.local');
console.log(env.WALMART_BASE_URL);

// Load vendor config
const acmeConfig = getVendorConfig('acme');
console.log(acmeConfig.vendorName);  // "Acme Electronics Inc"
console.log(acmeConfig.sellerId);    // "acme-electronics-001"
```

## Environment Variables

### Core Configuration
- **WALMART_ENV** - Environment type (local, sandbox, production)
- **WALMART_BASE_URL** - API base URL
- **WALMART_CLIENT_ID** - OAuth client ID
- **WALMART_CLIENT_SECRET** - OAuth client secret
- **WALMART_PARTNER_ID** - Partner ID for Walmart

### Vendor-Specific
- **WALMART_SELLER_ID** - Seller ID (unique per vendor)
- **VENDOR_NAME** - Vendor display name
- **VENDOR_COUNTRY** - Vendor country code

### URLs
- **WALMART_APPLICATION_URL** - Your app URL
- **WALMART_REDIRECT_URI** - OAuth redirect URI
- **WALMART_AUTHORIZE_URL** - Authorization endpoint
- **WALMART_SPEC_URL** - API spec endpoint

### Token Management
- **TOKEN_CACHE_TTL** - Token cache time-to-live (900 sec = 15 min)
- **TOKEN_REFRESH_BEFORE_EXPIRY** - Refresh before X seconds
- **CACHE_DRIVER** - Cache driver type (database, memory, etc)

### Features
- **WALMART_INCLUDE_TEST_ORDERS** - Include test orders (true/false)
- **WALMART_FORCE_SDK** - Force SDK mode (true/false)

## Vendor Configuration Files

### .env.acme
```env
WALMART_ENV=local
WALMART_BASE_URL=http://localhost:3000
WALMART_SELLER_ID=acme-electronics-001
VENDOR_NAME=Acme Electronics Inc
...
```

### .env.abc
```env
WALMART_ENV=local
WALMART_BASE_URL=http://localhost:3000
WALMART_SELLER_ID=abc-computers-001
VENDOR_NAME=ABC Computers Inc
...
```

## API Endpoints

### Get All Vendors
```bash
curl http://localhost:3000/api/vendors
```

### Get Vendor-Specific Spec
```bash
curl http://localhost:3000/api/walmart-spec/acme
curl http://localhost:3000/api/walmart-spec/abc
```

### Get Master Spec
```bash
curl http://localhost:3000/api/walmart-spec
```

## Adding New Vendors

1. Create `.env.newvendor` file
2. Add vendor to `config/vendors.json`
3. Run: `jq '{...}' walmart-spec.json > newvendor-spec.json`

## Best Practices

✅ **DO:**
- Keep separate .env files per vendor
- Use .env.example as a template
- Store secrets securely in production
- Use vendor-specific spec URLs

❌ **DON'T:**
- Commit .env files with real credentials
- Share credentials between vendors
- Mix vendor configurations

## For Production

Update `.env.production` with:
- Real Walmart API credentials
- Production URLs
- Real seller IDs
- Production cache driver

Then deploy with:
```bash
NODE_ENV=production npm start
```
