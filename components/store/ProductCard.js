/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { formatINR } from '@/lib/pricing/money';

export default function ProductCard({ product }) {
  return <Link href={`/bundles/${product.slug}`} className="group rounded-2xl border border-ink/10 bg-white p-4 transition hover:-translate-y-1 hover:border-berry sm:p-5"><div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-xl bg-cream">{product.primary_image_url ? <img src={product.primary_image_url} alt={product.image_alt} className="h-full w-full object-cover" /> : <span className="text-5xl" aria-hidden="true">🎁</span>}</div><div className="mt-4 flex items-start justify-between gap-3"><div><h2 className="font-bold group-hover:text-berry">{product.name}</h2><p className="mt-1 text-sm text-ink/60">{product.short_description}</p></div>{product.bestseller ? <span className="shrink-0 rounded-full bg-butter px-2 py-1 text-[10px] font-bold uppercase">Bestseller</span> : null}</div><p className="mt-4 font-bold">{formatINR(product.price_paise)} <span className="text-xs font-normal text-ink/55">per gift</span></p></Link>;
}
