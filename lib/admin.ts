import { createClient } from '@/utils/supabase/server';

/**
 * Check if the current user is an admin (any admin role)
 */
export async function checkIsAdmin(): Promise<boolean> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return false;

  const { data: adminRole } = await supabase
    .from('admin_roles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  return !!adminRole;
}

/**
 * Check if the current user is a super admin
 */
export async function checkIsSuperAdmin(): Promise<boolean> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return false;

  const { data: adminRole } = await supabase
    .from('admin_roles')
    .select('role')
    .eq('user_id', user.id)
    .eq('role', 'super_admin')
    .single();

  return !!adminRole;
}

/**
 * Get admin role for the current user
 */
export async function getAdminRole(): Promise<'super_admin' | 'admin' | null> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;

  const { data: adminRole } = await supabase
    .from('admin_roles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  return (adminRole?.role as 'super_admin' | 'admin') || null;
}

