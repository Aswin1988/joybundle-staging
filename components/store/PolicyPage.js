import Link from 'next/link';
import SiteFooter from './SiteFooter';

export default function PolicyPage({ eyebrow, title, intro, sections }) {
  return <main className="min-h-screen bg-cream"><div className="mx-auto max-w-3xl px-5 py-6 sm:px-8"><header className="flex items-center justify-between"><Link href="/" className="text-xl font-bold">Joy<span className="text-berry">Bundle</span></Link><Link href="/track-order" className="text-sm font-bold text-berry">Track Order</Link></header><article className="py-12"><p className="text-sm font-bold uppercase tracking-[0.18em] text-berry">{eyebrow}</p><h1 className="mt-3 text-4xl font-bold">{title}</h1><p className="mt-5 text-lg leading-8 text-ink/70">{intro}</p><div className="mt-10 space-y-8">{sections.map((section) => <section key={section.heading}><h2 className="text-2xl font-bold">{section.heading}</h2><div className="mt-3 space-y-3 leading-7 text-ink/75">{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div></section>)}</div></article></div><SiteFooter /></main>;
}
