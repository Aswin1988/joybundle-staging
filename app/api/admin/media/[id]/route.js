import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/admin';
import { createServiceRoleClient, isServiceRoleConfigured } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function DELETE(_request, { params }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Admin authentication required.' }, { status: 401 });
  if (!isServiceRoleConfigured()) return NextResponse.json({ error: 'Supabase Storage is not configured yet.' }, { status: 503 });
  const { id } = await params;
  const client = createServiceRoleClient();
  const { data: image, error: readError } = await client.from('product_images').select('id,storage_path').eq('id', id).maybeSingle();
  if (readError || !image) return NextResponse.json({ error: 'Image not found.' }, { status: 404 });
  const { error: storageError } = await client.storage.from('product-media').remove([image.storage_path]);
  if (storageError) return NextResponse.json({ error: 'Image storage deletion failed.' }, { status: 502 });
  const { error } = await client.from('product_images').delete().eq('id', id);
  if (error) return NextResponse.json({ error: 'Image record deletion failed.' }, { status: 500 });
  return NextResponse.json({ ok: true });
}
