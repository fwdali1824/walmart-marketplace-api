# Walmart Marketplace API v3 - Serverless Edition

A serverless mock implementation of the Walmart Marketplace API v3 for Vercel, with 10,000+ test products and orders.

## Features

✅ **Serverless**: Deployed on Vercel  
✅ **40+ Endpoints**: Full Walmart API v3 mock coverage  
✅ **Real Test Data**: 10,000 orders and 10,000 products  
✅ **Pagination**: Built-in limit/offset support  
✅ **Authentication**: Bearer token and WM custom headers  
✅ **CORS Enabled**: Works from any frontend  
✅ **Swagger UI**: Interactive API documentation  

## Endpoints

### Core Endpoints
- `GET /api/v3/items` - Get paginated product catalog
- `GET /api/v3/orders` - Get paginated orders with date filtering
- `GET /api/v3/returns` - Get return requests
- `GET /api/health` - Health check

### OpenAPI & Docs
- `GET /api/walmart-spec` - OpenAPI 3.0 specification
- `GET /` - Swagger UI documentation

## Deployment to Vercel

### Prerequisites
- GitHub account
- Vercel account (free)
- Node.js 20+

### Step 1: Initialize Git
```bash
cd /home/fawad/Desktop/marketplace
git init
git add .
git commit -m "Initial commit: serverless walmart api"
```

### Step 2: Push to GitHub
```bash
git remote add origin https://github.com/YOUR_USERNAME/walmart-marketplace-api.git
git branch -M main
git push -u origin main
```

### Step 3: Deploy to Vercel
1. Go to https://vercel.com
2. Click "New Project"
3. Select your GitHub repository
4. Click "Deploy"
5. Wait 1-2 minutes for deployment

### Step 4: Test Your Deployment
```bash
# Get your Vercel URL from the deployment page, then:

# Test API health
curl https://YOUR_VERCEL_URL.vercel.app/api/health

# Get items (with auth header)
curl -H "Authorization: Bearer test-token" \
  https://YOUR_VERCEL_URL.vercel.app/api/v3/items?limit=10

# Get orders (with auth header)
curl -H "Authorization: Bearer test-token" \
  https://YOUR_VERCEL_URL.vercel.app/api/v3/orders?limit=5
```

## Local Development

### Run Locally
```bash
# Install dependencies (if any)
npm install

# Start the server
npm run dev
```

Server runs on `http://localhost:3000`

### Available Routes
- Swagger UI: `http://localhost:3000`
- API Spec: `http://localhost:3000/walmart-spec.json`
- Items: `http://localhost:3000/v3/items`
- Orders: `http://localhost:3000/v3/orders`

## Authentication

All endpoints require one of:
1. **Bearer Token**: `Authorization: Bearer YOUR_TOKEN`
2. **WM Access Token**: `WM_SEC.ACCESS_TOKEN: YOUR_TOKEN`

Example:
```bash
curl -H "Authorization: Bearer test-token-12345" \
  https://YOUR_VERCEL_URL.vercel.app/api/v3/items
```

## Query Parameters

### /v3/items
- `limit` (1-200, default: 50) - Items per page
- `offset` (default: 0) - Starting position

### /v3/orders
- `limit` (1-200, default: 50) - Orders per page
- `offset` (default: 0) - Starting position
- `createdStartDate` - Filter by creation date (ISO 8601 or epoch ms)
- `createdEndDate` - Filter by creation date
- `lastModifiedStartDate` - Filter by modification date
- `lastModifiedEndDate` - Filter by modification date

### /v3/returns
- `limit` (1-500, default: 200) - Returns per page

## Project Structure

```
marketplace/
├── api/
│   ├── _lib/
│   │   └── catalog.js          # Shared utilities
│   ├── v3/
│   │   ├── items.js            # GET /api/v3/items
│   │   ├── orders.js           # GET /api/v3/orders
│   │   └── returns.js          # GET /api/v3/returns
│   ├── health.js               # GET /api/health
│   └── walmart-spec.js         # GET /api/walmart-spec
├── public/
│   └── index.html              # Swagger UI
├── walmart-spec.json           # OpenAPI specification
├── Orders.json                 # Test order data
├── Products.json               # Test product data
├── vercel.json                 # Vercel configuration
├── package.json                # Dependencies
└── README.md                   # This file
```

## Troubleshooting

### "401 Unauthorized"
Add an Authorization header:
```bash
curl -H "Authorization: Bearer test-token" https://YOUR_URL/api/v3/items
```

### "404 Not Found"
Check that your route is correct:
- `/api/v3/items` (not `/v3/items`)
- `/api/health` (not `/health`)

### Large response takes too long
Vercel has a 10-second timeout. Use pagination:
```bash
curl "https://YOUR_URL/api/v3/items?limit=10&offset=0"
```

## Support

For issues or improvements, create an issue or contact support.

## License

MIT
