import Link from 'next/link';

export default function AdminShell({ children, title, description }) {
  return (
    <main className="min-h-screen bg-cream">
      <header className="border-b border-ink/10 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <Link href="/admin" className="text-xl font-bold tracking-tight">Joy<span className="text-berry">Bundle</span> <span className="text-sm font-medium text-ink/50">Admin</span></Link>
          <nav className="flex items-center gap-4 text-sm font-semibold text-ink/70"><Link href="/admin/products">Products</Link><Link href="/">View store</Link></nav>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
        <div className="mb-8"><h1 className="text-3xl font-bold">{title}</h1>{description ? <p className="mt-2 text-sm text-ink/65">{description}</p> : null}</div>
        {children}
      </div>
    </main>
  );
}
