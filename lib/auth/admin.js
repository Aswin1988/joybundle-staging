import { createAuthServerClient, createServiceRoleClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { isAllowedAdminRole } from '@/lib/auth/roles';

export async function getAdminContext() {
  if (!isSupabaseConfigured() || !process.env.SUPABASE_SERVICE_ROLE_KEY) return null;
  const authClient = await createAuthServerClient();
  if (!authClient) return null;
  const { data: { user }, error: userError } = await authClient.auth.getUser();
  if (userError || !user) return null;

  const adminClient = createServiceRoleClient();
  const { data: admin, error } = await adminClient
    .from('admin_users')
    .select('user_id, role, active, last_login_at')
    .eq('user_id', user.id)
    .maybeSingle();
  if (error || !admin?.active || !isAllowedAdminRole(admin.role)) return null;
  return { user, admin, client: adminClient };
}

export async function requireAdmin() {
  const context = await getAdminContext();
  return context;
}
