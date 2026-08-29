export const ANALYTICS_EVENTS = Object.freeze([
  'homepage_view', 'budget_category_view', 'bundle_view', 'add_to_cart', 'cart_view',
  'checkout_started', 'order_request_submitted', 'whatsapp_clicked', 'track_order_started',
  'track_order_success', 'track_order_failed',
]);

/** Client-safe analytics wrapper. Never pass customer/order/personalization data here. */
export function trackEvent(name, parameters = {}) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function' || !ANALYTICS_EVENTS.includes(name)) return;
  window.gtag('event', name, parameters);
}
