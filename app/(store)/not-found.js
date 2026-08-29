import Link from 'next/link';

export default function StoreNotFound() {
  return <main className="min-h-screen bg-cream"><div className="mx-auto max-w-2xl px-5 py-20 text-center sm:px-8"><p className="text-sm font-bold uppercase tracking-[0.18em] text-berry">JoyBundle</p><h1 className="mt-3 text-4xl font-bold">That bundle isn’t here.</h1><p className="mt-4 text-ink/70">It may have been retired or the link may be out of date.</p><Link href="/shop/under-100" className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full bg-ink px-6 text-sm font-bold text-white">Browse bundles</Link></div></main>;
}
