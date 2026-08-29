import { isOrderStatus } from './status.js';

const CUSTOMER_STATUS = {
  RECEIVED: { title: 'Order request received', description: "We've received your order request and will check availability shortly.", stage: 1 },
  CONFIRMED: { title: 'Order confirmed', description: 'Your order details have been confirmed.', stage: 2 },
  AWAITING_PAYMENT: { title: 'Waiting for payment', description: "We've confirmed your final amount. Complete payment using the QR code shared with you.", stage: 2, paymentWaiting: true },
  PAID: { title: 'Payment received', description: 'Your payment has been received.', stage: 3 },
  PREPARING: { title: "We're preparing your gifts", description: 'Your JoyBundle gifts are being prepared and personalized.', stage: 4 },
  READY: { title: 'Your gifts are ready', description: 'Your order has been packed and is ready for delivery.', stage: 5 },
  DISPATCHED: { title: 'Out for delivery', description: 'Your JoyBundle order is on the way.', stage: 6 },
  DELIVERED: { title: 'Delivered', description: 'Your JoyBundle order has been delivered.', stage: 7 },
  CANCELLED: { title: 'Order cancelled', description: 'This order has been cancelled.', stage: null, cancelled: true },
};

export function getCustomerOrderStatus(status) {
  const normalized = String(status ?? '').trim().toUpperCase();
  if (!isOrderStatus(normalized)) return null;
  return { status: normalized, ...CUSTOMER_STATUS[normalized] };
}

export function getCustomerPaymentStatus(paymentStatus) {
  return String(paymentStatus ?? '').trim().toUpperCase() === 'PAID' ? 'PAID' : 'PENDING';
}

export const CUSTOMER_TRACKING_STAGES = Object.freeze(['Order Received', 'Order Confirmed', 'Payment Received', 'Preparing', 'Ready', 'Out for Delivery', 'Delivered']);
