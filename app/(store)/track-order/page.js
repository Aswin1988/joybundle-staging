import TrackOrderClient from '@/components/store/TrackOrderClient';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Track your JoyBundle order', description: 'Check your JoyBundle order status using your order number and mobile number.', robots: { index: false, follow: true } };

export default function TrackOrderPage() { return <TrackOrderClient />; }
