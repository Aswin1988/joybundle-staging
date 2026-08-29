function toNonNegativeBigInt(value, label) {
  let parsed;
  try { parsed = typeof value === 'bigint' ? value : BigInt(value); } catch { throw new TypeError(`${label} must be an integer amount in paise`); }
  if (parsed < 0n) throw new RangeError(`${label} cannot be negative`);
  return parsed;
}

export function parseRupeeInputToPaise(value, label = 'amount') {
  const text = String(value ?? '').trim().replace(/^₹\s*/, '').replace(/,/g, '');
  if (!/^\d+(?:\.\d{1,2})?$/.test(text)) throw new TypeError(`${label} must be a rupee amount with up to two decimal places`);
  const [rupees, paise = ''] = text.split('.');
  return BigInt(rupees) * 100n + BigInt(paise.padEnd(2, '0') || '0');
}

export function formatINR(paise) {
  const amount = toNonNegativeBigInt(paise, 'paise');
  const rupees = amount / 100n;
  const cents = String(amount % 100n).padStart(2, '0');
  const grouped = rupees.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `₹${grouped}.${cents}`;
}

export function multiplyUnitPrice(unitPricePaise, quantity) {
  const unit = toNonNegativeBigInt(unitPricePaise, 'unitPricePaise');
  if (!Number.isInteger(quantity) || quantity < 0) throw new RangeError('quantity must be a non-negative integer');
  return unit * BigInt(quantity);
}

export function calculateContribution(revenuePaise, costPaise) {
  return toNonNegativeBigInt(revenuePaise, 'revenuePaise') - toNonNegativeBigInt(costPaise, 'costPaise');
}

export function calculateMarginBasisPoints(revenuePaise, costPaise) {
  const revenue = toNonNegativeBigInt(revenuePaise, 'revenuePaise');
  const cost = toNonNegativeBigInt(costPaise, 'costPaise');
  if (revenue === 0n) throw new RangeError('revenuePaise must be greater than zero');
  return ((revenue - cost) * 10000n) / revenue;
}
