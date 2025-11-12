import { createClient } from '@/utils/supabase/client';

export interface UserLoginInfo {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  is_onboarding_complete: boolean;
  is_matchable: boolean;
  is_admin: boolean;
  admin_role: 'super_admin' | 'admin' | null;
  redirect_path: string;
  created_at: string;
  updated_at: string;
}

// Get user login info including redirect path
export async function getUserLoginInfo(userId: string): Promise<{ data: UserLoginInfo | null; error: Error | null }> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('user_login_info')
    .select('*')
    .eq('id', userId)
    .single();
  
  return { data, error };
}

// Get redirect path for user
export async function getUserRedirectPath(userId: string): Promise<string> {
  const supabase = createClient();
  
  // Try using RPC function first
  const { data: redirectPath } = await supabase.rpc('get_user_redirect_path', {
    p_user_id: userId
  });
  
  if (redirectPath) {
    return redirectPath;
  }
  
  // Fallback to view query
  const { data: userInfo } = await getUserLoginInfo(userId);
  
  return userInfo?.redirect_path || '/onboarding';
}

export async function login(email: string, password: string) {
  const supabase = createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;

  return data;
}

export async function logout() {
  const supabase = createClient();

  const { error } = await supabase.auth.signOut();

  if (error) throw error;
}

export async function signup(email: string, password: string) {
  const supabase = createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) throw error;

  return data;
}

export async function updatePassword(password: string) {
  const supabase = createClient();

  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) throw error;
}
