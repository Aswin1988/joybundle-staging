'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { calculateContribution, calculateMarginBasisPoints, formatINR, parseRupeeInputToPaise } from '@/lib/pricing/money';

function rupeeInput(paise = '0') {
  const amount = BigInt(paise || 0);
  return `${amount / 100n}.${String(amount % 100n).padStart(2, '0')}`;
}

const blankProduct = {
  product_code: '', slug: '', name: '', short_description: '', description: '', price: '', estimated_cost: '', active: false,
  personalization_enabled: false, personalization_schema: {}, seo_title: '', seo_description: '', is_featured: false, is_bestseller: false,
  bag_option_ids: [], contents: [], images: [],
};

export default function ProductForm({ product, bagOptions }) {
  const router = useRouter();
  const [form, setForm] = useState(product ? { ...product, price: rupeeInput(product.price_paise), estimated_cost: rupeeInput(product.estimated_unit_cost_paise) } : blankProduct);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [imageMessage, setImageMessage] = useState('');

  const economics = useMemo(() => {
    try {
      const price = parseRupeeInputToPaise(form.price, 'Selling price');
      const cost = parseRupeeInputToPaise(form.estimated_cost, 'Estimated product cost');
      return { price, cost, contribution: calculateContribution(price, cost), margin: calculateMarginBasisPoints(price, cost) };
    } catch { return null; }
  }, [form.price, form.estimated_cost]);

  function setField(name, value) { setForm((current) => ({ ...current, [name]: value })); }
  function toggleBag(id) { setForm((current) => ({ ...current, bag_option_ids: current.bag_option_ids.includes(id) ? current.bag_option_ids.filter((item) => item !== id) : [...current.bag_option_ids, id] })); }
  function updateContent(index, key, value) { setForm((current) => ({ ...current, contents: current.contents.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item) })); }
  function addContent() { setForm((current) => ({ ...current, contents: [...current.contents, { name: '', description: '', active: true }] })); }
  function removeContent(index) { setForm((current) => ({ ...current, contents: current.contents.map((item, itemIndex) => itemIndex === index ? { ...item, active: false } : item) })); }

  async function save(event) {
    event.preventDefault();
    setBusy(true); setMessage('');
    try {
      const payload = {
        product_code: form.product_code, slug: form.slug, name: form.name, short_description: form.short_description, description: form.description,
        price: form.price, estimated_cost: form.estimated_cost, active: form.active, personalization_enabled: form.personalization_enabled,
        personalization_schema: form.personalization_schema || {}, seo_title: form.seo_title, seo_description: form.seo_description,
        is_featured: form.is_featured, is_bestseller: form.is_bestseller, bag_option_ids: form.bag_option_ids,
        contents: form.contents.filter((item) => item.active && item.name.trim()),
        images: form.images.map((image, index) => ({ id: image.id, alt_text: image.alt_text, sort_order: Number.isInteger(image.sort_order) ? image.sort_order : index, active: image.active })),
      };
      const response = await fetch(product ? `/api/admin/products/${product.id}` : '/api/admin/products', { method: product ? 'PATCH' : 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Unable to save product.');
      router.replace(`/admin/products/${result.id || product.id}`);
    } catch (error) { setMessage(error.message); setBusy(false); }
  }

  async function uploadImage(event) {
    const file = event.target.files?.[0];
    if (!file || !product) return;
    setImageMessage('Uploading…');
    const body = new FormData(); body.append('product_id', product.id); body.append('file', file); body.append('alt_text', `${form.name} product image`);
    const response = await fetch('/api/admin/media', { method: 'POST', body });
    const result = await response.json();
    setImageMessage(response.ok ? 'Image uploaded.' : (result.error || 'Image upload failed.'));
    if (response.ok) window.location.reload();
  }

  return <form onSubmit={save} className="space-y-6">
    <section className="rounded-2xl border border-ink/10 bg-white p-5 sm:p-7"><h2 className="text-lg font-bold">Basic information</h2><div className="mt-5 grid gap-4 sm:grid-cols-2">
      <Field label="Product code" value={form.product_code} onChange={(value) => setField('product_code', value)} required />
      <Field label="Slug" value={form.slug} onChange={(value) => setField('slug', value)} required />
      <Field label="Name" value={form.name} onChange={(value) => setField('name', value)} required wide />
      <Field label="Short description" value={form.short_description} onChange={(value) => setField('short_description', value)} required wide />
      <label className="text-sm font-semibold sm:col-span-2">Description<textarea required value={form.description} onChange={(event) => setField('description', event.target.value)} rows={5} className="mt-2 w-full rounded-xl border border-ink/20 p-3 font-normal outline-none focus:border-berry" /></label>
    </div></section>

    <section className="rounded-2xl border border-ink/10 bg-white p-5 sm:p-7"><h2 className="text-lg font-bold">Pricing</h2><div className="mt-5 grid gap-4 sm:grid-cols-2"><Field label="Selling price (₹ per gift)" value={form.price} onChange={(value) => setField('price', value)} inputMode="decimal" required /><Field label="Estimated product cost (₹)" value={form.estimated_cost} onChange={(value) => setField('estimated_cost', value)} inputMode="decimal" required /></div>{economics ? <div className="mt-5 grid gap-3 rounded-2xl bg-cream p-4 sm:grid-cols-3"><Metric label="Selling price" value={formatINR(economics.price)} /><Metric label="Estimated cost" value={formatINR(economics.cost)} /><Metric label="Contribution" value={formatINR(economics.contribution)} /><Metric label="Estimated gross margin" value={`${(Number(economics.margin) / 100).toFixed(2)}%`} /><div className="sm:col-span-2"><p className="text-xs text-ink/55">Margin uses integer basis points internally.</p>{economics.margin <= 0n ? <p className="mt-1 text-sm font-bold text-berry">Estimated margin is 0% or negative.</p> : null}</div></div> : <p className="mt-4 text-sm text-ink/55">Enter valid rupee amounts to preview economics.</p>}</section>

    <section className="rounded-2xl border border-ink/10 bg-white p-5 sm:p-7"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-bold">What’s included</h2><p className="mt-1 text-sm text-ink/60">List the bundle contents clearly.</p></div><button type="button" onClick={addContent} className="rounded-full border border-ink/20 px-4 py-2 text-sm font-bold">Add item</button></div><div className="mt-5 space-y-3">{form.contents.map((item, index) => item.active ? <div key={item.id || index} className="grid gap-3 rounded-xl bg-cream p-3 sm:grid-cols-[1fr_1fr_auto]"><input required placeholder="Item name" value={item.name} onChange={(event) => updateContent(index, 'name', event.target.value)} className="rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm" /><input placeholder="Description (optional)" value={item.description || ''} onChange={(event) => updateContent(index, 'description', event.target.value)} className="rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm" /><button type="button" onClick={() => removeContent(index)} className="px-2 text-sm font-bold text-berry">Remove</button></div> : null)}{!form.contents.some((item) => item.active) ? <p className="text-sm text-ink/55">No contents added yet.</p> : null}</div></section>

    <section className="rounded-2xl border border-ink/10 bg-white p-5 sm:p-7"><h2 className="text-lg font-bold">Bag options</h2><p className="mt-1 text-sm text-ink/60">These are normally offered choices and remain subject to availability.</p><div className="mt-4 grid gap-3 sm:grid-cols-2">{bagOptions.map((option) => <label key={option.id} className="flex items-center gap-3 rounded-xl bg-cream p-3 text-sm font-semibold"><input type="checkbox" checked={form.bag_option_ids.includes(option.id)} onChange={() => toggleBag(option.id)} className="h-4 w-4 accent-berry" />{option.name}</label>)}</div></section>

    <section className="rounded-2xl border border-ink/10 bg-white p-5 sm:p-7"><h2 className="text-lg font-bold">Personalization</h2><label className="mt-4 flex items-center gap-3 text-sm font-semibold"><input type="checkbox" checked={form.personalization_enabled} onChange={(event) => setField('personalization_enabled', event.target.checked)} className="h-4 w-4 accent-berry" />Allow child name, age, and short message</label></section>

    <section className="rounded-2xl border border-ink/10 bg-white p-5 sm:p-7"><h2 className="text-lg font-bold">Images</h2><p className="mt-1 text-sm text-ink/60">Use clear images and descriptive alt text.</p>{product ? <><label className="mt-4 inline-flex cursor-pointer rounded-full border border-ink/20 px-4 py-2 text-sm font-bold">Upload image<input type="file" accept="image/png,image/jpeg,image/webp" onChange={uploadImage} className="sr-only" /></label><span className="ml-3 text-sm text-ink/60">{imageMessage}</span><div className="mt-4 space-y-3">{form.images.map((image, index) => <div key={image.id} className="grid gap-3 rounded-xl bg-cream p-3 sm:grid-cols-[1fr_100px_auto]"><input aria-label="Image alt text" value={image.alt_text} onChange={(event) => setForm((current) => ({ ...current, images: current.images.map((item) => item.id === image.id ? { ...item, alt_text: event.target.value } : item) }))} className="rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm" /><input aria-label="Image sort order" type="number" min="0" value={image.sort_order} onChange={(event) => setForm((current) => ({ ...current, images: current.images.map((item) => item.id === image.id ? { ...item, sort_order: Number(event.target.value) } : item) }))} className="rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm" /><div className="flex items-center gap-2"><label className="text-xs font-bold"><input type="checkbox" checked={image.active} onChange={(event) => setForm((current) => ({ ...current, images: current.images.map((item) => item.id === image.id ? { ...item, active: event.target.checked } : item) }))} className="mr-1 accent-berry" />Shown</label><button type="button" onClick={async () => { const response = await fetch(`/api/admin/media/${image.id}`, { method: 'DELETE' }); if (response.ok) setForm((current) => ({ ...current, images: current.images.filter((item) => item.id !== image.id) })); }} className="text-xs font-bold text-berry">Delete</button></div></div>)}</div></> : <p className="mt-4 text-sm text-ink/55">Save the product before uploading images.</p>}</section>

    <section className="rounded-2xl border border-ink/10 bg-white p-5 sm:p-7"><h2 className="text-lg font-bold">SEO and availability</h2><div className="mt-5 grid gap-4"><Field label="SEO title" value={form.seo_title} onChange={(value) => setField('seo_title', value)} /><Field label="SEO description" value={form.seo_description} onChange={(value) => setField('seo_description', value)} /><div className="flex flex-wrap gap-5 text-sm font-semibold"><Check label="Available" checked={form.active} onChange={(value) => setField('active', value)} /><Check label="Featured product" checked={form.is_featured} onChange={(value) => setField('is_featured', value)} /><Check label="Bestseller" checked={form.is_bestseller} onChange={(value) => setField('is_bestseller', value)} /></div></div></section>
    {message ? <p role="alert" className="rounded-xl bg-berry/10 p-4 text-sm font-semibold text-berry">{message}</p> : null}<div className="flex flex-wrap gap-3"><button disabled={busy} className="min-h-12 rounded-full bg-ink px-6 text-sm font-bold text-white disabled:opacity-60">{busy ? 'Saving…' : 'Save product'}</button><Link href="/admin/products" className="inline-flex min-h-12 items-center rounded-full border border-ink/20 px-6 text-sm font-bold">Cancel</Link></div>
  </form>;
}

function Field({ label, value, onChange, required = false, wide = false, inputMode }) { return <label className={`text-sm font-semibold ${wide ? 'sm:col-span-2' : ''}`}>{label}<input required={required} value={value} inputMode={inputMode} onChange={(event) => onChange(event.target.value)} className="mt-2 h-11 w-full rounded-xl border border-ink/20 px-3 font-normal outline-none focus:border-berry" /></label>; }
function Metric({ label, value }) { return <div><p className="text-xs text-ink/55">{label}</p><p className="mt-1 font-bold">{value}</p></div>; }
function Check({ label, checked, onChange }) { return <label className="flex items-center gap-2"><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="h-4 w-4 accent-berry" />{label}</label>; }
