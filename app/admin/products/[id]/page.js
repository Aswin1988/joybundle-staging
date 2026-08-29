import { notFound, redirect } from 'next/navigation';
import AdminShell from '@/components/admin/AdminShell';
import ProductForm from '@/components/admin/ProductForm';
import { getAdminContext } from '@/lib/auth/admin';
import { getAdminProduct, getBagOptions } from '@/lib/catalog/admin';

export const dynamic = 'force-dynamic';

export default async function EditProductPage({ params }) {
  if (!(await getAdminContext())) redirect('/admin/login');
  const { id } = await params;
  const [product, bagOptions] = await Promise.all([getAdminProduct(id), getBagOptions()]);
  if (!product) notFound();
  return <AdminShell title="Edit product" description="Update the bundle details, economics, and availability."><ProductForm product={product} bagOptions={bagOptions} /></AdminShell>;
}
