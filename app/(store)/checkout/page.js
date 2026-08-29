import CheckoutClient from '@/components/store/CheckoutClient';
import { getSettings } from '@/lib/catalog/public';

export const dynamic = 'force-dynamic';

export default async function CheckoutPage() {
  const settings = await getSettings();
  return <CheckoutClient minimumOrderValuePaise={settings.MIN_ORDER_VALUE_PAISE} deliveryChargeNote={settings.DELIVERY_CHARGE_NOTE} />;
}
