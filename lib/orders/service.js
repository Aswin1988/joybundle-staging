import { randomUUID } from 'node:crypto';
import { calculateCartSubtotal, isMinimumOrderReached, validatePersonalization } from '../cart.js';
import { multiplyUnitPrice } from '../pricing/money.js';
import { checkoutSchema, normalizePhone, orderItemSchema, parseDate } from './validation.js';
import { validateOrderStatus } from './status.js';

const DEFAULT_MOV = 70000n;

function fail(code, message, status = 400, details = {}) { const error = new Error(message); error.code = code; error.status = status; error.details = details; throw error; }

function parseQuantity(value) {
  const quantity = typeof value === 'number' ? value : Number(String(value));
  if (!Number.isSafeInteger(quantity) || quantity < 1) fail('INVALID_QUANTITY', 'Choose a valid quantity.');
  return quantity;
}

function publicError(error) {
  if (error?.status) return error;
  const safe = new Error('We could not save your order right now. Please try again.');
  safe.code = 'ORDER_WRITE_FAILED'; safe.status = 503;
  return safe;
}

export async function createOrder(input, dependencies = {}) {
  const defaults = dependencies.readProducts && dependencies.readSettings && dependencies.writeOrder ? {} : await Promise.all([import('../catalog/public.js'), import('../google/sheets.js')]);
  const readProducts = dependencies.readProducts || defaults[0].getPublicProducts;
  const readSettings = dependencies.readSettings || defaults[0].getSettings;
  const writeOrder = dependencies.writeOrder || defaults[1].appendOrderAndItems;
  const now = dependencies.now || (() => new Date());
  const makeId = dependencies.makeId || randomUUID;
  const parsedCustomer = checkoutSchema.safeParse(input?.customer || {});
  if (!parsedCustomer.success) fail('VALIDATION_ERROR', parsedCustomer.error.issues[0].message, 400, { field: parsedCustomer.error.issues[0].path[0] });
  const customer = { ...parsedCustomer.data, customer_phone: normalizePhone(parsedCustomer.data.customer_phone) };
  parseDate(customer.party_date, 'Party date');
  if (customer.preferred_delivery_date) parseDate(customer.preferred_delivery_date, 'Preferred delivery date');
  const rawItems = Array.isArray(input?.items) ? input.items : [];
  if (!rawItems.length || rawItems.length > 50) fail('INVALID_ITEMS', 'Add at least one item to your order.');
  const itemInputs = rawItems.map((item) => { const parsed = orderItemSchema.safeParse(item); if (!parsed.success) fail('VALIDATION_ERROR', parsed.error.issues[0].message); return parsed.data; });
  const products = await readProducts();
  const productMap = new Map(products.map((product) => [product.product_code, product]));
  const serverItems = itemInputs.map((item) => {
    const product = productMap.get(item.product_code);
    if (!product) fail('PRODUCT_UNAVAILABLE', 'One of the selected bundles is no longer available.', 409);
    const quantity = parseQuantity(item.quantity);
    const bag = item.selected_bag_option || '';
    if (bag && !product.bag_options.some((option) => option.bag_code === bag)) fail('INVALID_BAG_OPTION', 'That bag option is no longer available.', 409);
    const personalization = item.personalization || { name: '', age: '', message: '' };
    if (product.personalization_enabled) { const personalizationError = validatePersonalization(personalization); if (personalizationError) fail('INVALID_PERSONALIZATION', personalizationError); }
    else if (personalization.name || personalization.age || personalization.message) fail('INVALID_PERSONALIZATION', 'Personalization is not available for this bundle.');
    if (item.unit_price_paise !== undefined && item.unit_price_paise !== '' && String(item.unit_price_paise) !== String(product.price_paise)) fail('PRICE_CHANGED', 'A bundle price changed. Please review your cart before submitting.', 409, { product_code: product.product_code });
    return { product, quantity, bag, personalization, lineTotal: multiplyUnitPrice(product.price_paise, quantity) };
  });
  const subtotal = calculateCartSubtotal(serverItems.map(({ product, quantity }) => ({ unit_price_paise: product.price_paise, quantity })));
  const settings = await readSettings();
  let minimum = DEFAULT_MOV; try { minimum = BigInt(settings.MIN_ORDER_VALUE_PAISE || DEFAULT_MOV); } catch { /* safe default */ }
  if (!isMinimumOrderReached(subtotal, minimum)) fail('BELOW_MOV', 'Your order does not meet the minimum order value.', 400, { minimum_order_value_paise: String(minimum) });
  const orderId = makeId();
  const orderNumber = `JB-${now().toISOString().slice(0, 10).replaceAll('-', '')}-${randomUUID().slice(0, 4).toUpperCase()}`;
  const createdAt = now().toISOString();
  const status = validateOrderStatus('RECEIVED');
  const orderRow = [orderId, orderNumber, createdAt, status, customer.customer_name, customer.customer_phone, customer.customer_email, customer.delivery_address, customer.area, customer.pin_code, customer.party_date, customer.preferred_delivery_date, Number(subtotal), 0, Number(subtotal), 'PENDING', ''];
  const itemRows = serverItems.map(({ product, quantity, bag, personalization, lineTotal }) => [orderId, orderNumber, product.product_code, product.slug, product.name, Number(product.price_paise), quantity, Number(lineTotal), bag, personalization.name || '', personalization.age || '', personalization.message || '']);
  try { await writeOrder(orderRow, itemRows); } catch (error) { throw publicError(error); }
  return { order_number: orderNumber, customer_name: customer.customer_name, subtotal_paise: String(subtotal), delivery_charge_paise: '0', total_paise: String(subtotal), payment_status: 'PENDING', party_date: customer.party_date, area: customer.area, pin_code: customer.pin_code, items: serverItems.map(({ product, quantity, lineTotal }) => ({ product_code: product.product_code, name: product.name, quantity, line_total_paise: String(lineTotal) })) };
}
