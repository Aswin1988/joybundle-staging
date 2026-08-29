import { NextResponse } from 'next/server';
import { createAuthServerClient } from '@/lib/supabase/server';

export async function proxy(request) {
  const response = NextResponse.next({ request });
  const client = await createAuthServerClient();
  if (client) await client.auth.getUser();
  return response;
}

export const config = { matcher: ['/admin/:path*'] };
