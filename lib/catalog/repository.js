import { unstable_cache } from 'next/cache';
import { getSheetValues } from '@/lib/google/sheets';
import { DEMO_SHEET_ROWS } from '@/lib/catalog/fixtures';
import { parseCatalogSheets } from '@/lib/catalog/validation';
import { getCatalogDataSource } from '@/lib/catalog/source';

const TABS = ['Products', 'Product_Contents', 'Bag_Options', 'Product_Bag_Options', 'Settings'];

export { getCatalogDataSource } from '@/lib/catalog/source';

function cacheSafeCatalog(catalog) {
  return { ...catalog, products: catalog.products.map((product) => ({ ...product, price_paise: String(product.price_paise), estimated_unit_cost_paise: String(product.estimated_unit_cost_paise) })) };
}

export async function loadCatalogFromSheets(sheetReader = getSheetValues) {
  const rows = await Promise.all(TABS.map(async (tab) => [tab, await sheetReader(tab)]));
  return cacheSafeCatalog(parseCatalogSheets(Object.fromEntries(rows)));
}

const cachedCatalog = unstable_cache(async () => {
  const source = getCatalogDataSource();
  if (source === 'fixture') return cacheSafeCatalog(parseCatalogSheets(DEMO_SHEET_ROWS));
  if (source !== 'google-sheets') throw new Error('Unsupported JoyBundle catalog data source.');
  if (!process.env.GOOGLE_SHEETS_SPREADSHEET_ID || !process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY) throw new Error('JoyBundle Google Sheets configuration is incomplete.');
  return loadCatalogFromSheets();
}, ['joybundle-catalog-v1'], { revalidate: 180, tags: ['joybundle-catalog'] });

export async function getCatalog() { return cachedCatalog(); }
