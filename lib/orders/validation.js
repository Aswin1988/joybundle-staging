import { z } from 'zod';

const requiredText = (label, max) => z.string().trim().min(1, `${label} is required`).max(max, `${label} is too long`);
export const checkoutSchema = z.object({
  customer_name: requiredText('Name', 120),
  customer_phone: z.string().trim().regex(/^(?:\+91|91)?[6-9]\d{9}$/, 'Enter a valid Indian mobile number'),
  customer_email: z.string().trim().email('Enter a valid email address').max(160).optional().or(z.literal('')).default(''),
  delivery_address: requiredText('Delivery address', 500),
  area: requiredText('Area', 120),
  pin_code: z.string().trim().regex(/^[1-9]\d{5}$/, 'Enter a valid 6-digit PIN code'),
  party_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Enter a valid party date'),
  preferred_delivery_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Enter a valid delivery date').optional().or(z.literal('')).default(''),
});

export const orderItemSchema = z.object({
  product_code: requiredText('Product code', 60),
  slug: z.string().optional(),
  name: z.string().optional(),
  unit_price_paise: z.union([z.string(), z.number(), z.bigint()]).optional(),
  quantity: z.union([z.string(), z.number()]),
  selected_bag_option: z.string().trim().optional().default(''),
  personalization: z.object({ name: z.string().optional().default(''), age: z.union([z.string(), z.number()]).optional().default(''), message: z.string().optional().default('') }).nullable().optional().default(null),
});

export function parseDate(value, label) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(`${value}T00:00:00Z`))) throw new Error(`${label} must be a valid date.`);
}

export function normalizePhone(value) { return String(value || '').replace(/[\s()+-]/g, ''); }

export function normalizeIndianPhone(value) {
  const normalized = normalizePhone(value);
  const national = normalized.startsWith('91') && normalized.length === 12 ? normalized.slice(2) : normalized;
  return /^[6-9]\d{9}$/.test(national) ? national : '';
}
