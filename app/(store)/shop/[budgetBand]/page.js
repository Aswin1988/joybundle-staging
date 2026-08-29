import Link from 'next/link';
import { notFound } from 'next/navigation';
import ProductCard from '@/components/store/ProductCard';
import BudgetLinks from '@/components/store/BudgetLinks';
import { getPriceBand } from '@/lib/config/business';
import { getPublicProducts } from '@/lib/catalog/public';

export const revalidate = 180;

export async function generateMetadata({ params }) {
  const { budgetBand } = await params;
  const band = getPriceBand(budgetBand);
  if (!band) return {};
  return { title: `${band.label} birthday return gifts | JoyBundle`, description: `Browse JoyBundle birthday return gifts priced ${band.label.toLowerCase()}, with Bangalore delivery and personalization where available.`, alternates: { canonical: `/shop/${budgetBand}` }, openGraph: { title: `${band.label} birthday return gifts | JoyBundle` } };
}

export default async function BudgetBandPage({ params }) {
  const { budgetBand } = await params;
  const band = getPriceBand(budgetBand);
  if (!band) notFound();
  const products = await getPublicProducts({ bandSlug: budgetBand });
  return <main className="min-h-screen bg-cream"><div className="mx-auto max-w-6xl px-5 py-6 sm:px-8"><header className="flex items-center justify-between"><Link href="/" className="text-xl font-bold">Joy<span className="text-berry">Bundle</span></Link><span className="text-sm font-semibold text-ink/60">Bangalore</span></header><div className="py-12"><p className="text-sm font-bold uppercase tracking-[0.18em] text-berry">Shop by budget</p><h1 className="mt-3 text-4xl font-bold">{band.label} return gifts</h1><p className="mt-4 max-w-2xl text-ink/65">Small surprises, thoughtfully bundled for your little guests.</p><div className="mt-8"><BudgetLinks /></div><section className="mt-12"><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{products.map((product) => <ProductCard key={product.product_code} product={product} />)}</div>{products.length === 0 ? <div className="rounded-2xl border border-dashed border-ink/20 bg-white p-8 text-center"><p className="font-bold">Bundles are being curated for this budget.</p><p className="mt-2 text-sm text-ink/60">Check back soon or enquire about a custom bundle.</p></div> : null}</section></div></div></main>;
}
