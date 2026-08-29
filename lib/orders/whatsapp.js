import { formatINR } from '../pricing/money.js';

export function normalizeWhatsAppNumber(value) {
  const digits = String(value || '').replace(/\D/g, '');
  if (!digits) return '';
  const national = digits.startsWith('91') && digits.length === 12 ? digits.slice(2) : digits;
  if (!/^[6-9]\d{9}$/.test(national)) return '';
  return `91${national}`;
}

export function buildWhatsAppMessage({ whatsappNumber, order }) {
  const number = normalizeWhatsAppNumber(whatsappNumber);
  if (!number || !order?.order_number) return null;
  const message = [
    'Hi JoyBundle,', '', 'I just placed an order.', '',
    `Order: ${order.order_number}`,
    `Name: ${order.customer_name}`,
    `Party date: ${order.party_date}`,
    `Order value: ${formatINR(order.total_paise)}`,
    '', 'Please confirm availability and delivery charges.',
  ].join('\n');
  return { number, message, url: `https://wa.me/${number}?text=${encodeURIComponent(message)}` };
}

export function buildWhatsAppSupportMessage({ whatsappNumber, orderNumber }) {
  const number = normalizeWhatsAppNumber(whatsappNumber);
  if (!number || !orderNumber) return null;
  const message = `Hi JoyBundle,\n\nI need help with my order ${orderNumber}.`;
  return { number, message, url: `https://wa.me/${number}?text=${encodeURIComponent(message)}` };
}

export function buildWhatsAppContactMessage({ whatsappNumber }) {
  const number = normalizeWhatsAppNumber(whatsappNumber);
  if (!number) return null;
  const message = 'Hi JoyBundle, I would like help choosing return gifts.';
  return { number, message, url: `https://wa.me/${number}?text=${encodeURIComponent(message)}` };
}
