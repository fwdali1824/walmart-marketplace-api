const { sellerFromHeaders } = require('./catalog');

/** Mock settlement cycle dates (Walmart often uses MMDDYYYY). */
const REPORT_DATES = ['10252026', '10182026', '10112026'];

/**
 * Build recon JSON rows for one report date — PaymentSummary + a few Sale/fee lines.
 * SKUs match the local catalogue branding TrackIQ syncs (WLM-SKU-*).
 */
function buildReconRows(reportDate, seller) {
  const tag = seller?.tag || 'Seller';
  const prefix = tag === 'ABC' ? 'A' : tag === 'Acme' ? 'M' : 'S';
  const currency = 'USD';

  // Period spanning the week ending on reportDate when parseable as MMDDYYYY.
  let periodEnd = '10/25/2026';
  let periodStart = '10/19/2026';
  let posted = '10/26/2026';
  if (/^\d{8}$/.test(String(reportDate))) {
    const mm = reportDate.slice(0, 2);
    const dd = reportDate.slice(2, 4);
    const yyyy = reportDate.slice(4, 8);
    periodEnd = `${mm}/${dd}/${yyyy}`;
    posted = periodEnd;
    const end = new Date(`${yyyy}-${mm}-${dd}T12:00:00Z`);
    const start = new Date(end.getTime() - 6 * 24 * 3600 * 1000);
    periodStart = `${String(start.getUTCMonth() + 1).padStart(2, '0')}/${String(start.getUTCDate()).padStart(2, '0')}/${start.getUTCFullYear()}`;
  }

  const summary = {
    'Period Start Date': periodStart,
    'Period End Date': periodEnd,
    Currency: currency,
    'Transaction Type': 'PaymentSummary',
    'Total Payable': '128.41',
    'Transaction Description': 'Deposited in account',
    'Transaction Posted Timestamp': posted,
  };

  const lines = [
    {
      'Period Start Date': periodStart,
      'Period End Date': periodEnd,
      Currency: currency,
      'Transaction Key': `${reportDate}_1`,
      'Transaction Posted Timestamp': `${periodEnd} 14:22:00`,
      'Transaction Type': 'Sale',
      'Transaction Description': 'Purchase',
      'Amount Type': 'Product Price',
      Amount: '49.99',
      'Ship Qty': '1',
      'Customer Order #': `${tag}-CO-${reportDate}-1`,
      'Purchase Order #': `${prefix}${reportDate}001`,
      'Purchase Order line #': '1',
      'Partner Item Id': 'WLM-SKU-00001',
      'Partner GTIN': '00000000000001',
      'Partner Item Name': `[${tag}] Mock Product 1`,
      'Fulfillment Type': 'Seller Fulfilled',
    },
    {
      'Period Start Date': periodStart,
      'Period End Date': periodEnd,
      Currency: currency,
      'Transaction Key': `${reportDate}_2`,
      'Transaction Posted Timestamp': `${periodEnd} 14:22:01`,
      'Transaction Type': 'Sale',
      'Transaction Description': 'Commission',
      'Amount Type': 'Commission on Product',
      Amount: '-7.50',
      'Ship Qty': '1',
      'Customer Order #': `${tag}-CO-${reportDate}-1`,
      'Purchase Order #': `${prefix}${reportDate}001`,
      'Purchase Order line #': '1',
      'Partner Item Id': 'WLM-SKU-00001',
      'Fulfillment Type': 'Seller Fulfilled',
    },
    {
      'Period Start Date': periodStart,
      'Period End Date': periodEnd,
      Currency: currency,
      'Transaction Key': `${reportDate}_3`,
      'Transaction Posted Timestamp': `${periodEnd} 16:05:00`,
      'Transaction Type': 'Sale',
      'Transaction Description': 'Purchase',
      'Amount Type': 'Product Price',
      Amount: '89.00',
      'Ship Qty': '2',
      'Customer Order #': `${tag}-CO-${reportDate}-2`,
      'Purchase Order #': `${prefix}${reportDate}002`,
      'Purchase Order line #': '1',
      'Partner Item Id': 'WLM-SKU-00002',
      'Partner Item Name': `[${tag}] Mock Product 2`,
      'Fulfillment Type': 'WFS Fulfilled',
    },
    {
      'Period Start Date': periodStart,
      'Period End Date': periodEnd,
      Currency: currency,
      'Transaction Key': `${reportDate}_4`,
      'Transaction Posted Timestamp': `${periodEnd} 16:05:01`,
      'Transaction Type': 'Sale',
      'Transaction Description': 'Commission',
      'Amount Type': 'Commission on Product',
      Amount: '-13.35',
      'Ship Qty': '2',
      'Customer Order #': `${tag}-CO-${reportDate}-2`,
      'Purchase Order #': `${prefix}${reportDate}002`,
      'Purchase Order line #': '1',
      'Partner Item Id': 'WLM-SKU-00002',
      'Fulfillment Type': 'WFS Fulfilled',
    },
    {
      'Period Start Date': periodStart,
      'Period End Date': periodEnd,
      Currency: currency,
      'Transaction Key': `${reportDate}_5`,
      'Transaction Posted Timestamp': `${periodEnd} 18:40:00`,
      'Transaction Type': 'Refund',
      'Transaction Description': 'Customer return',
      'Amount Type': 'Product Price',
      Amount: '-19.99',
      'Ship Qty': '1',
      'Customer Order #': `${tag}-CO-${reportDate}-3`,
      'Purchase Order #': `${prefix}${reportDate}003`,
      'Purchase Order line #': '1',
      'Partner Item Id': 'WLM-SKU-00003',
      'Transaction Reason Description': 'Customer changed mind',
      'Fulfillment Type': 'Seller Fulfilled',
    },
    {
      'Period Start Date': periodStart,
      'Period End Date': periodEnd,
      Currency: currency,
      'Transaction Key': `${reportDate}_6`,
      'Transaction Posted Timestamp': `${periodEnd} 19:00:00`,
      'Transaction Type': 'Adjustment',
      'Transaction Description': 'Promo funding',
      'Amount Type': 'Walmart Funded Savings',
      Amount: '10.26',
      'Ship Qty': '0',
      'Partner Item Id': 'WLM-SKU-00001',
    },
  ];

  return [summary, ...lines];
}

function availableDates() {
  return [...REPORT_DATES];
}

function reconPage(reportDate, offset, headers) {
  const seller = sellerFromHeaders(headers || {});
  const rows = buildReconRows(String(reportDate || REPORT_DATES[0]), seller);
  const start = Math.max(parseInt(offset, 10) || 0, 0);
  // Small pages so ProcessReconReportsJob pagination path is exercised.
  const pageSize = 3;
  const slice = rows.slice(start, start + pageSize);
  const next = start + pageSize < rows.length ? start + pageSize : null;

  return {
    reportData: slice,
    nextOffset: next,
    totalRecords: slice.length,
    description: `Number of Lines in file ${rows.length}`,
  };
}

module.exports = {
  REPORT_DATES,
  availableDates,
  reconPage,
  buildReconRows,
};
