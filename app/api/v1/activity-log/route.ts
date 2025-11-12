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

  // This is a placeholder for a real activity log.
  // In a real application, you would want to log important events to a separate table.
  const activityLog = [
    {
      id: 1,
      timestamp: new Date().toISOString(),
      activity: 'Logged in',
      ip_address: '127.0.0.1',
    },
    {
      id: 2,
      timestamp: new Date(new Date().getTime() - 1000 * 60 * 60).toISOString(),
      activity: 'Updated profile',
      ip_address: '127.0.0.1',
    },
    {
      id: 3,
      timestamp: new Date(new Date().getTime() - 1000 * 60 * 60 * 24).toISOString(),
      activity: 'Changed password',
      ip_address: '127.0.0.1',
    },
  ];

  return new NextResponse(JSON.stringify(activityLog), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
