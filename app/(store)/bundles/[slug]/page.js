/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPublicProductBySlug, getSettings } from '@/lib/catalog/public';
import { formatINR } from '@/lib/pricing/money';
import BundleConfigurator from '@/components/store/BundleConfigurator';

export const revalidate = 180;

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await getPublicProductBySlug(slug);
  if (!product) return {};
  return { title: product.seo_title || `${product.name} | JoyBundle`, description: product.seo_description || product.short_description, alternates: { canonical: `/bundles/${slug}` }, openGraph: { title: product.seo_title || product.name, description: product.seo_description || product.short_description } };
}

export default async function BundleDetailPage({ params }) {
  const { slug } = await params;
  const product = await getPublicProductBySlug(slug);
  if (!product) notFound();
  const settings = await getSettings();
  return <main className="min-h-screen bg-cream"><div className="mx-auto max-w-5xl px-5 py-6 sm:px-8"><header className="flex items-center justify-between"><Link href="/" className="text-xl font-bold">Joy<span className="text-berry">Bundle</span></Link><div className="flex gap-4"><Link href="/cart" className="text-sm font-bold text-berry">Cart</Link><Link href="/shop/under-100" className="text-sm font-bold text-berry">Shop by budget</Link></div></header><div className="grid gap-10 py-12 lg:grid-cols-2"><div className="flex aspect-square items-center justify-center overflow-hidden rounded-3xl bg-white">{product.primary_image_url ? <img src={product.primary_image_url} alt={product.image_alt || product.name} className="h-full w-full object-cover" /> : <span className="text-8xl" aria-hidden="true">🎁</span>}</div><article><p className="text-sm font-bold uppercase tracking-[0.18em] text-berry">{product.product_code}</p><h1 className="mt-3 text-4xl font-bold">{product.name}</h1><p className="mt-4 text-lg leading-8 text-ink/70">{product.description}</p><p className="mt-6 text-2xl font-bold">{formatINR(product.price_paise)} <span className="text-sm font-normal text-ink/55">per child</span></p><p className="mt-2 text-sm font-semibold text-ink/65">{product.personalization_enabled ? 'Personalization available' : 'Ready-to-gift bundle'}</p>{product.contents.length ? <section className="mt-8"><h2 className="text-lg font-bold">What’s included</h2><ul className="mt-3 space-y-3">{product.contents.map((item) => <li key={`${product.product_code}-${item.sort_order}`} className="rounded-xl bg-white p-3"><p className="font-bold">{item.name}</p>{item.description ? <p className="mt-1 text-sm text-ink/60">{item.description}</p> : null}</li>)}</ul></section> : null}<BundleConfigurator product={product} minimumOrderValuePaise={settings.MIN_ORDER_VALUE_PAISE} /><p className="mt-8 text-sm text-ink/60">Orders are prepared after payment. Standard preparation lead time is {settings.STANDARD_LEAD_TIME_DAYS} days. {settings.RUSH_ORDER_NOTE}</p></article></div></div></main>;
}
