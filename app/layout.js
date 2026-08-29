import './globals.css';
import Analytics from '@/components/Analytics';

export const metadata = {
  title: 'JoyBundle | Birthday return gifts made easy',
  description: 'Customized kids’ birthday return-gift bundles in Bangalore.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: { type: 'website', siteName: 'JoyBundle', title: 'JoyBundle | Birthday return gifts made easy', description: 'Customized kids’ birthday return-gift bundles in Bangalore.' },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en-IN">
      <body><Analytics measurementId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />{children}</body>
    </html>
  );
}
