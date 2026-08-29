import Link from 'next/link';
import { PRICE_BANDS } from '@/lib/config/business';

export default function BudgetLinks() {
  return <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{PRICE_BANDS.map((band) => <Link key={band.slug} href={`/shop/${band.slug}`} className="rounded-2xl border border-ink/10 bg-white p-4 text-sm font-bold transition hover:border-berry hover:bg-peach/10">{band.label}<span className="ml-2 text-berry">→</span></Link>)}</div>;
}
