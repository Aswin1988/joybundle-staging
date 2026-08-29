import { redirect } from 'next/navigation';
import Link from 'next/link';
import AdminShell from '@/components/admin/AdminShell';
import { getAdminContext } from '@/lib/auth/admin';
import { getAdminProducts } from '@/lib/catalog/admin';
import { formatINR } from '@/lib/pricing/money';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  if (!(await getAdminContext())) redirect('/admin/login');
  const products = await getAdminProducts();
  const active = products.filter((product) => product.active).length;
  const featured = products.filter((product) => product.is_featured).length;
  const bestsellers = products.filter((product) => product.is_bestseller).length;
  return <AdminShell title="JoyBundle Admin" description="Keep your bundle catalog fresh as local availability changes.">
    <div className="grid gap-4 sm:grid-cols-3">
      {[['Active products', active], ['Featured products', featured], ['Bestsellers', bestsellers]].map(([label, value]) => <div key={label} className="rounded-2xl border border-ink/10 bg-white p-5"><p className="text-sm text-ink/60">{label}</p><p className="mt-2 text-3xl font-bold">{value}</p></div>)}
    </div>
    <div className="mt-8 flex flex-wrap items-center justify-between gap-4"><div><h2 className="text-xl font-bold">Products</h2><p className="mt-1 text-sm text-ink/60">Manage bundles, pricing, contents, bags, and availability.</p></div><Link href="/admin/products/new" className="rounded-full bg-ink px-5 py-3 text-sm font-bold text-white">Add product</Link></div>
    <div className="mt-4 overflow-hidden rounded-2xl border border-ink/10 bg-white"><div className="divide-y divide-ink/10">{products.slice(0, 8).map((product) => <Link key={product.id} href={`/admin/products/${product.id}`} className="flex items-center justify-between gap-4 p-4 hover:bg-cream"><div><p className="font-bold">{product.name}</p><p className="mt-1 text-xs text-ink/55">{product.product_code} · {product.active ? 'Available' : 'Inactive'}</p></div><span className="text-sm font-bold">{formatINR(product.price_paise)}</span></Link>)}{products.length === 0 ? <p className="p-6 text-sm text-ink/60">No products yet. Add your first bundle.</p> : null}</div></div>
  </AdminShell>;
}
