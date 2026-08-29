import { redirect } from 'next/navigation';
import AdminShell from '@/components/admin/AdminShell';
import ProductForm from '@/components/admin/ProductForm';
import { getAdminContext } from '@/lib/auth/admin';
import { getBagOptions } from '@/lib/catalog/admin';

export const dynamic = 'force-dynamic';

export default async function NewProductPage() {
  if (!(await getAdminContext())) redirect('/admin/login');
  return <AdminShell title="Add product" description="Create a bundle that families can browse by budget."><ProductForm bagOptions={await getBagOptions()} /></AdminShell>;
}
