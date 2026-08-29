import test from 'node:test';
import assert from 'node:assert/strict';
import { createOrder } from '../../lib/orders/service.js';
import { withIdempotency } from '../../lib/orders/idempotency.js';
import { ORDER_STATUSES, ORDER_STATUS_TRANSITIONS, validateOrderStatus } from '../../lib/orders/status.js';
import { buildWhatsAppMessage, buildWhatsAppSupportMessage, normalizeWhatsAppNumber } from '../../lib/orders/whatsapp.js';
import { findPublicOrderByNumber, findTrackableOrder, serializePublicOrder, serializePublicTrackingOrder } from '../../lib/orders/public.js';
import { CUSTOMER_TRACKING_STAGES, getCustomerOrderStatus, getCustomerPaymentStatus } from '../../lib/orders/customer-status.js';

const product = { product_code: 'JB-CF-149', slug: 'creative-fun', name: 'Creative Fun Bundle', price_paise: '14900', personalization_enabled: true, bag_options: [{ bag_code: 'BLUE', name: 'Blue' }] };
const customer = { customer_name: 'Riya', customer_phone: '9876543210', customer_email: '', delivery_address: '1 Main Road', area: 'Indiranagar', pin_code: '560038', party_date: '2099-01-01', preferred_delivery_date: '' };
const deps = (writeOrder = async () => {}) => ({ readProducts: async () => [product], readSettings: async () => ({ MIN_ORDER_VALUE_PAISE: '70000' }), writeOrder, now: () => new Date('2026-08-29T10:00:00.000Z'), makeId: () => 'order-id-1' });

test('recalculates a valid order and writes canonical rows', async () => {
  let rows;
  const result = await createOrder({ customer, items: [{ product_code: 'JB-CF-149', unit_price_paise: '14900', quantity: 5, selected_bag_option: 'BLUE', personalization: { name: 'Sample Child', age: '6', message: 'Sample message' } }] }, deps(async (order, items) => { rows = { order, items }; }));
  assert.equal(result.total_paise, '74500');
  assert.equal('order_id' in result, false);
  assert.match(result.order_number, /^JB-\d{8}-[A-Z0-9]{4}$/);
  assert.equal(rows.order[3], 'RECEIVED');
  assert.equal(rows.order[14], 74500);
  assert.equal(rows.items[0][3], 'creative-fun');
  assert.equal(rows.items[0][5], 14900);
  assert.equal(rows.items[0][7], 74500);
});

test('rejects below MOV, inactive/unknown products, bad bags, and stale prices', async () => {
  await assert.rejects(() => createOrder({ customer, items: [{ product_code: 'JB-CF-149', unit_price_paise: '14900', quantity: 4 }] }, deps()), /minimum order/i);
  await assert.rejects(() => createOrder({ customer, items: [{ product_code: 'missing', quantity: 5 }] }, deps()), /no longer available/i);
  await assert.rejects(() => createOrder({ customer, items: [{ product_code: 'JB-CF-149', unit_price_paise: '14900', quantity: 5, selected_bag_option: 'PINK' }] }, deps()), /bag option/i);
  await assert.rejects(() => createOrder({ customer, items: [{ product_code: 'JB-CF-149', unit_price_paise: '15900', quantity: 5 }] }, deps()), /price changed/i);
});

test('rejects invalid quantity and personalization, and masks write failures', async () => {
  await assert.rejects(() => createOrder({ customer, items: [{ product_code: 'JB-CF-149', quantity: 0 }] }, deps()), /quantity/i);
  await assert.rejects(() => createOrder({ customer, items: [{ product_code: 'JB-CF-149', quantity: 5, personalization: { name: 'x'.repeat(51) } }] }, deps()), /50/i);
  await assert.rejects(() => createOrder({ customer, items: [{ product_code: 'JB-CF-149', quantity: 5 }] }, deps(() => { throw new Error('private Google API detail'); })), (error) => error.status === 503 && /could not save/i.test(error.message) && !error.message.includes('private'));
});

test('returns the same result for duplicate idempotency keys', async () => {
  let writes = 0;
  const first = await withIdempotency('test-key-orders', async () => { writes += 1; return { order_number: 'JB-TEST' }; });
  const second = await withIdempotency('test-key-orders', async () => { writes += 1; return { order_number: 'JB-OTHER' }; });
  assert.deepEqual(second, first);
  assert.equal(writes, 1);
});

test('centralizes the operational status model', () => {
  assert.deepEqual(ORDER_STATUSES, ['RECEIVED', 'CONFIRMED', 'AWAITING_PAYMENT', 'PAID', 'PREPARING', 'READY', 'DISPATCHED', 'DELIVERED', 'CANCELLED']);
  assert.equal(validateOrderStatus('PAID'), 'PAID');
  assert.deepEqual(ORDER_STATUS_TRANSITIONS.RECEIVED, ['CONFIRMED', 'CANCELLED']);
  assert.throws(() => validateOrderStatus('REFUNDED'), /Invalid order status/);
});

