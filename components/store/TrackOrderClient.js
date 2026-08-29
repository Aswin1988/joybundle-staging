'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatINR } from '@/lib/pricing/money';
import { CUSTOMER_TRACKING_STAGES } from '@/lib/orders/customer-status';

export default function TrackOrderClient() {
  const [form, setForm] = useState({ orderNumber: '', phone: '' });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  async function submit(event) {
    event.preventDefault(); setLoading(true); setError(''); setResult(null);
    try { const response = await fetch('/api/orders/track', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(form) }); const body = await response.json(); if (!response.ok) { setError(body.error || "We couldn't find an order matching those details."); return; } setResult(body); } catch { setError('We could not check that order right now. Please try again.'); } finally { setLoading(false); }
  }
  return <main className="min-h-screen bg-cream"><div className="mx-auto max-w-3xl px-5 py-6 sm:px-8"><header className="flex items-center justify-between"><Link href="/" className="text-xl font-bold">Joy<span className="text-berry">Bundle</span></Link><Link href="/shop/under-100" className="text-sm font-bold text-berry">Shop bundles</Link></header><div className="py-12"><p className="text-sm font-bold uppercase tracking-[0.18em] text-berry">Track order</p><h1 className="mt-3 text-4xl font-bold">Track your JoyBundle order</h1><p className="mt-4 text-ink/65">Use the mobile number you provided when placing the order.</p><form onSubmit={submit} className="mt-8 space-y-4 rounded-2xl border border-ink/10 bg-white p-5"><label className="block text-sm font-semibold">Order number<input required placeholder="JB-XXXXXXXX-XXXX" value={form.orderNumber} onChange={(event) => setForm({ ...form, orderNumber: event.target.value })} className="mt-2 h-12 w-full rounded-xl border border-ink/20 px-3 uppercase" /></label><label className="block text-sm font-semibold">Mobile number<input required inputMode="tel" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} className="mt-2 h-12 w-full rounded-xl border border-ink/20 px-3" /></label>{error ? <p role="alert" className="rounded-xl bg-peach/50 p-3 text-sm font-semibold text-berry">{error}</p> : null}<button disabled={loading} className="min-h-12 w-full rounded-full bg-ink px-5 text-sm font-bold text-white disabled:opacity-40">{loading ? 'Checking…' : 'Track Order'}</button></form>{result ? <TrackingResult result={result} /> : null}</div></div></main>;
}

function TrackingResult({ result }) {
  const current = result.status_stage || 1;
  const support = result.whatsapp_url ? <a href={result.whatsapp_url} target="_blank" rel="noreferrer" className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-ink px-5 text-sm font-bold text-white">Need help? Continue on WhatsApp</a> : null;
  return <section className="mt-8 rounded-2xl border border-ink/10 bg-white p-5"><p className="text-sm text-ink/60">Order</p><h2 className="mt-1 text-2xl font-bold">#{result.order_number}</h2><div className={`mt-5 rounded-xl p-4 ${result.cancelled ? 'bg-peach/50' : 'bg-mint/60'}`}><p className="font-bold">{result.status_title}</p><p className="mt-1 text-sm text-ink/70">{result.status_description}</p>{result.payment_waiting ? <p className="mt-2 text-sm font-semibold">Payment pending</p> : null}</div>{!result.cancelled ? <div className="mt-6 space-y-3">{CUSTOMER_TRACKING_STAGES.map((stage, index) => <div key={stage} className="flex items-center gap-3"><span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${index + 1 <= current ? 'bg-ink text-white' : 'border border-ink/20 text-ink/40'}`}>{index + 1}</span><span className={index + 1 <= current ? 'font-semibold' : 'text-ink/45'}>{stage}</span></div>)}</div> : null}<div className="mt-6 border-t border-ink/10 pt-4"><p className="text-sm">Payment: <strong>{result.payment_status === 'PAID' ? 'Payment received' : 'Payment pending'}</strong></p><p className="mt-1 text-sm">Party date: <strong>{result.party_date}</strong></p><p className="mt-1 text-sm">Order value: <strong>{formatINR(result.total_paise)}</strong></p>{result.items.map((item, index) => <p key={`${item.name}-${index}`} className="mt-2 text-sm text-ink/70">{item.name} × {item.quantity}</p>)}</div>{support}</section>;
}
