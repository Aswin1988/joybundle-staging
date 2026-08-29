import { NextResponse } from 'next/server';
import { getAdminProduct, updateAdminProduct } from '@/lib/catalog/admin';
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

export async function GET(_request, { params }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Admin authentication required.' }, { status: 401 });
  const { id } = await params;
  const product = await getAdminProduct(id);
  return product ? NextResponse.json({ product }) : NextResponse.json({ error: 'Product not found.' }, { status: 404 });
}

export async function PATCH(request, { params }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Admin authentication required.' }, { status: 401 });
  const { id } = await params;
  try {
    const input = normalizePayload(await request.json());
    if (!(await getAdminProduct(id))) return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
    await updateAdminProduct(id, input);
    return NextResponse.json({ id });
  } catch (error) {
    const duplicate = error?.code === '23505';
    return NextResponse.json({ error: duplicate ? 'Product code or slug already exists.' : (error.message || 'Invalid product.') }, { status: duplicate ? 409 : 400 });
  }
}

export async function DELETE() {
  return NextResponse.json({ error: 'Products are archived by marking them unavailable; hard delete is disabled.' }, { status: 405 });
}
