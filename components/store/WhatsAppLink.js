'use client';

import { trackEvent } from '@/lib/analytics';

export default function WhatsAppLink({ href, children, className = '' }) {
  if (!href) return null;
  return <a href={href} target="_blank" rel="noreferrer" className={className} onClick={() => trackEvent('whatsapp_clicked')}>{children}</a>;
}
