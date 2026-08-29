import Link from 'next/link';
import WhatsAppLink from './WhatsAppLink';

export default function SiteFooter({ whatsappUrl = '' }) {
  return (
    <footer className="border-t border-ink/10 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-5 px-5 py-8 text-sm sm:px-8 lg:flex-row lg:items-center lg:justify-between">
        <div><p className="font-bold">Joy<span className="text-berry">Bundle</span></p><p className="mt-1 text-ink/60">Little gifts. Big smiles. Bangalore delivery.</p></div>
        <nav className="flex flex-wrap gap-x-4 gap-y-2 text-ink/70" aria-label="Footer">
          <Link href="/delivery-policy">Delivery</Link><Link href="/cancellation-policy">Cancellations</Link><Link href="/damage-replacement-policy">Damage &amp; replacement</Link><Link href="/privacy-policy">Privacy</Link><Link href="/terms">Terms</Link><WhatsAppLink href={whatsappUrl} className="font-bold text-berry">WhatsApp support</WhatsAppLink>
        </nav>
      </div>
    </footer>
  );
}
