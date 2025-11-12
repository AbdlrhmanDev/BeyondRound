import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

/**
 * Feedback Request Cron Job - Runs every Monday at 10:00 AM
 * Requests feedback from group members after weekend meetings
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

    console.log('💭 Starting feedback request cron job...');

    const supabase = await createClient();

    // Get groups created in the past week (excluding last 3 days to give time for meeting)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const { data: recentGroups, error: groupsError } = await supabase
      .from('groups')
      .select(`
        id,
        name,
        created_at,
        group_members(user_id)
      `)
      .gte('created_at', sevenDaysAgo.toISOString())
      .lt('created_at', threeDaysAgo.toISOString());

    if (groupsError) {
      console.error('❌ Error fetching recent groups:', groupsError);
      return NextResponse.json(
        { error: 'Failed to fetch recent groups', details: groupsError },
        { status: 500 }
      );
    }

    if (!recentGroups || recentGroups.length === 0) {
      console.log('ℹ️ No recent groups to request feedback for');
      return NextResponse.json({
        success: true,
        message: 'No recent groups to request feedback for',
        notificationsSent: 0,
      });
    }

    console.log(`📊 Found ${recentGroups.length} groups to request feedback for`);

    let notificationsSent = 0;

    // For each group, send feedback requests to members who haven't submitted
    for (const group of recentGroups) {
      if (!group.group_members || group.group_members.length === 0) continue;

      for (const member of group.group_members) {
        // Check if user has already submitted feedback
        const { data: existingFeedback } = await supabase
          .from('group_feedback')
          .select('id')
          .eq('group_id', group.id)
          .eq('user_id', member.user_id)
          .single();

        if (existingFeedback) {
          continue; // User already submitted feedback
        }

        // Create notification
        const { error: notifError } = await supabase
          .from('notifications')
          .insert({
            user_id: member.user_id,
            type: 'system',
            title: 'How was your weekend meetup? 💭',
            message: `Please share feedback about your experience with ${group.name}`,
            link: `/dashboard/groups/${group.id}`,
            metadata: {
              group_id: group.id,
              group_name: group.name,
              action_required: true,
              feedback_request: true,
            },
          });

        if (!notifError) {
          notificationsSent++;
        } else {
          console.error(`❌ Error creating notification for user ${member.user_id}:`, notifError);
        }
      }
    }

    console.log(`✅ Successfully sent ${notificationsSent} feedback requests`);

    return NextResponse.json({
      success: true,
      message: 'Feedback requests sent successfully',
      groupsProcessed: recentGroups.length,
      notificationsSent,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('❌ Feedback request cron job failed:', error);
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


