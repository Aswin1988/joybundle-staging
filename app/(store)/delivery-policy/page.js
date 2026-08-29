import PolicyPage from '@/components/store/PolicyPage';
import { getSettings } from '@/lib/catalog/public';

export const metadata = { title: 'Delivery policy | JoyBundle', description: 'JoyBundle delivery information for Bangalore orders.', alternates: { canonical: '/delivery-policy' } };

export default async function DeliveryPolicy() {
  const settings = await getSettings();
  return <PolicyPage eyebrow="Delivery" title="Delivery policy" intro={`JoyBundle currently delivers birthday return gifts within ${settings.SERVICE_CITY}.`} sections={[{ heading: 'Delivery timing', paragraphs: [`Standard preparation lead time is ${settings.STANDARD_LEAD_TIME_DAYS} days. Delivery timing can vary with location, order size, personalization, and party requirements.`, `${settings.DELIVERY_CHARGE_NOTE} ${settings.RUSH_ORDER_NOTE}`] }, { heading: 'Before we confirm', paragraphs: ['We check product and bag availability, confirm your delivery details and party date, then share the final amount. No payment is required when submitting an order request.'] }]} />;
}
