import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('catalog migrations contain the required tables and public cost boundary', async () => {
  const foundation = await readFile(new URL('../../supabase/migrations/202608190001_catalog_foundation.sql', import.meta.url), 'utf8');
  const admin = await readFile(new URL('../../supabase/migrations/202608190002_admin_product_management.sql', import.meta.url), 'utf8');
  for (const table of ['products', 'product_images', 'bag_options', 'product_bag_options']) assert.match(foundation, new RegExp(`CREATE TABLE IF NOT EXISTS public\\.${table}`));
  assert.match(admin, /CREATE TABLE IF NOT EXISTS public\.admin_users/);
  assert.match(admin, /CREATE TABLE IF NOT EXISTS public\.product_contents/);
  assert.match(foundation, /estimated_unit_cost_paise BIGINT NOT NULL CHECK \(estimated_unit_cost_paise >= 0\)/);
  assert.doesNotMatch(foundation.match(/GRANT SELECT \([^;]+\) ON public\.products TO anon, authenticated;/)?.[0] || '', /estimated_unit_cost_paise/);
});
