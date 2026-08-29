export const ORDER_STATUSES = Object.freeze([
  'RECEIVED', 'CONFIRMED', 'AWAITING_PAYMENT', 'PAID', 'PREPARING', 'READY', 'DISPATCHED', 'DELIVERED', 'CANCELLED',
]);

export const ORDER_STATUS_TRANSITIONS = Object.freeze({
  RECEIVED: ['CONFIRMED', 'CANCELLED'], CONFIRMED: ['AWAITING_PAYMENT', 'CANCELLED'], AWAITING_PAYMENT: ['PAID', 'CANCELLED'],
  PAID: ['PREPARING', 'CANCELLED'], PREPARING: ['READY'], READY: ['DISPATCHED'], DISPATCHED: ['DELIVERED'], DELIVERED: [], CANCELLED: [],
});

export function isOrderStatus(value) { return ORDER_STATUSES.includes(value); }

export function validateOrderStatus(value) {
  if (!isOrderStatus(value)) throw new Error(`Invalid order status: ${value}`);
  return value;
}