test('builds a private-data-free WhatsApp handoff and handles blank numbers', () => {
  const handoff = buildWhatsAppMessage({ whatsappNumber: '+91 98765 43210', order: { order_number: 'JB-20260829-ABCD', customer_name: 'Mia Parent', party_date: '2099-01-01', total_paise: '74500' } });
  assert.equal(normalizeWhatsAppNumber('+91 98765 43210'), '919876543210');
  assert.match(handoff.url, /^https:\/\/wa\.me\/919876543210\?text=/);
  assert.match(decodeURIComponent(handoff.url), /Order: JB-20260829-ABCD/);
  assert.doesNotMatch(decodeURIComponent(handoff.url), /address|personalization|order_id|Test Address/i);
  assert.equal(buildWhatsAppMessage({ whatsappNumber: '', order: handoff }), null);
});

test('order lookup returns only public-safe fields', async () => {
  const result = await findPublicOrderByNumber('JB-TEST-ABCD', async () => [['order_id', 'order_number', 'created_at', 'status', 'customer_phone', 'delivery_address', 'party_date', 'subtotal_paise', 'delivery_charge_paise', 'total_paise', 'payment_status', 'notes'], ['secret-id', 'JB-TEST-ABCD', '2026-08-29T10:00:00Z', 'RECEIVED', '9999999999', 'private address', '2099-01-01', '74500', '0', '74500', 'PENDING', 'private']]);
  assert.equal(result.order_number, 'JB-TEST-ABCD');
  assert.equal('customer_phone' in result, false);
  assert.equal('delivery_address' in result, false);
  assert.equal('order_id' in result, false);
  assert.equal(serializePublicOrder({ order_number: 'JB-1', status: 'INVALID' }), null);
});

test('maps every operational status to a customer-safe status', () => {
  assert.deepEqual(CUSTOMER_TRACKING_STAGES, ['Order Received', 'Order Confirmed', 'Payment Received', 'Preparing', 'Ready', 'Out for Delivery', 'Delivered']);
  const expected = {
    RECEIVED: ['Order request received', "We've received your order request and will check availability shortly."],
    CONFIRMED: ['Order confirmed', 'Your order details have been confirmed.'],
    AWAITING_PAYMENT: ['Waiting for payment', "We've confirmed your final amount. Complete payment using the QR code shared with you."],
    PAID: ['Payment received', 'Your payment has been received.'],
    PREPARING: ["We're preparing your gifts", 'Your JoyBundle gifts are being prepared and personalized.'],
    READY: ['Your gifts are ready', 'Your order has been packed and is ready for delivery.'],
    DISPATCHED: ['Out for delivery', 'Your JoyBundle order is on the way.'],
    DELIVERED: ['Delivered', 'Your JoyBundle order has been delivered.'],
    CANCELLED: ['Order cancelled', 'This order has been cancelled.'],
  };
  for (const status of ORDER_STATUSES) assert.deepEqual([getCustomerOrderStatus(status).title, getCustomerOrderStatus(status).description], expected[status]);
  assert.equal(getCustomerOrderStatus(' preparing ').status, 'PREPARING');
  assert.equal(getCustomerOrderStatus('UNKNOWN'), null);
  assert.equal(getCustomerPaymentStatus('paid'), 'PAID');
  assert.equal(getCustomerPaymentStatus('settled'), 'PENDING');
  const tracking = serializePublicTrackingOrder({ order_number: 'JB-TEST-ABCD', status: 'AWAITING_PAYMENT', created_at: '2026-08-29', party_date: '2099-01-01', subtotal_paise: '74500', total_paise: '74500', payment_status: 'PENDING', customer_phone: 'secret' }, [{ name: 'Bundle', quantity: '5', customer_phone: 'secret' }]);
  assert.equal(tracking.payment_waiting, true);
  assert.equal('customer_phone' in tracking, false);
  for (const field of ['customer_email', 'delivery_address', 'area', 'pin_code', 'personalization_name', 'personalization_age', 'personalization_message', 'order_id', 'notes', 'spreadsheet_id']) assert.equal(field in tracking, false);
});

test('tracks only when both order number and normalized phone match', async () => {
  const reader = async (tab) => tab === 'Orders' ? [['order_number', 'status', 'customer_phone', 'created_at', 'party_date', 'subtotal_paise', 'delivery_charge_paise', 'total_paise', 'payment_status'], ['JB-TEST-TRACK', 'PREPARING', '+91 98765 43210', '2026-08-29', '2099-01-01', '74500', '0', '74500', 'PENDING']] : [['order_number', 'name', 'quantity'], ['JB-TEST-TRACK', 'Bundle', '5']];
  const result = await findTrackableOrder('JB-TEST-TRACK', '9876543210', reader, '9876543210');
  assert.equal(result.status_title, "We're preparing your gifts");
  assert.equal(result.items[0].quantity, 5);
  assert.equal(await findTrackableOrder('JB-TEST-TRACK', '9876543211', reader), null);
  assert.equal(await findTrackableOrder('JB-WRONG', '9876543210', reader), null);
});

test('builds minimal WhatsApp support handoff', () => {
  const handoff = buildWhatsAppSupportMessage({ whatsappNumber: '9876543210', orderNumber: 'JB-TEST-TRACK' });
  assert.match(handoff.url, /^https:\/\/wa\.me\/919876543210\?text=/);
  assert.match(handoff.message, /JB-TEST-TRACK/);
  assert.doesNotMatch(handoff.message, /address|phone|personalization|payment|notes/i);
  assert.equal(buildWhatsAppSupportMessage({ whatsappNumber: '', orderNumber: 'JB-TEST-TRACK' }), null);
});
