# Deploy to Vercel - Step by Step

Your project is now **100% serverless** and ready for Vercel! Follow these steps:

## Quick Start (5 minutes)

### 1️⃣ Initialize Git Repository

```bash
cd /home/fawad/Desktop/marketplace
git init
git config user.email "your-email@example.com"
git config user.name "Your Name"
git add .
git commit -m "Convert to serverless: Walmart API for Vercel"
```

### 2️⃣ Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `walmart-marketplace-api`
3. Description: `Walmart Marketplace API v3 - Serverless Mock Server`
4. Make it **Public** (so Vercel can access it)
5. Click **Create repository**

### 3️⃣ Push to GitHub

```bash
git remote add origin https://github.com/YOUR_USERNAME/walmart-marketplace-api.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

### 4️⃣ Deploy to Vercel

**Option A: Automatic (Recommended)**
1. Go to https://vercel.com/new
2. Click "Continue with GitHub"
3. Authorize Vercel to access GitHub
4. Search for `walmart-marketplace-api`
5. Click **Import**
6. Click **Deploy** (no additional config needed!)

**Option B: Vercel CLI**
```bash
npm i -g vercel
cd /home/fawad/Desktop/marketplace
vercel --prod
```

### 5️⃣ Get Your Live URL

After deployment completes, Vercel will show you:
```
✅ Production: https://walmart-marketplace-api-XXXXX.vercel.app
```

Save this URL!

---

## Test Your Deployment

### Health Check
```bash
curl https://YOUR_VERCEL_URL.vercel.app/api/health
```

Expected response:
```json
{
  "status": "ok",
  "service": "Walmart Marketplace API",
  "catalog": {
    "items": 10000,
    "orders": 10000,
    "returns": 50
  }
}
```

### Get Items (with Auth)
```bash
curl -H "Authorization: Bearer test-token" \
  "https://YOUR_VERCEL_URL.vercel.app/api/v3/items?limit=5"
```

### Get Orders (with Auth)
```bash
curl -H "Authorization: Bearer test-token" \
  "https://YOUR_VERCEL_URL.vercel.app/api/v3/orders?limit=5"
```

### View Swagger UI
Open in browser:
```
https://YOUR_VERCEL_URL.vercel.app/
```

---

## Project Structure (What Was Created)

```
marketplace/
├── api/                          # Serverless functions
│   ├── _lib/catalog.js          # Shared logic
│   ├── health.js                # Health endpoint
│   ├── walmart-spec.js          # OpenAPI spec endpoint
│   └── v3/
│       ├── items.js             # Products endpoint
│       ├── orders.js            # Orders endpoint
│       └── returns.js           # Returns endpoint
├── public/
│   └── index.html               # Swagger UI (static)
├── walmart-spec.json            # OpenAPI specification
├── Orders.json                  # Test data (10k orders)
├── Products.json                # Test data (10k products)
├── vercel.json                  # Vercel config
├── package.json                 # Dependencies
├── README.md                    # Documentation
└── .gitignore                   # Git ignore rules
```

---

## API Endpoints (After Deployment)

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/` | GET | ❌ | Swagger UI documentation |
| `/api/health` | GET | ❌ | Health check |
| `/api/walmart-spec` | GET | ❌ | OpenAPI specification |
| `/api/v3/items` | GET | ✅ | Get products (paginated) |
| `/api/v3/orders` | GET | ✅ | Get orders (paginated) |
| `/api/v3/returns` | GET | ✅ | Get returns (paginated) |

**Auth Header Required**: `Authorization: Bearer YOUR_TOKEN`

---

## Examples

### Using cURL

```bash
# Test health
curl https://walmart-marketplace-api-XXXXX.vercel.app/api/health

# Get 10 items with pagination
curl -H "Authorization: Bearer test-token" \
  "https://walmart-marketplace-api-XXXXX.vercel.app/api/v3/items?limit=10&offset=0"

# Get orders created between dates
curl -H "Authorization: Bearer test-token" \
  "https://walmart-marketplace-api-XXXXX.vercel.app/api/v3/orders?createdStartDate=2024-01-01&limit=5"
```

### Using JavaScript/Fetch

```javascript
const token = 'your-bearer-token';
const baseUrl = 'https://walmart-marketplace-api-XXXXX.vercel.app';

// Get items
fetch(`${baseUrl}/api/v3/items?limit=10`, {
  headers: { 'Authorization': `Bearer ${token}` }
})
  .then(r => r.json())
  .then(data => console.log(data));

// Get orders
fetch(`${baseUrl}/api/v3/orders?limit=5`, {
  headers: { 'Authorization': `Bearer ${token}` }
})
  .then(r => r.json())
  .then(data => console.log(data));
```

### Using Python

```python
import requests

token = 'your-bearer-token'
base_url = 'https://walmart-marketplace-api-XXXXX.vercel.app'

headers = {'Authorization': f'Bearer {token}'}

# Get items
response = requests.get(f'{base_url}/api/v3/items?limit=10', headers=headers)
print(response.json())

# Get orders
response = requests.get(f'{base_url}/api/v3/orders?limit=5', headers=headers)
print(response.json())
```

---

## Troubleshooting

### ❌ "401 Unauthorized"
**Fix**: Add `Authorization: Bearer test-token` header

```bash
curl -H "Authorization: Bearer test-token" \
  https://YOUR_VERCEL_URL/api/v3/items
```

### ❌ "404 Not Found"
**Fix**: Check endpoint path - should be `/api/v3/...` not `/v3/...`

```bash
# ✅ Correct
curl https://YOUR_VERCEL_URL/api/v3/items

# ❌ Wrong
curl https://YOUR_VERCEL_URL/v3/items
```

### ❌ "502 Bad Gateway"
**Fix**: Deployment might still be in progress. Wait 1-2 minutes and try again.

### ❌ Vercel won't connect to GitHub
**Fix**: 
1. Go to https://github.com/settings/connections/applications
2. Authorize "Vercel" app
3. Try importing project again

---

## Next Steps

✅ **Done**: Your API is live on Vercel!

Now you can:
1. Share the URL with your team
2. Use it in your frontend app
3. Test endpoints with Swagger UI
4. Deploy updates automatically (git push to main)

---

## Manual Updates

If you want to update the API after deployment:

```bash
# Make changes to files
# Commit changes
git add .
git commit -m "Update API endpoints"

# Push to GitHub
git push origin main

# Vercel auto-deploys! (no additional steps needed)
```

---

## Need Help?

- 📖 Full API docs: `https://YOUR_VERCEL_URL/`
- 🔧 Vercel docs: https://vercel.com/docs
- 💬 Questions? Create an issue on GitHub

**Happy deploying! 🚀**
