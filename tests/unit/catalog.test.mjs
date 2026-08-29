import test from 'node:test';
import assert from 'node:assert/strict';
import { getPriceBand } from '../../lib/config/business.js';
import { serializePublicProduct } from '../../lib/catalog/public-safe.js';
import { parseRupeeInputToPaise } from '../../lib/pricing/money.js';
import { sanitizeProductInput } from '../../lib/validation/product.js';

test('converts rupee input to integer paise without floating point arithmetic', () => {
  assert.equal(parseRupeeInputToPaise('199'), 19900n);
  assert.equal(parseRupeeInputToPaise('149.5'), 14950n);
  assert.throws(() => parseRupeeInputToPaise('-1'), /rupee amount/);
  assert.throws(() => parseRupeeInputToPaise('1.999'), /rupee amount/);
});

test('classifies the configured price bands', () => {
  assert.equal(getPriceBand('under-100').maxPaise, 9999n);
  assert.equal(getPriceBand('100-149').minPaise, 10000n);
  assert.equal(getPriceBand('not-a-band'), null);
});

test('validates product input and rejects negative pricing', () => {
  assert.throws(() => sanitizeProductInput({ product_code: 'JB-1', slug: 'bundle', name: 'Bundle', short_description: 'Short', description: 'Description', price_paise: -1, estimated_unit_cost_paise: 1 }), /greater than or equal to 0/);
  assert.throws(() => sanitizeProductInput({ product_code: 'bad code', slug: 'bundle', name: 'Bundle', short_description: 'Short', description: 'Description', price_paise: 100, estimated_unit_cost_paise: 1 }), /Product code/);
});

test('public serialization excludes private economics and admin fields', () => {
  const publicProduct = serializePublicProduct({ id: 'p1', product_code: 'JB-1', slug: 'bundle', name: 'Bundle', short_description: 'Short', description: 'Description', price_paise: '19900', estimated_unit_cost_paise: '14400', active: true, personalization_enabled: true, personalization_schema: {}, seo_title: 'Title', seo_description: 'Description', is_featured: true, is_bestseller: false }, [{ id: 'inactive', name: 'Hidden', sort_order: 0, active: false }, { id: 'active', name: 'Shown', sort_order: 1, active: true }], [], []);
  assert.equal(publicProduct.price_paise, '19900');
  assert.deepEqual(publicProduct.contents.map((item) => item.name), ['Shown']);
  assert.equal('estimated_unit_cost_paise' in publicProduct, false);
  assert.equal('contribution' in publicProduct, false);
  assert.equal('admin_notes' in publicProduct, false);
});
