'use server';

import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // In a real application, you would fetch actual user data from your database.
  // For this example, we'll return some dummy data.
  const userData = {
    user_id: session.user.id,
    email: session.user.email,
    full_name: session.user.user_metadata.full_name,
    settings: {
      email_notifications: true,
      security_alerts: true,
      marketing_emails: false,
      theme: 'system',
      animations: true,
    },
    activity_log: [
      { timestamp: new Date().toISOString(), event: 'Logged in' },
      { timestamp: new Date().toISOString(), event: 'Updated profile' },
    ],
  };

  return new NextResponse(JSON.stringify(userData, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': 'attachment; filename="user_data.json"',
    },
  });
}
