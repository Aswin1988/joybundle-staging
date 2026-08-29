import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateCartSubtotal, isMinimumOrderReached, validatePersonalization } from '../../lib/cart.js';

test('calculates cart totals and MOV', () => {
  assert.equal(calculateCartSubtotal([{ unit_price_paise: '14900', quantity: 5 }]), 74500n);
  assert.equal(isMinimumOrderReached(74500n), true);
  assert.equal(isMinimumOrderReached(59600n), false);
});

test('validates optional personalization limits', () => {
  assert.equal(validatePersonalization({ name: 'A', age: '6', message: 'Happy birthday' }), null);
  assert.match(validatePersonalization({ name: 'x'.repeat(51) }), /50/);
  assert.match(validatePersonalization({ age: '0' }), /between 1 and 18/);
  assert.match(validatePersonalization({ message: 'x'.repeat(121) }), /120/);
});
