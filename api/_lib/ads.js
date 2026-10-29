const fs = require('fs');
const path = require('path');
const { sellerFromHeaders, hasAuth, setCorsHeaders } = require('./catalog');

let campaignsCache = null;
let performanceCache = null;

/**
 * How many SEM campaigns each mock seller returns.
 * ABC stays at the original 6; Acme gets a fuller book (10); others get 8.
 */
const CAMPAIGN_COUNT_BY_TAG = {
  ABC: 6,
  Acme: 10,
  Seller: 8,
};

/** Light traffic scale so shared campaign rows still look store-specific in KPIs. */
const TRAFFIC_SCALE_BY_TAG = {
  ABC: 1.0,
  Acme: 1.35,
  Seller: 0.85,
};

function loadCampaigns() {
  if (campaignsCache) return campaignsCache;
  const file = path.join(process.cwd(), 'api/ads/sem-campaigns.json');
  campaignsCache = JSON.parse(fs.readFileSync(file, 'utf8'));
  return campaignsCache;
}

function loadPerformance() {
  if (performanceCache) return performanceCache;
  const file = path.join(process.cwd(), 'api/ads/sem-performance.json');
  performanceCache = JSON.parse(fs.readFileSync(file, 'utf8'));
  return performanceCache;
}

function campaignLimitFor(seller) {
  const tag = seller?.tag || 'Seller';
  return CAMPAIGN_COUNT_BY_TAG[tag] ?? 8;
}

function trafficScaleFor(seller) {
  const tag = seller?.tag || 'Seller';
  return TRAFFIC_SCALE_BY_TAG[tag] ?? 1;
}

function scaleTraffic(traffic, scale) {
  if (!traffic || typeof traffic !== 'object' || scale === 1) return traffic;
  const out = { ...traffic };
  for (const key of ['adspend', 'gmv', 'clicks', 'impressions', 'cpc']) {
    if (typeof out[key] === 'number') {
      out[key] = Math.round(out[key] * scale * 100) / 100;
    }
  }
  if (out.impressions > 0 && typeof out.clicks === 'number') {
    out.ctr = Math.round((out.clicks / out.impressions) * 10000) / 10000;
  }
  if (out.adspend > 0 && typeof out.gmv === 'number') {
    out.roas = Math.round((out.gmv / out.adspend) * 100) / 100;
  }
  return out;
}

/**
 * Brand campaign ids/names per seller and return a different campaign count
 * per store (ABC=6, Acme=10, …) so TrackIQ ads pages diverge by account.
 */
function brandAds(payload, seller) {
  const tag = seller?.tag || 'Seller';
  const prefix = tag === 'ABC' ? 'A' : tag === 'Acme' ? 'M' : 'S';
  const limit = campaignLimitFor(seller);
  const scale = trafficScaleFor(seller);

  if (Array.isArray(payload.campaigns)) {
    const campaigns = payload.campaigns.slice(0, limit).map((c) => ({
      ...c,
      campaignId: `${prefix}-${c.campaignId}`,
      name: `[${tag}] ${c.name}`,
    }));

    return {
      ...payload,
      campaigns,
      meta: {
        ...(payload.meta || {}),
        totalCount: campaigns.length,
        vendor: tag,
        seller_id: seller?.seller_id || null,
      },
    };
  }

  if (Array.isArray(payload.data)) {
    const data = payload.data.slice(0, limit).map((row) => ({
      ...row,
      campaignId: `${prefix}-${row.campaignId}`,
      name: row.name ? `[${tag}] ${row.name}` : row.name,
      traffic: scaleTraffic(row.traffic, scale),
    }));

    return {
      ...payload,
      data,
      pagination: {
        ...(payload.pagination || {}),
        totalCount: data.length,
        vendor: tag,
      },
    };
  }

  return payload;
}

function readJsonBody(req) {
  return new Promise((resolve) => {
    if (req.body && typeof req.body === 'object') {
      resolve(req.body);
      return;
    }
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
    });
    req.on('end', () => {
      if (!raw) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch {
        resolve({});
      }
    });
  });
}

module.exports = {
  loadCampaigns,
  loadPerformance,
  brandAds,
  campaignLimitFor,
  sellerFromHeaders,
  hasAuth,
  setCorsHeaders,
  readJsonBody,
};
