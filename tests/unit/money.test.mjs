import test from 'node:test';
import assert from 'node:assert/strict';
import { MIN_ORDER_VALUE_PAISE } from '../../lib/config/business.js';
import { calculateContribution, calculateMarginBasisPoints, formatINR, multiplyUnitPrice } from '../../lib/pricing/money.js';

test('formats INR amounts without floating point arithmetic', () => {
  assert.equal(formatINR(9900n), '₹99.00');
  assert.equal(formatINR(123456789n), '₹1,234,567.89');
});

test('multiplies unit price by integer quantity', () => assert.equal(multiplyUnitPrice(14900n, 5), 74500n));

test('minimum order threshold is ₹700', () => assert.equal(MIN_ORDER_VALUE_PAISE, 70000n));

test('calculates contribution and margin basis points', () => {
  assert.equal(calculateContribution(10000n, 3500n), 6500n);
  assert.equal(calculateMarginBasisPoints(10000n, 3500n), 6500n);
  assert.equal(calculateMarginBasisPoints(10000n, 12000n), -2000n);
});

test('rejects invalid monetary inputs', () => {
  assert.throws(() => formatINR(-1), /cannot be negative/);
  assert.throws(() => multiplyUnitPrice(100n, -1), /quantity/);
  assert.throws(() => calculateContribution(-1n, 0n), /cannot be negative/);
  assert.throws(() => calculateMarginBasisPoints(0n, 0n), /greater than zero/);
  assert.throws(() => multiplyUnitPrice(1.5, 2), /integer amount/);
});
