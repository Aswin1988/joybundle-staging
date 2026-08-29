import { multiplyUnitPrice } from './pricing/money.js';

export const CART_STORAGE_KEY = 'joybundle-cart-v1';

export function calculateCartSubtotal(items = []) { return items.reduce((total, item) => total + multiplyUnitPrice(item.unit_price_paise, item.quantity), 0n); }
export function isMinimumOrderReached(total, minimum = 70000n) { return BigInt(total) >= BigInt(minimum); }
export function validatePersonalization(input) {
  const name = String(input?.name || '').trim();
  const ageText = String(input?.age || '').trim();
  const message = String(input?.message || '').trim();
  if (name.length > 50) return 'Name must be 50 characters or fewer.';
  if (message.length > 120) return 'Message must be 120 characters or fewer.';
  if (ageText && (!/^\d+$/.test(ageText) || Number(ageText) < 1 || Number(ageText) > 18)) return 'Age must be a whole number between 1 and 18.';
  return null;
}
