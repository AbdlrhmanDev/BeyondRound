'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateSettings(settings: {
  email_notifications: boolean;
  security_alerts: boolean;
  marketing_emails: boolean;
  theme: 'light' | 'dark' | 'system';
  animations: boolean;
}) {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error('Unauthorized');
  }

  const { data, error } = await supabase
    .from('profiles')
    .update({
      email_notifications: settings.email_notifications,
      security_alerts: settings.security_alerts,
      marketing_emails: settings.marketing_emails,
      theme: settings.theme,
      interface_animations: settings.animations,
    })
    .eq('id', session.user.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating settings:', error);
    throw new Error('Failed to update settings');
  }

  revalidatePath('/dashboard/settings');

  return data;
}
