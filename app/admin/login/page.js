'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserSupabaseClient } from '@/lib/supabase/browser';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    const client = createBrowserSupabaseClient();
    if (!client) {
      setMessage('Admin authentication is not configured yet.');
      setBusy(false);
      return;
    }
    const { error } = await client.auth.signInWithPassword({ email: email.trim(), password });
    if (error) {
      setMessage('Sign-in failed. Check your credentials or ask the owner to activate your admin access.');
      setBusy(false);
      return;
    }
    router.replace('/admin');
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-cream px-5 py-10">
      <section className="w-full max-w-md rounded-3xl border border-ink/10 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-berry">JoyBundle Admin</p>
        <h1 className="mt-3 text-3xl font-bold">Sign in</h1>
        <p className="mt-2 text-sm leading-6 text-ink/65">This area is for approved JoyBundle operators only.</p>
        <form className="mt-7 space-y-4" onSubmit={submit}>
          <label className="block text-sm font-semibold">Email<input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-ink/20 px-3 outline-none focus:border-berry" /></label>
          <label className="block text-sm font-semibold">Password<input required type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-ink/20 px-3 outline-none focus:border-berry" /></label>
          {message ? <p role="alert" className="rounded-xl bg-berry/10 p-3 text-sm text-berry">{message}</p> : null}
          <button disabled={busy} className="min-h-12 w-full rounded-full bg-ink px-5 text-sm font-bold text-white disabled:cursor-wait disabled:opacity-60">{busy ? 'Signing in…' : 'Sign in'}</button>
        </form>
      </section>
    </main>
  );
}
