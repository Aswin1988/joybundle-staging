import { NextResponse } from 'next/server';
import { getAdminProducts, createAdminProduct } from '@/lib/catalog/admin';
import { requireAdmin } from '@/lib/auth/admin';
import { parseRupeeInputToPaise } from '@/lib/pricing/money';
import { sanitizeProductInput } from '@/lib/validation/product';

export const dynamic = 'force-dynamic';

function normalizePayload(body) {
  return sanitizeProductInput({
    ...body,
    price_paise: parseRupeeInputToPaise(body.price, 'Selling price'),
    estimated_unit_cost_paise: parseRupeeInputToPaise(body.estimated_cost, 'Estimated product cost'),
  });
}

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Admin authentication required.' }, { status: 401 });
  return NextResponse.json({ products: await getAdminProducts() });
}

export async function POST(request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Admin authentication required.' }, { status: 401 });
  try {
    const input = normalizePayload(await request.json());
    const id = await createAdminProduct(input);
    return NextResponse.json({ id }, { status: 201 });
  } catch (error) {
    const duplicate = error?.code === '23505';
    return NextResponse.json({ error: duplicate ? 'Product code or slug already exists.' : (error.message || 'Invalid product.') }, { status: duplicate ? 409 : 400 });
  }
}
