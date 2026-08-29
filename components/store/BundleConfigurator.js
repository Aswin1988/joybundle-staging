'use client';

import { useMemo, useState } from 'react';
import { formatINR, multiplyUnitPrice } from '@/lib/pricing/money';
import { isMinimumOrderReached, validatePersonalization } from '@/lib/cart';
import { trackEvent } from '@/lib/analytics';

export default function BundleConfigurator({ product, minimumOrderValuePaise = '70000' }) {
  const minimum = BigInt(minimumOrderValuePaise);
  const [quantity, setQuantity] = useState(1);
  const [bag, setBag] = useState(product.bag_options?.[0]?.bag_code || '');
  const [personalization, setPersonalization] = useState({ name: '', age: '', message: '' });
  const [notice, setNotice] = useState('');
  const total = useMemo(() => multiplyUnitPrice(product.price_paise, quantity), [product.price_paise, quantity]);
  const qualifies = isMinimumOrderReached(total, minimum);
  const minimumLabel = formatINR(minimum).replace('.00', '');

  function addToCart() {
    const personalizationError = product.personalization_enabled ? validatePersonalization(personalization) : null;
    if (personalizationError) { setNotice(personalizationError); return; }
    if (!qualifies) return;
    const item = { product_code: product.product_code, slug: product.slug, name: product.name, unit_price_paise: product.price_paise, quantity, selected_bag_option: bag, personalization: product.personalization_enabled ? personalization : null };
    const existing = JSON.parse(window.localStorage.getItem('joybundle-cart-v1') || '[]');
    window.localStorage.setItem('joybundle-cart-v1', JSON.stringify([...existing, item]));
    trackEvent('add_to_cart');
    setNotice('Added to your cart.');
  }

  return <section className="mt-8 rounded-2xl border border-ink/10 bg-white p-5">
    <h2 className="text-lg font-bold">Build this bundle</h2>
    <label className="mt-4 block text-sm font-semibold">Number of children<input aria-label="Quantity" type="number" min="1" value={quantity} onChange={(event) => setQuantity(Math.max(1, Number.parseInt(event.target.value, 10) || 1))} className="mt-2 h-12 w-full rounded-xl border border-ink/20 px-3" /></label>
    <p className="mt-3 text-sm text-ink/65">{quantity} × {formatINR(product.price_paise)} = <strong className="text-ink">{formatINR(total)}</strong></p>
    {product.bag_options?.length ? <label className="mt-4 block text-sm font-semibold">Bag option<select aria-label="Bag option" value={bag} onChange={(event) => setBag(event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-ink/20 bg-white px-3">{product.bag_options.map((option) => <option key={option.bag_code} value={option.bag_code}>{option.name}</option>)}</select><span className="mt-1 block text-xs font-normal text-ink/60">Bag colours are subject to availability.</span></label> : null}
    {product.personalization_enabled ? <fieldset className="mt-5 space-y-3"><legend className="text-sm font-semibold">Personalization <span className="font-normal text-ink/60">(optional)</span></legend><input aria-label="Child or preferred name" maxLength="50" placeholder="Child / preferred name" value={personalization.name} onChange={(event) => setPersonalization({ ...personalization, name: event.target.value })} className="h-11 w-full rounded-xl border border-ink/20 px-3" /><input aria-label="Age being celebrated" type="number" min="1" max="18" placeholder="Age being celebrated" value={personalization.age} onChange={(event) => setPersonalization({ ...personalization, age: event.target.value })} className="h-11 w-full rounded-xl border border-ink/20 px-3" /><textarea aria-label="Short message" maxLength="120" placeholder="Short message" value={personalization.message} onChange={(event) => setPersonalization({ ...personalization, message: event.target.value })} className="min-h-20 w-full rounded-xl border border-ink/20 px-3 py-2" /><p className="text-xs text-ink/60">Please check spelling carefully. Personalized items are prepared using the details you provide.</p></fieldset> : null}
    <p className={`mt-4 rounded-xl p-3 text-sm font-semibold ${qualifies ? 'bg-mint/60' : 'bg-butter/60'}`}>{qualifies ? 'Minimum order reached.' : `Add ${formatINR(minimum - total)} more to reach the ${minimumLabel} minimum order.`}</p>
    <button type="button" disabled={!qualifies} onClick={addToCart} className="mt-4 min-h-12 w-full rounded-full bg-ink px-5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40">Add to cart</button>
    {notice ? <p role="status" className="mt-3 text-sm font-semibold text-berry">{notice}</p> : null}
  </section>;
}
