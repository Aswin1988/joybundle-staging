import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/admin';
import { uploadProductImage } from '@/lib/storage/product-media';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  const context = await requireAdmin();
  if (!context) return NextResponse.json({ error: 'Admin authentication required.' }, { status: 401 });
  try {
    const form = await request.formData();
    const productId = String(form.get('product_id') || '');
    const file = form.get('file');
    const altText = String(form.get('alt_text') || '');
    if (!/^[0-9a-f-]{36}$/i.test(productId) || !(file instanceof File)) return NextResponse.json({ error: 'Product and image are required.' }, { status: 400 });
    const image = await uploadProductImage({ productId, file, altText });
    return NextResponse.json({ image }, { status: 201 });
  } catch (error) { return NextResponse.json({ error: error.message || 'Image upload failed.' }, { status: 400 }); }
}
