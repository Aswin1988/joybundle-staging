import { redirect } from 'next/navigation';
import Link from 'next/link';
import AdminShell from '@/components/admin/AdminShell';
import { getAdminContext } from '@/lib/auth/admin';
import { getAdminProducts } from '@/lib/catalog/admin';
import { formatINR } from '@/lib/pricing/money';

export const dynamic = 'force-dynamic';

export default async function AdminProductsPage() {
  if (!(await getAdminContext())) redirect('/admin/login');
  const products = await getAdminProducts();
  return <AdminShell title="Products" description="Available products are normally offered and may still depend on local sourcing.">
    <div className="mb-5 flex justify-end"><Link href="/admin/products/new" className="rounded-full bg-ink px-5 py-3 text-sm font-bold text-white">Add product</Link></div>
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{products.map((product) => <Link key={product.id} href={`/admin/products/${product.id}`} className="rounded-2xl border border-ink/10 bg-white p-5 hover:border-berry"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wider text-berry">{product.product_code}</p><h2 className="mt-2 text-lg font-bold">{product.name}</h2></div><span className={`rounded-full px-2 py-1 text-xs font-bold ${product.active ? 'bg-mint text-ink' : 'bg-ink/10 text-ink/60'}`}>{product.active ? 'Available' : 'Inactive'}</span></div><p className="mt-4 text-sm text-ink/65">{product.short_description}</p><p className="mt-5 font-bold">{formatINR(product.price_paise)}</p></Link>)}{products.length === 0 ? <div className="rounded-2xl border border-dashed border-ink/20 bg-white p-8 text-sm text-ink/60">No products yet.</div> : null}</div>
  </AdminShell>;
}
