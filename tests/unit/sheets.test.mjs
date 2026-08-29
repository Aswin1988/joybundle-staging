import test from 'node:test';
import assert from 'node:assert/strict';
import { DEMO_SHEET_ROWS } from '../../lib/catalog/fixtures.js';
import { parseCatalogSheets } from '../../lib/catalog/validation.js';
import { serializePublicProduct } from '../../lib/catalog/public-safe.js';
import { classifyPriceBand } from '../../lib/config/business.js';
import { getCatalogDataSource } from '../../lib/catalog/source.js';

test('parses demo Sheets rows, orders contents, and associates active bags', () => {
  const catalog = parseCatalogSheets(DEMO_SHEET_ROWS);
  assert.equal(catalog.products[0].price_paise, 14900n);
  assert.deepEqual(catalog.contents.map((item) => item.name), ['Creative/activity kit', 'Birthday gift bag', 'Birthday treats', 'Personalized label']);
  assert.equal(catalog.bags.length, 4);
  assert.equal(catalog.settings.MIN_ORDER_VALUE_PAISE, '70000');
});

test('rejects malformed money rows', () => {
  const rows = { ...DEMO_SHEET_ROWS, Products: DEMO_SHEET_ROWS.Products.map((row) => [...row]) };
  rows.Products[1][5] = '149.00';
  assert.throws(() => parseCatalogSheets(rows), /integer in paise/);
});

test('classifies all price band boundaries', () => {
  assert.equal(classifyPriceBand(9999n).slug, 'under-100');
  assert.equal(classifyPriceBand(10000n).slug, '100-149');
  assert.equal(classifyPriceBand(14999n).slug, '100-149');
  assert.equal(classifyPriceBand(15000n).slug, '150-199');
  assert.equal(classifyPriceBand(39900n).slug, '300-400');
  assert.equal(classifyPriceBand(40000n).slug, '300-400');
  assert.equal(classifyPriceBand(40001n), null);
});

test('public serializer has an explicit allow-list', () => {
  const result = serializePublicProduct({ product_code: 'JB-1', slug: 'one', name: 'One', short_description: 'Short', description: 'Long', price_paise: 14900n, active: true, featured: true, bestseller: false, personalization_enabled: true, primary_image_url: '', image_alt: 'One', estimated_unit_cost_paise: 10500n, internal_notes: 'private', contents: [], bag_options: [] });
  assert.equal(result.estimated_unit_cost_paise, undefined);
  assert.equal(result.internal_notes, undefined);
  assert.equal(result.featured, true);
});

test('catalog source selection is explicit and production fails closed by default', () => {
  assert.equal(getCatalogDataSource({ NODE_ENV: 'test' }), 'fixture');
  assert.equal(getCatalogDataSource({ NODE_ENV: 'test', CATALOG_DATA_SOURCE: 'google-sheets' }), 'google-sheets');
  assert.equal(getCatalogDataSource({ NODE_ENV: 'production' }), 'google-sheets');
});
