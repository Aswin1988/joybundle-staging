import { NextResponse } from 'next/server';
import { getBagOptions } from '@/lib/catalog/admin';
import { requireAdmin } from '@/lib/auth/admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Admin authentication required.' }, { status: 401 });
  return NextResponse.json({ bagOptions: await getBagOptions() });
}
