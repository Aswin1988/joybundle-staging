import { NextResponse } from 'next/server';
import { getSettings } from '@/lib/catalog/public';
import { findTrackableOrder } from '@/lib/orders/public';
import { allowTrackingAttempt } from '@/lib/orders/rate-limit';
import { normalizeIndianPhone } from '@/lib/orders/validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();
    const orderNumber = String(body?.orderNumber || '').trim().toUpperCase();
    const phone = String(body?.phone || '').trim();
    if (orderNumber.length > 80 || phone.length > 30 || !/^JB-[A-Z0-9-]+$/.test(orderNumber) || !normalizeIndianPhone(phone)) return NextResponse.json({ error: "We couldn't find an order matching those details." }, { status: 404 });
    if (!allowTrackingAttempt(request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown', normalizeIndianPhone(phone))) return NextResponse.json({ error: 'Please wait a moment and try again.' }, { status: 429 });
    const settings = await getSettings();
    const result = await findTrackableOrder(orderNumber, phone, undefined, settings.WHATSAPP_NUMBER);
    if (!result) return NextResponse.json({ error: "We couldn't find an order matching those details." }, { status: 404 });
    return NextResponse.json(result);
  } catch { return NextResponse.json({ error: 'We could not check that order right now. Please try again.' }, { status: 503 }); }
}
