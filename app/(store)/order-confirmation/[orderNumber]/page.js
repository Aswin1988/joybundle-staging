import ConfirmationClient from '@/components/store/ConfirmationClient';
import { getSettings } from '@/lib/catalog/public';
import { normalizeWhatsAppNumber } from '@/lib/orders/whatsapp';

export const metadata = { title: 'Order received | JoyBundle', robots: { index: false, follow: false } };

export default async function OrderConfirmationPage({ params }) {
  const { orderNumber } = await params;
  const settings = await getSettings();
  return <ConfirmationClient orderNumber={decodeURIComponent(orderNumber)} whatsappNumber={normalizeWhatsAppNumber(settings.WHATSAPP_NUMBER)} />;
}
