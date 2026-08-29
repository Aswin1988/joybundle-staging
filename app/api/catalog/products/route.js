import { NextResponse } from 'next/server';
import { getPublicProductBySlug, getPublicProducts } from '@/lib/catalog/public';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const slug = new URL(request.url).searchParams.get('slug');
    const band = new URL(request.url).searchParams.get('band');
    if (slug) {
      const product = await getPublicProductBySlug(slug);
      return product ? NextResponse.json({ product }) : NextResponse.json({ error: 'Product not found.' }, { status: 404 });
    }
    return NextResponse.json({ products: await getPublicProducts({ bandSlug: band || undefined }) });
  } catch {
    return NextResponse.json({ error: 'Catalog is temporarily unavailable.' }, { status: 503 });
  }
}
