'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CART_STORAGE_KEY, calculateCartSubtotal, isMinimumOrderReached } from '@/lib/cart';
import { formatINR, multiplyUnitPrice } from '@/lib/pricing/money';

const initial = { customer_name: '', customer_phone: '', customer_email: '', delivery_address: '', area: '', pin_code: '', party_date: '', preferred_delivery_date: '' };

export default function CheckoutClient({ minimumOrderValuePaise = '70000', deliveryChargeNote = 'Delivery charges are calculated separately.' }) {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [customer, setCustomer] = useState(initial);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  useEffect(() => { const timer = window.setTimeout(() => { try { setItems(JSON.parse(window.localStorage.getItem(CART_STORAGE_KEY) || '[]')); } catch { setItems([]); } }, 0); return () => window.clearTimeout(timer); }, []);
  const subtotal = calculateCartSubtotal(items);
  const qualifies = isMinimumOrderReached(subtotal, BigInt(minimumOrderValuePaise));
  function update(field, value) { setCustomer((current) => ({ ...current, [field]: value })); }
  async function submit(event) {
    event.preventDefault(); setError('');
    if (!qualifies) { setError('Your cart must meet the minimum order value before checkout.'); return; }
    setSubmitting(true);
    try {
      const key = window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`;
      const response = await fetch('/api/orders', { method: 'POST', headers: { 'content-type': 'application/json', 'idempotency-key': key }, body: JSON.stringify({ customer, items }) });
      const body = await response.json();
      if (!response.ok) { setError(body.error || 'We could not save your order right now. Please try again.'); return; }
      window.sessionStorage.setItem('joybundle-last-order-v1', JSON.stringify(body));
      window.localStorage.removeItem(CART_STORAGE_KEY);
      router.push(`/order-confirmation/${encodeURIComponent(body.order_number)}`);
    } catch { setError('We could not reach JoyBundle. Please try again.'); } finally { setSubmitting(false); }
  }
  if (!items.length) return <main className="min-h-screen bg-cream"><div className="mx-auto max-w-3xl px-5 py-16"><h1 className="text-4xl font-bold">Your cart is empty.</h1><Link href="/shop/under-100" className="mt-6 inline-block font-bold text-berry">Browse bundles →</Link></div></main>;
  return <main className="min-h-screen bg-cream"><div className="mx-auto max-w-4xl px-5 py-6 sm:px-8"><header className="flex items-center justify-between"><Link href="/" className="text-xl font-bold">Joy<span className="text-berry">Bundle</span></Link><Link href="/cart" className="text-sm font-bold text-berry">Back to cart</Link></header><div className="py-12"><p className="text-sm font-bold uppercase tracking-[0.18em] text-berry">Checkout</p><h1 className="mt-3 text-4xl font-bold">Tell us where to send the joy.</h1><div className="mt-8 grid gap-8 lg:grid-cols-[1fr_0.75fr]"><form onSubmit={submit} className="space-y-4 rounded-2xl border border-ink/10 bg-white p-5"><label className="block text-sm font-semibold">Name<input required maxLength="120" value={customer.customer_name} onChange={(e) => update('customer_name', e.target.value)} className="mt-2 h-12 w-full rounded-xl border border-ink/20 px-3" /></label><label className="block text-sm font-semibold">Mobile number<input required inputMode="tel" placeholder="10-digit Indian mobile" value={customer.customer_phone} onChange={(e) => update('customer_phone', e.target.value)} className="mt-2 h-12 w-full rounded-xl border border-ink/20 px-3" /></label><label className="block text-sm font-semibold">Email <span className="font-normal text-ink/60">(optional)</span><input type="email" maxLength="160" value={customer.customer_email} onChange={(e) => update('customer_email', e.target.value)} className="mt-2 h-12 w-full rounded-xl border border-ink/20 px-3" /></label><label className="block text-sm font-semibold">Delivery address<textarea required maxLength="500" value={customer.delivery_address} onChange={(e) => update('delivery_address', e.target.value)} className="mt-2 min-h-24 w-full rounded-xl border border-ink/20 px-3 py-2" /></label><div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm font-semibold">Area<input required maxLength="120" value={customer.area} onChange={(e) => update('area', e.target.value)} className="mt-2 h-12 w-full rounded-xl border border-ink/20 px-3" /></label><label className="block text-sm font-semibold">PIN code<input required inputMode="numeric" maxLength="6" value={customer.pin_code} onChange={(e) => update('pin_code', e.target.value)} className="mt-2 h-12 w-full rounded-xl border border-ink/20 px-3" /></label></div><div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm font-semibold">Party date<input required type="date" value={customer.party_date} onChange={(e) => update('party_date', e.target.value)} className="mt-2 h-12 w-full rounded-xl border border-ink/20 px-3" /></label><label className="block text-sm font-semibold">Preferred delivery date <span className="font-normal text-ink/60">(optional)</span><input type="date" value={customer.preferred_delivery_date} onChange={(e) => update('preferred_delivery_date', e.target.value)} className="mt-2 h-12 w-full rounded-xl border border-ink/20 px-3" /></label></div><p className="rounded-xl bg-butter/40 p-3 text-sm font-semibold">No payment required now. We&apos;ll confirm availability, delivery charges and the final amount with you on WhatsApp.</p>{error ? <p role="alert" className="rounded-xl bg-peach/50 p-3 text-sm font-semibold text-berry">{error}</p> : null}<button disabled={submitting || !qualifies} className="min-h-12 w-full rounded-full bg-ink px-5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40">{submitting ? 'Sending…' : 'Send Order Request'}</button></form><aside className="h-fit rounded-2xl bg-ink p-5 text-white"><h2 className="text-lg font-bold">Order summary</h2><div className="mt-4 space-y-3">{items.map((item, index) => <div key={`${item.product_code}-${index}`} className="flex justify-between gap-4 text-sm"><span>{item.name} × {item.quantity}</span><strong>{formatINR(multiplyUnitPrice(item.unit_price_paise, item.quantity))}</strong></div>)}</div><div className="mt-5 flex justify-between border-t border-white/20 pt-4"><span>Subtotal</span><strong>{formatINR(subtotal)}</strong></div><p className="mt-3 text-sm text-white/70">{deliveryChargeNote}</p><p className="mt-2 text-sm text-white/70">Payment status will be Pending until confirmed.</p></aside></div></div></div></main>;
}
