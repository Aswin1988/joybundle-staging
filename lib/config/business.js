export const MIN_ORDER_VALUE_PAISE = 70000n;
export const STANDARD_LEAD_TIME_DAYS = 3;
export const SERVICE_CITY = 'Bangalore';

export const PRICE_BANDS = [
  { slug: 'under-100', label: 'Under ₹100', minPaise: 0n, maxPaise: 9999n },
  { slug: '100-149', label: '₹100–₹149', minPaise: 10000n, maxPaise: 14999n },
  { slug: '150-199', label: '₹150–₹199', minPaise: 15000n, maxPaise: 19999n },
  { slug: '200-249', label: '₹200–₹249', minPaise: 20000n, maxPaise: 24999n },
  { slug: '250-299', label: '₹250–₹299', minPaise: 25000n, maxPaise: 29999n },
  { slug: '300-400', label: '₹300–₹400', minPaise: 30000n, maxPaise: 40000n },
];

export function getPriceBand(slug) {
  return PRICE_BANDS.find((band) => band.slug === slug) || null;
}

export function classifyPriceBand(pricePaise) {
  const amount = BigInt(pricePaise);
  return PRICE_BANDS.find((band) => amount >= band.minPaise && amount <= band.maxPaise) || null;
}
