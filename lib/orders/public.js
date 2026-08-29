import { getSheetValues } from '../google/sheets.js';
import { normalizeIndianPhone } from './validation.js';
import { getCustomerOrderStatus, getCustomerPaymentStatus } from './customer-status.js';
import { buildWhatsAppSupportMessage } from './whatsapp.js';

export function serializePublicOrder(order) {
  const status = getCustomerOrderStatus(order?.status);
  if (!order || !order.order_number || !status) return null;
  return {
    order_number: String(order.order_number), status: status.status, created_at: String(order.created_at || ''),
    party_date: String(order.party_date || ''), subtotal_paise: String(order.subtotal_paise || '0'),
    delivery_charge_paise: String(order.delivery_charge_paise || '0'), total_paise: String(order.total_paise || '0'),
    payment_status: getCustomerPaymentStatus(order.payment_status),
  };
}

export async function findPublicOrderByNumber(orderNumber, sheetReader = getSheetValues) {
  if (!/^JB-[A-Z0-9-]+$/i.test(String(orderNumber || ''))) return null;
  const rows = await sheetReader('Orders');
  if (!Array.isArray(rows) || !rows.length) return null;
  const headers = rows[0].map((header) => String(header || '').trim());
  const order = rows.slice(1).map((row) => Object.fromEntries(headers.map((header, index) => [header, row[index] ?? '']))).find((row) => row.order_number === orderNumber);
  return serializePublicOrder(order);
}

export function serializePublicTrackingOrder(order, items = [], whatsappNumber = '') {
  const status = getCustomerOrderStatus(order?.status);
  if (!status || !order?.order_number) return null;
  return {
    order_number: String(order.order_number), status: status.status, status_title: status.title, status_description: status.description,
    status_stage: status.stage, payment_waiting: Boolean(status.paymentWaiting), cancelled: Boolean(status.cancelled),
    created_at: String(order.created_at || ''), party_date: String(order.party_date || ''), subtotal_paise: String(order.subtotal_paise || '0'),
    delivery_charge_paise: String(order.delivery_charge_paise || '0'), total_paise: String(order.total_paise || '0'), payment_status: getCustomerPaymentStatus(order.payment_status),
    items: items.map((item) => ({ name: String(item.name || ''), quantity: Number.parseInt(item.quantity, 10) || 0 })).filter((item) => item.name && item.quantity > 0),
    whatsapp_url: buildWhatsAppSupportMessage({ whatsappNumber, orderNumber: order.order_number })?.url || '',
  };
}

export async function findTrackableOrder(orderNumber, phone, sheetReader = getSheetValues, whatsappNumber = '') {
  const normalizedPhone = normalizeIndianPhone(phone);
  const normalizedOrderNumber = String(orderNumber || '').trim().toUpperCase();
  if (!/^JB-[A-Z0-9-]+$/.test(normalizedOrderNumber) || !normalizedPhone) return null;
  const [orderRows, itemRows] = await Promise.all([sheetReader('Orders', { fresh: true }), sheetReader('Order_Items', { fresh: true })]);
  const objects = (rows) => { if (!Array.isArray(rows) || !rows.length) return []; const headers = rows[0].map((header) => String(header || '').trim()); return rows.slice(1).map((row) => Object.fromEntries(headers.map((header, index) => [header, row[index] ?? '']))); };
  const order = objects(orderRows).find((row) => String(row.order_number || '').trim().toUpperCase() === normalizedOrderNumber && normalizeIndianPhone(row.customer_phone) === normalizedPhone);
  if (!order) return null;
  const items = objects(itemRows).filter((row) => row.order_number === order.order_number);
  return serializePublicTrackingOrder(order, items, whatsappNumber);
}
