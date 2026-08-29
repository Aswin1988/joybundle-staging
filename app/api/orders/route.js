import { NextResponse } from 'next/server';
import { createOrder } from '@/lib/orders/service';
import { withIdempotency } from '@/lib/orders/idempotency';

export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const contentLength = Number(request.headers.get('content-length') || 0);
    if (contentLength > 100_000) return NextResponse.json({ error: 'Request is too large.' }, { status: 413 });
    const body = await request.json();
    const key = request.headers.get('idempotency-key')?.trim();
    if (key && key.length > 120) return NextResponse.json({ error: 'Invalid request key.' }, { status: 400 });
    const result = await withIdempotency(key, () => createOrder(body));
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    const status = error?.status || 503;
    const known = ['VALIDATION_ERROR', 'INVALID_ITEMS', 'INVALID_QUANTITY', 'PRODUCT_UNAVAILABLE', 'INVALID_BAG_OPTION', 'INVALID_PERSONALIZATION', 'PRICE_CHANGED', 'BELOW_MOV'];
    const response = { error: known.includes(error?.code) ? error.message : 'We could not save your order right now. Please try again.' };
    if (error?.code === 'PRICE_CHANGED') response.code = error.code;
    if (error?.details) response.details = error.details;
    return NextResponse.json(response, { status });
  }
}
