'use client';

import Link from 'next/link';

export default function StoreError({ reset }) {
  return <main className="min-h-screen bg-cream"><div className="mx-auto max-w-2xl px-5 py-20 text-center sm:px-8"><p className="text-sm font-bold uppercase tracking-[0.18em] text-berry">JoyBundle</p><h1 className="mt-3 text-4xl font-bold">We’re having a small hiccup.</h1><p className="mt-4 text-ink/70">The catalogue is temporarily unavailable. Please try again in a moment.</p><div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"><button type="button" onClick={() => reset()} className="min-h-12 rounded-full bg-ink px-6 text-sm font-bold text-white">Try again</button><Link href="/" className="inline-flex min-h-12 items-center justify-center rounded-full border-2 border-ink px-6 text-sm font-bold">Back home</Link></div></div></main>;
}
