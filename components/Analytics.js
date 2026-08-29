'use client';

import Script from 'next/script';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { trackEvent } from '@/lib/analytics';

export default function Analytics({ measurementId = '' }) {
  const pathname = usePathname();
  useEffect(() => {
    if (pathname === '/') trackEvent('homepage_view');
    else if (pathname.startsWith('/shop/')) trackEvent('budget_category_view');
    else if (pathname.startsWith('/bundles/')) trackEvent('bundle_view');
  }, [pathname]);
  if (!measurementId) return null;
  const safeMeasurementId = JSON.stringify(measurementId);
  return <><Script src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`} strategy="afterInteractive" /><Script id="joybundle-gtag" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}window.gtag=gtag;gtag('js',new Date());gtag('config',${safeMeasurementId},{send_page_view:false});`}</Script></>;
}
