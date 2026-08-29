'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { calculateCartSubtotal, isMinimumOrderReached, CART_STORAGE_KEY } from '@/lib/cart';
import { formatINR, multiplyUnitPrice } from '@/lib/pricing/money';
import { trackEvent } from '@/lib/analytics';

export default function CartClient({ minimumOrderValuePaise = '70000' }) {
  const [items, setItems] = useState([]);
  useEffect(() => { if (items.length) trackEvent('cart_view'); }, [items.length]);
  useEffect(() => { const timer = window.setTimeout(() => setItems(JSON.parse(window.localStorage.getItem(CART_STORAGE_KEY) || '[]')), 0); return () => window.clearTimeout(timer); }, []);
  function save(next) { setItems(next); window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(next)); }
  const subtotal = calculateCartSubtotal(items);
  const minimum = BigInt(minimumOrderValuePaise);
  const qualifies = isMinimumOrderReached(subtotal, minimum);
  const minimumLabel = formatINR(minimum).replace('.00', '');
  return <main className="min-h-screen bg-cream"><div className="mx-auto max-w-4xl px-5 py-6 sm:px-8"><header className="flex items-center justify-between"><Link href="/" className="text-xl font-bold">Joy<span className="text-berry">Bundle</span></Link><Link href="/" className="text-sm font-bold text-berry">Continue shopping</Link></header><div className="py-12"><p className="text-sm font-bold uppercase tracking-[0.18em] text-berry">Your cart</p><h1 className="mt-3 text-4xl font-bold">Ready for happy little guests?</h1>{items.length ? <div className="mt-8 space-y-4">{items.map((item, index) => <article key={`${item.product_code}-${index}`} className="rounded-2xl border border-ink/10 bg-white p-5"><div className="flex items-start justify-between gap-4"><div><h2 className="font-bold">{item.name}</h2><p className="mt-1 text-sm text-ink/60">{formatINR(item.unit_price_paise)} each · {item.selected_bag_option || 'No bag selected'}</p>{item.personalization?.name ? <p className="mt-2 text-sm text-ink/60">Personalized for {item.personalization.name}</p> : null}</div><p className="font-bold">{formatINR(multiplyUnitPrice(item.unit_price_paise, item.quantity))}</p></div><div className="mt-4 flex items-center gap-3"><label className="text-sm font-semibold">Quantity<input aria-label={`Quantity for ${item.name}`} type="number" min="1" value={item.quantity} onChange={(event) => { const next = [...items]; next[index] = { ...item, quantity: Math.max(1, Number.parseInt(event.target.value, 10) || 1) }; save(next); }} className="ml-2 h-10 w-20 rounded-lg border border-ink/20 px-2" /></label><button type="button" onClick={() => save(items.filter((_, itemIndex) => itemIndex !== index))} className="text-sm font-bold text-berry">Remove</button></div></article>)}<div className="rounded-2xl bg-ink p-5 text-white"><div className="flex justify-between"><span>Cart subtotal</span><strong>{formatINR(subtotal)}</strong></div><p className={`mt-2 text-sm font-semibold ${qualifies ? 'text-mint' : 'text-butter'}`}>{qualifies ? 'Minimum order reached.' : `Add ${formatINR(minimum - subtotal)} more to reach the ${minimumLabel} minimum order.`}</p><p className="mt-2 text-sm text-white/70">Delivery charges are calculated separately.</p>{qualifies ? <Link href="/checkout" className="mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-white px-5 text-sm font-bold text-ink">Continue to checkout</Link> : null}</div></div> : <div className="mt-8 rounded-2xl border border-dashed border-ink/20 bg-white p-8 text-center"><p className="font-bold">Your cart is empty.</p><Link href="/shop/under-100" className="mt-4 inline-block font-bold text-berry">Browse bundles →</Link></div>}</div></div></main>;
}
