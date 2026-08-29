import { getPriceBand } from '@/lib/config/business';
import { getCatalog } from '@/lib/catalog/repository';
import { serializePublicProduct } from '@/lib/catalog/public-safe';

function settingsWithDefaults(settings = {}) {
  return { MIN_ORDER_VALUE_PAISE: '70000', STANDARD_LEAD_TIME_DAYS: '3', SERVICE_CITY: 'Bangalore', DELIVERY_CHARGE_NOTE: 'Delivery charges are calculated separately.', RUSH_ORDER_NOTE: 'Rush orders are subject to availability.', WHATSAPP_NUMBER: '', BUSINESS_NAME: 'JoyBundle', ...settings };
}

function publicProducts(catalog) {
  const contentsByCode = new Map();
  catalog.contents.forEach((item) => { if (!contentsByCode.has(item.product_code)) contentsByCode.set(item.product_code, []); contentsByCode.get(item.product_code).push(item); });
  const bagsByCode = new Map();
  catalog.associations.forEach((association) => {
    const bag = catalog.bags.find((candidate) => candidate.bag_code === association.bag_code);
    if (!bag) return;
    if (!bagsByCode.has(association.product_code)) bagsByCode.set(association.product_code, []);
    bagsByCode.get(association.product_code).push({ product_code: association.product_code, bag_code: bag.bag_code, name: bag.name, sort_order: association.sort_order });
  });
  return catalog.products.map((product) => serializePublicProduct({ ...product, contents: (contentsByCode.get(product.product_code) || []).sort((a, b) => a.sort_order - b.sort_order), bag_options: (bagsByCode.get(product.product_code) || []).sort((a, b) => a.sort_order - b.sort_order) }));
}

export { serializePublicProduct } from '@/lib/catalog/public-safe';
export { settingsWithDefaults };

export async function getPublicProducts({ bandSlug } = {}) {
  const products = publicProducts(await getCatalog());
  if (!bandSlug) return products.sort((a, b) => BigInt(a.price_paise) < BigInt(b.price_paise) ? -1 : 1);
  const band = getPriceBand(bandSlug);
  if (!band) return [];
  return products.filter((product) => BigInt(product.price_paise) >= band.minPaise && BigInt(product.price_paise) <= band.maxPaise);
}

export async function getPublicProductBySlug(slug) { return (await getPublicProducts()).find((product) => product.slug === slug) || null; }
export async function getSettings() { return settingsWithDefaults((await getCatalog()).settings); }
