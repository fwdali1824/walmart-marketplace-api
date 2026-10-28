# Vendor-Specific Products

This guide explains how vendor-specific products are organized and accessed in the Walmart Marketplace API.

## Overview

Each vendor has its own product catalog:

- **Acme Electronics Inc** - Home Appliances & Electronics
- **ABC Computers Inc** - Computers & IT Equipment

## Product Files

### Location
```
api/products/
├── acme-products.json       # Acme Electronics products
└── abc-products.json        # ABC Computers products
```

## Acme Electronics Inc Products

**Category:** Home Appliances & Electronics

### Products:

1. **Professional Convection Oven** (SKU: ACME-OV-001)
   - Price: $899.99
   - Capacity: 50L
   - Stock: 45 units

2. **Front-Load Washing Machine** (SKU: ACME-WM-002)
   - Price: $749.99
   - Capacity: 5.5 Cu.Ft
   - Stock: 32 units

3. **Side-by-Side Refrigerator** (SKU: ACME-RF-003)
   - Price: $1,299.99
   - Capacity: 25.5 Cu.Ft
   - Stock: 18 units

4. **Built-in Dishwasher** (SKU: ACME-DW-004)
   - Price: $499.99
   - Capacity: 18 place settings
   - Stock: 56 units

5. **Window Air Conditioner** (SKU: ACME-AC-005)
   - Price: $329.99
   - Coverage: 450 sq ft
   - Stock: 72 units

6. **Over-the-Range Microwave** (SKU: ACME-MW-006)
   - Price: $399.99
   - Capacity: 1.6 Cu.Ft
   - Stock: 41 units

7. **Digital Space Heater** (SKU: ACME-HT-007)
   - Price: $79.99
   - Power: 1500W
   - Stock: 128 units

8. **Handheld Vacuum Cleaner** (SKU: ACME-VH-008)
   - Price: $289.99
   - Battery Life: 45 minutes
   - Stock: 64 units

## ABC Computers Inc Products

**Category:** Computers & IT Equipment

### Products:

1. **Desktop Computer - Intel i7** (SKU: ABC-PC-001)
   - Price: $1,599.99
   - Processor: Intel Core i7-13700K
   - Stock: 24 units

2. **Laptop - 15.6 FHD Business** (SKU: ABC-LP-002)
   - Price: $749.99
   - Display: 15.6 FHD
   - Stock: 38 units

3. **27-inch 4K Monitor - IPS** (SKU: ABC-MN-003)
   - Price: $899.99
   - Resolution: 4K
   - Stock: 42 units

4. **Mechanical Keyboard - RGB** (SKU: ABC-KB-004)
   - Price: $199.99
   - Switches: Cherry MX
   - Stock: 87 units

5. **Ergonomic Mouse - Wireless** (SKU: ABC-MS-005)
   - Price: $59.99
   - DPI: 50-3200
   - Stock: 156 units

6. **USB-C Hub - 7-in-1** (SKU: ABC-HB-006)
   - Price: $79.99
   - Ports: 7
   - Stock: 103 units

7. **External SSD - 1TB** (SKU: ABC-HD-007)
   - Price: $129.99
   - Speed: 1050MB/s
   - Stock: 67 units

8. **WiFi 6E Router - Mesh** (SKU: ABC-WR-008)
   - Price: $249.99
   - Coverage: 3000 sq ft
   - Stock: 31 units

9. **Portable Headphones - ANC** (SKU: ABC-HS-009)
   - Price: $379.99
   - Battery: 40 hours
   - Stock: 45 units

10. **Webcam - 4K Pro** (SKU: ABC-WC-010)
    - Price: $189.99
    - Resolution: 4K
    - Stock: 58 units

## API Endpoints

### Get Vendor Products

**Endpoint:** `GET /api/v3/products`

**Query Parameters:**
- `vendor` (required) - Vendor ID: `acme` or `abc`
- `limit` (optional) - Results per page (default: 50)
- `offset` (optional) - Pagination offset (default: 0)

### Examples

#### Get all Acme products
```bash
curl "http://localhost:3000/api/v3/products?vendor=acme"
```

#### Get ABC products with pagination
```bash
curl "http://localhost:3000/api/v3/products?vendor=abc&limit=5&offset=0"
```

#### Get products with specific limit
```bash
curl "http://localhost:3000/api/v3/products?vendor=acme&limit=3"
```

### Response Format

```json
{
  "vendor": {
    "id": "acme",
    "name": "Acme Electronics Inc",
    "sellerId": "acme-electronics-001"
  },
  "category": "Home Appliances & Electronics",
  "pagination": {
    "offset": 0,
    "limit": 50,
    "total": 8,
    "returned": 8
  },
  "products": [
    {
      "sku": "ACME-OV-001",
      "name": "Professional Convection Oven - Stainless Steel",
      "description": "...",
      "category": "Kitchen Appliances",
      "price": {
        "amount": 899.99,
        "currency": "USD"
      },
      "stock": 45,
      "specifications": {
        "capacity": "50L",
        "power": "3600W",
        "material": "Stainless Steel",
        "warranty": "2 years"
      }
    }
    // ... more products
  ]
}
```

## Adding New Products

To add new products for a vendor:

1. Edit the corresponding vendor products file:
   - `api/products/acme-products.json`
   - `api/products/abc-products.json`

2. Add a new product object to the `products` array:
```json
{
  "sku": "ACME-XX-###",
  "name": "Product Name",
  "description": "Product description",
  "category": "Category Name",
  "price": {
    "amount": 999.99,
    "currency": "USD"
  },
  "stock": 50,
  "specifications": {
    "key": "value"
  }
}
```

3. Restart the dev server:
```bash
npm run dev
```

## Best Practices

✅ **DO:**
- Keep products organized by category
- Use unique SKUs per product
- Include detailed specifications
- Maintain realistic stock levels
- Use consistent pricing format

❌ **DON'T:**
- Mix products from different vendors
- Use duplicate SKUs
- Leave required fields empty
- Modify the vendor information

## Testing

Run the dev server and test both vendors:

```bash
# Start server
npm run dev

# In another terminal
# Test Acme products
curl http://localhost:3000/api/v3/products?vendor=acme | jq '.products[] | {sku, name, price}'

# Test ABC products
curl http://localhost:3000/api/v3/products?vendor=abc | jq '.products[] | {sku, name, price}'

# Test pagination
curl http://localhost:3000/api/v3/products?vendor=acme&limit=3&offset=0 | jq '.pagination'
```
