import { isOrderStatus } from './status.js';
import { getSheetValues } from '../google/sheets.js';

export function serializePublicOrder(order) {
  if (!order || !order.order_number || !isOrderStatus(order.status)) return null;
  return {
    order_number: String(order.order_number), status: order.status, created_at: String(order.created_at || ''),
    party_date: String(order.party_date || ''), subtotal_paise: String(order.subtotal_paise || '0'),
    delivery_charge_paise: String(order.delivery_charge_paise || '0'), total_paise: String(order.total_paise || '0'),
    payment_status: String(order.payment_status || 'PENDING'),
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
