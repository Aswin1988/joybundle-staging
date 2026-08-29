'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatINR } from '@/lib/pricing/money';
import { buildWhatsAppMessage } from '@/lib/orders/whatsapp';

export default function ConfirmationClient({ orderNumber, whatsappNumber = '' }) {
  const [order, setOrder] = useState(null);
  useEffect(() => { const timer = window.setTimeout(() => { try { const value = JSON.parse(window.sessionStorage.getItem('joybundle-last-order-v1') || 'null'); if (value?.order_number === orderNumber) setOrder(value); } catch { /* show the safe reference-only state */ } }, 0); return () => window.clearTimeout(timer); }, [orderNumber]);
  const whatsapp = order ? buildWhatsAppMessage({ whatsappNumber, order }) : null;
  return <main className="min-h-screen bg-cream"><div className="mx-auto max-w-3xl px-5 py-16 sm:px-8"><p className="text-sm font-bold uppercase tracking-[0.18em] text-berry">Order received</p><h1 className="mt-3 text-4xl font-bold">Thank you for choosing JoyBundle.</h1><p className="mt-5 text-lg leading-8 text-ink/70">Your order request has been received. We’ll confirm product availability and delivery charges before preparation begins.</p><section className="mt-8 rounded-2xl border border-ink/10 bg-white p-5"><p className="text-sm text-ink/60">Order number</p><p className="mt-1 text-2xl font-bold">{orderNumber}</p>{order ? <><p className="mt-5 font-semibold">{order.customer_name}</p><p className="mt-2">Order value: <strong>{formatINR(order.total_paise)}</strong></p><p className="mt-1 text-sm text-ink/70">Party date: {order.party_date}</p><p className="mt-1 text-sm text-ink/70">Payment status: Pending</p><div className="mt-5 border-t border-ink/10 pt-4">{order.items.map((item) => <p key={item.product_code} className="text-sm">{item.name} × {item.quantity} — {formatINR(item.line_total_paise)}</p>)}</div>{whatsapp ? <a href={whatsapp.url} target="_blank" rel="noreferrer" className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-ink px-5 text-sm font-bold text-white">Continue on WhatsApp</a> : null}</> : <p className="mt-4 text-sm text-ink/70">Keep this order number for reference.</p>}</section><p className="mt-6 text-sm text-ink/70">You can continue on WhatsApp to complete the confirmation.</p><Link href="/" className="mt-6 inline-block font-bold text-berry">Back to JoyBundle →</Link></div></main>;
}
