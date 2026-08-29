import { randomUUID } from 'node:crypto';
import { createServiceRoleClient, isServiceRoleConfigured } from '@/lib/supabase/server';
import { MAX_PRODUCT_IMAGE_BYTES, validateImageMetadata } from '@/lib/storage/image-validation';

export const PRODUCT_MEDIA_BUCKET = 'product-media';
export { MAX_PRODUCT_IMAGE_BYTES, validateImageMetadata } from '@/lib/storage/image-validation';

export async function uploadProductImage({ productId, file, altText, sortOrder = 0 }) {
  if (!isServiceRoleConfigured()) throw new Error('Supabase Storage is not configured yet.');
  const rule = validateImageMetadata(file);
  const buffer = Buffer.from(await file.arrayBuffer());
  if (!rule.signature(buffer)) throw new Error('The uploaded file does not match its declared image type.');
  const storagePath = `${productId}/${randomUUID()}.${rule.extension}`;
  const client = createServiceRoleClient();
  const { error: uploadError } = await client.storage.from(PRODUCT_MEDIA_BUCKET).upload(storagePath, buffer, { contentType: file.type, upsert: false });
  if (uploadError) throw uploadError;
  const { data, error } = await client.from('product_images').insert({ product_id: productId, storage_path: storagePath, alt_text: altText.trim().slice(0, 200) || 'JoyBundle product image', sort_order: sortOrder, active: true }).select('id,product_id,storage_path,alt_text,sort_order,active,created_at').single();
  if (error) throw error;
  return data;
}
