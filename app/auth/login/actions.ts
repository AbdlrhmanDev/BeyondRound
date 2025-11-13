'use server';

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export async function loginAction(email: string, password: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  if (data.user) {
    // تحقق من دور المستخدم
    const { data: adminRole } = await supabase
      .from('admin_roles')
      .select('role')
      .eq('user_id', data.user.id)
      .maybeSingle();

    // تحقق من حالة onboarding
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_onboarding_complete')
      .eq('id', data.user.id)
      .single();

    // وجّه حسب الدور
    if (adminRole) {
      redirect('/admin/dashboard');
    } else if (!profile?.is_onboarding_complete) {
      redirect('/onboarding');
    } else {
      redirect('/dashboard');
    }
  }

  return { error: 'Login failed - no user data returned' };
}

