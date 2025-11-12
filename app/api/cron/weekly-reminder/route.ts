import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

/**
 * Weekly Reminder Cron Job - Runs every Thursday at 4:00 PM
 * Sends reminders to matchable users about upcoming matching
 */
export async function POST(request: NextRequest) {
  try {
    // Verify the cron secret
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (token !== process.env.CRON_SECRET) {
      console.error('❌ Unauthorized cron request - Invalid token');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('📢 Starting weekly reminder cron job...');

    const supabase = await createClient();

    // Get all matchable users
    const { data: matchableUsers, error: usersError } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('is_matchable', true);

    if (usersError) {
      console.error('❌ Error fetching matchable users:', usersError);
      return NextResponse.json(
        { error: 'Failed to fetch matchable users', details: usersError },
        { status: 500 }
      );
    }

    if (!matchableUsers || matchableUsers.length === 0) {
      console.log('ℹ️ No matchable users to notify');
      return NextResponse.json({
        success: true,
        message: 'No matchable users to notify',
        notificationsSent: 0,
      });
    }

    console.log(`📊 Found ${matchableUsers.length} matchable users to notify`);

    // Create notifications for all matchable users
    const notifications = matchableUsers.map(user => ({
      user_id: user.user_id,
      type: 'system',
      title: 'Matching Day Reminder! 🎯',
      message: 'Groups will be created soon. Make sure your profile is up to date!',
      link: '/dashboard/profile',
      metadata: {
        reminder_type: 'weekly_matching',
        sent_at: new Date().toISOString(),
      },
    }));

    const { error: notifError } = await supabase
      .from('notifications')
      .insert(notifications);

    if (notifError) {
      console.error('❌ Error creating notifications:', notifError);
      return NextResponse.json(
        { error: 'Failed to create notifications', details: notifError },
        { status: 500 }
      );
    }

    console.log(`✅ Successfully sent ${notifications.length} reminders`);

    return NextResponse.json({
      success: true,
      message: 'Weekly reminders sent successfully',
      notificationsSent: notifications.length,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('❌ Weekly reminder cron job failed:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// Prevent caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;


