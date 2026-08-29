import CartClient from '@/components/store/CartClient';
import { getSettings } from '@/lib/catalog/public';

export const dynamic = 'force-dynamic';

export default async function CartPage() {
  const settings = await getSettings();
  return <CartClient minimumOrderValuePaise={settings.MIN_ORDER_VALUE_PAISE} />;
}
