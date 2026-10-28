# Environment Variables Setup

## Local Development

Use `.env.local` for local testing:

```bash
WALMART_ENV=local
WALMART_BASE_URL=http://localhost:3000
WALMART_CLIENT_ID=wm_9be57d5d7f48fd9a169d8848
WALMART_CLIENT_SECRET=7Yte51jN6S-21TIxvapImPMtaZIrno8RsdMG7M7q
WALMART_PARTNER_ID=your_partner_id
WALMART_APPLICATION_URL=http://localhost:5173/connections/walmart
WALMART_REDIRECT_URI=http://localhost:5173/connections/register-walmart
WALMART_AUTHORIZE_URL=http://localhost:3000/v3/authorize
WALMART_INCLUDE_TEST_ORDERS=false
WALMART_FORCE_SDK=false
TOKEN_CACHE_TTL=900
TOKEN_REFRESH_BEFORE_EXPIRY=120
CACHE_DRIVER=database
```

## Production (Vercel)

### Option 1: Set in Vercel Dashboard

1. Go to: https://vercel.com/dashboard
2. Select your project: `walmart-marketplace-api`
3. Go to **Settings** → **Environment Variables**
4. Add each variable:

| Key | Value |
|-----|-------|
| `WALMART_ENV` | `production` |
| `WALMART_BASE_URL` | `https://walmart-marketplace-api-64an-git-main-fawad10.vercel.app` |
| `WALMART_CLIENT_ID` | `wm_9be57d5d7f48fd9a169d8848` |
| `WALMART_CLIENT_SECRET` | `7Yte51jN6S-21TIxvapImPMtaZIrno8RsdMG7M7q` |
| `WALMART_PARTNER_ID` | `your_partner_id` |
| `WALMART_APPLICATION_URL` | `https://your-app-domain.com/connections/walmart` |
| `WALMART_REDIRECT_URI` | `https://your-app-domain.com/connections/register-walmart` |
| `WALMART_AUTHORIZE_URL` | `https://walmart-marketplace-api-64an-git-main-fawad10.vercel.app/v3/authorize` |
| `WALMART_INCLUDE_TEST_ORDERS` | `false` |
| `WALMART_FORCE_SDK` | `false` |
| `TOKEN_CACHE_TTL` | `900` |
| `TOKEN_REFRESH_BEFORE_EXPIRY` | `120` |
| `CACHE_DRIVER` | `database` |

### Option 2: Set via vercel.json

Add to `vercel.json`:

```json
{
  "version": 2,
  "name": "walmart-marketplace-api",
  "env": {
    "WALMART_ENV": "production",
    "WALMART_BASE_URL": "https://walmart-marketplace-api-64an-git-main-fawad10.vercel.app",
    "WALMART_CLIENT_ID": "wm_9be57d5d7f48fd9a169d8848",
    "WALMART_CLIENT_SECRET": "7Yte51jN6S-21TIxvapImPMtaZIrno8RsdMG7M7q",
    "WALMART_PARTNER_ID": "your_partner_id",
    "WALMART_APPLICATION_URL": "https://your-app-domain.com/connections/walmart",
    "WALMART_REDIRECT_URI": "https://your-app-domain.com/connections/register-walmart",
    "WALMART_AUTHORIZE_URL": "https://walmart-marketplace-api-64an-git-main-fawad10.vercel.app/v3/authorize",
    "WALMART_INCLUDE_TEST_ORDERS": "false",
    "WALMART_FORCE_SDK": "false",
    "TOKEN_CACHE_TTL": "900",
    "TOKEN_REFRESH_BEFORE_EXPIRY": "120",
    "CACHE_DRIVER": "database"
  }
}
```

## Environment Variables Explained

| Variable | Purpose | Example |
|----------|---------|---------|
| `WALMART_ENV` | Environment (local/production) | `local` or `production` |
| `WALMART_BASE_URL` | API base URL | `http://localhost:3000` or `https://...vercel.app` |
| `WALMART_CLIENT_ID` | OAuth client ID | `wm_9be57d5d7f48fd9a169d8848` |
| `WALMART_CLIENT_SECRET` | OAuth client secret | Secret from Walmart dashboard |
| `WALMART_PARTNER_ID` | Walmart partner ID | From Walmart account |
| `WALMART_APPLICATION_URL` | Your app URL | `http://localhost:5173` |
| `WALMART_REDIRECT_URI` | OAuth redirect URI | `http://localhost:5173/connections/register-walmart` |
| `WALMART_AUTHORIZE_URL` | Authorization endpoint | URL to `/v3/authorize` |
| `WALMART_INCLUDE_TEST_ORDERS` | Include test data | `true` or `false` |
| `WALMART_FORCE_SDK` | Force SDK usage | `true` or `false` |
| `TOKEN_CACHE_TTL` | Cache TTL in seconds | `900` (15 minutes) |
| `TOKEN_REFRESH_BEFORE_EXPIRY` | Refresh before expiry (seconds) | `120` (2 minutes) |
| `CACHE_DRIVER` | Cache driver | `database` or `memory` |

## How to Use in Code

```javascript
// In your Node.js code
const baseUrl = process.env.WALMART_BASE_URL;
const clientId = process.env.WALMART_CLIENT_ID;
const authorizeUrl = process.env.WALMART_AUTHORIZE_URL;

// Example: Build OAuth URL
const authUrl = `${authorizeUrl}?client_id=${clientId}&redirect_uri=${process.env.WALMART_REDIRECT_URI}&response_type=code&state=STATE`;
```

## Testing

### Local
```bash
npm run dev
# Uses .env.local
```

### Production
```bash
# Variables set in Vercel dashboard
# Auto-deployed when you push to GitHub
```

## Secrets Management

⚠️ **Never commit secrets to GitHub!** The `.env` files are in `.gitignore`. For Vercel:

1. Add secrets via Vercel Dashboard (not in vercel.json)
2. Or use Vercel CLI: `vercel env add WALMART_CLIENT_SECRET`
3. Reference them in your code: `process.env.WALMART_CLIENT_SECRET`
