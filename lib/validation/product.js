import { z } from 'zod';

const text = (label, max) => z.string().trim().min(1, `${label} is required`).max(max, `${label} is too long`);

export const productContentSchema = z.object({
  id: z.string().uuid().optional(),
  name: text('Content name', 160),
  description: z.string().trim().max(500).nullable().optional(),
  sort_order: z.number().int().min(0).optional(),
  active: z.boolean().default(true),
});

export const productImageSchema = z.object({
  id: z.string().uuid(),
  alt_text: text('Image alt text', 200),
  sort_order: z.number().int().min(0),
  active: z.boolean(),
});

export const productInputSchema = z.object({
  product_code: z.string().trim().min(1).max(60).regex(/^[A-Za-z0-9_-]+$/, 'Product code may contain letters, numbers, hyphens, and underscores only'),
  slug: z.string().trim().min(1).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must use lowercase words separated by hyphens'),
  name: text('Name', 160),
  short_description: text('Short description', 300),
  description: text('Description', 5000),
  price_paise: z.coerce.bigint().nonnegative(),
  estimated_unit_cost_paise: z.coerce.bigint().nonnegative(),
  active: z.boolean().default(false),
  personalization_enabled: z.boolean().default(false),
  personalization_schema: z.record(z.unknown()).default({}),
  seo_title: z.string().trim().max(160).nullable().optional(),
  seo_description: z.string().trim().max(320).nullable().optional(),
  is_featured: z.boolean().default(false),
  is_bestseller: z.boolean().default(false),
  bag_option_ids: z.array(z.string().uuid()).default([]),
  contents: z.array(productContentSchema).max(50).default([]),
  images: z.array(productImageSchema).max(30).default([]),
});

export function sanitizeProductInput(input) {
  const parsed = productInputSchema.parse(input);
  return {
    ...parsed,
    seo_title: parsed.seo_title || null,
    seo_description: parsed.seo_description || null,
    contents: parsed.contents.map((content, index) => ({ ...content, sort_order: index })),
  };
}
