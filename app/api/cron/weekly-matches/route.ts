import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

/**
 * Weekly Matches Cron Job - Runs every Thursday at 4:00 PM
 * Creates weekly matches for all matchable users
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

    console.log('🎯 Starting weekly matches cron job...');

    const supabase = await createClient();

    // 1. Get all matchable users
    const { data: matchableUsers, error: usersError } = await supabase
      .from('profiles')
      .select(`
        *,
        medical_profiles(*),
        user_activities(*),
        user_interests(*)
      `)
      .eq('is_matchable', true);

    if (usersError) {
      console.error('❌ Error fetching matchable users:', usersError);
      return NextResponse.json(
        { error: 'Failed to fetch matchable users', details: usersError },
        { status: 500 }
      );
    }

    if (!matchableUsers || matchableUsers.length === 0) {
      console.log('ℹ️ No matchable users found');
      return NextResponse.json({
        success: true,
        message: 'No matchable users to process',
        matchedUsers: 0,
        groupsCreated: 0,
      });
    }

    console.log(`📊 Found ${matchableUsers.length} matchable users`);

    // 2. TODO: Implement your matching algorithm here
    // For now, this is a placeholder that groups users in sets of 4
    const GROUP_SIZE = 4;
    const groups: Array<{ id: string; name: string; members: string[] }> = [];

    for (let i = 0; i < matchableUsers.length; i += GROUP_SIZE) {
      const groupMembers = matchableUsers.slice(i, i + GROUP_SIZE);
      
      if (groupMembers.length >= 2) { // Need at least 2 people for a group
        groups.push({
          name: `Group ${groups.length + 1} - ${new Date().toLocaleDateString()}`,
          description: `Matched on ${new Date().toLocaleDateString()}`,
          members: groupMembers.map(u => u.user_id),
        });
      }
    }

    console.log(`👥 Created ${groups.length} groups`);

    // 3. Create groups in database
    let groupsCreated = 0;
    let usersMatched = 0;

    for (const group of groups) {
      // Create the group
      const { data: newGroup, error: groupError } = await supabase
        .from('groups')
        .insert({
          name: group.name,
          description: group.description,
        })
        .select()
        .single();

      if (groupError || !newGroup) {
        console.error('❌ Error creating group:', groupError);
        continue;
      }

      // Add members to the group
      const memberInserts = group.members.map((userId: string) => ({
        group_id: newGroup.id,
        user_id: userId,
        role: 'member',
      }));

      const { error: membersError } = await supabase
        .from('group_members')
        .insert(memberInserts);

      if (membersError) {
        console.error('❌ Error adding group members:', membersError);
        continue;
      }

      // Create notifications for each member
      const notifications = group.members.map((userId: string) => ({
        user_id: userId,
        type: 'group',
        title: '🎉 You\'ve been matched!',
        message: `You've been added to ${group.name}. Check it out and start connecting!`,
        link: `/dashboard/groups/${newGroup.id}`,
        metadata: {
          group_id: newGroup.id,
          group_name: group.name,
        },
      }));

      const { error: notifError } = await supabase
        .from('notifications')
        .insert(notifications);

      if (notifError) {
        console.error('❌ Error creating notifications:', notifError);
      }

      groupsCreated++;
      usersMatched += group.members.length;
    }

    console.log(`✅ Successfully created ${groupsCreated} groups with ${usersMatched} users`);

    // 4. Log the activity
    const { error: logError } = await supabase
      .from('activity_logs')
      .insert({
        action: 'weekly_matching_completed',
        details: {
          timestamp: new Date().toISOString(),
          groups_created: groupsCreated,
          users_matched: usersMatched,
          total_matchable_users: matchableUsers.length,
        },
      });

    if (logError) {
      console.error('❌ Error logging activity:', logError);
    }

    return NextResponse.json({
      success: true,
      message: 'Weekly matching completed successfully',
      matchableUsers: matchableUsers.length,
      groupsCreated,
      usersMatched,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('❌ Weekly matches cron job failed:', error);
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


