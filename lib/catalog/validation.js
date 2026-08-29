import { rowsToObjects } from '../google/sheets.js';

export function parseBoolean(value, fallback = false) {
  if (typeof value === 'boolean') return value;
  const normalized = String(value ?? '').trim().toLowerCase();
  if (['true', '1', 'yes', 'y'].includes(normalized)) return true;
  if (['false', '0', 'no', 'n'].includes(normalized)) return false;
  return fallback;
}

export function parsePaise(value, label) {
  if (!/^\d+$/.test(String(value ?? '').trim())) throw new Error(`${label} must be a non-negative integer in paise.`);
  return BigInt(String(value).trim());
}

function safeText(value) { return String(value ?? '').trim(); }

export function parseCatalogSheets(sheetRows) {
  const products = rowsToObjects(sheetRows.Products).map((row, index) => ({
    product_code: safeText(row.product_code), slug: safeText(row.slug), name: safeText(row.name), short_description: safeText(row.short_description), description: safeText(row.description), price_paise: parsePaise(row.price_paise, `Products row ${index + 2} price_paise`), estimated_unit_cost_paise: parsePaise(row.estimated_unit_cost_paise || '0', `Products row ${index + 2} estimated_unit_cost_paise`), active: parseBoolean(row.active), featured: parseBoolean(row.featured), bestseller: parseBoolean(row.bestseller), personalization_enabled: parseBoolean(row.personalization_enabled), primary_image_url: safeText(row.primary_image_url), image_alt: safeText(row.image_alt) || safeText(row.name), seo_title: safeText(row.seo_title), seo_description: safeText(row.seo_description), sort_order: Number.parseInt(row.sort_order || '0', 10) || 0, internal_notes: safeText(row.internal_notes), updated_at: safeText(row.updated_at),
  })).filter((product) => product.product_code && product.slug && product.name && product.active);
  const contents = rowsToObjects(sheetRows.Product_Contents).map((row, index) => ({ product_code: safeText(row.product_code), name: safeText(row.name), description: safeText(row.description), sort_order: Number.parseInt(row.sort_order || String(index), 10) || index, active: parseBoolean(row.active, true) })).filter((item) => item.product_code && item.name && item.active);
  const bags = rowsToObjects(sheetRows.Bag_Options).map((row, index) => ({ bag_code: safeText(row.bag_code), name: safeText(row.name), active: parseBoolean(row.active, true), sort_order: Number.parseInt(row.sort_order || String(index), 10) || index })).filter((item) => item.bag_code && item.name && item.active);
  const associations = rowsToObjects(sheetRows.Product_Bag_Options).map((row, index) => ({ product_code: safeText(row.product_code), bag_code: safeText(row.bag_code), active: parseBoolean(row.active, true), sort_order: Number.parseInt(row.sort_order || String(index), 10) || index })).filter((item) => item.product_code && item.bag_code && item.active);
  const settings = Object.fromEntries(rowsToObjects(sheetRows.Settings).filter((row) => safeText(row.key)).map((row) => [safeText(row.key), safeText(row.value)]));
  return { products, contents, bags, associations, settings };
}
