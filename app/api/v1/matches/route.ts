
import { createClient } from '@/utils/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// export async function GET() {
//   const supabase = await createClient();

//   const {
//     data: { user },
//   } = await supabase.auth.getUser();

//   if (!user) {
//     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//   }

//   const { data: matches, error: matchesError } = await supabase
//     .from('matches')
//     .select('id, user1_id, user2_id, status')
//     .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);

//   if (matchesError) {
//     console.error('Error fetching matches:', matchesError);
//     return NextResponse.json({ error: matchesError.message }, { status: 500 });
//   }

//   const otherUserIds = matches.map(match => match.user1_id === user.id ? match.user2_id : match.user1_id);

//   const { data: profiles, error: profilesError } = await supabase
//     .from('profiles')
//     .select('id, full_name, avatar_url, city, nationality, bio')
//     .in('id', otherUserIds);

//   if (profilesError) {
//     console.error('Error fetching profiles:', profilesError);
//     return NextResponse.json({ error: profilesError.message }, { status: 500 });
//   }

//   const matchesWithProfiles = matches.map(match => {
//     const otherUserId = match.user1_id === user.id ? match.user2_id : match.user1_id;
//     const profile = profiles.find(p => p.id === otherUserId);
//     return {
//       ...match,
//       profile,
//     };
//   });

//   return NextResponse.json(matchesWithProfiles);
// }

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: matches, error: matchesError } = await supabase
    .from('matches')
    .select('id, user1_id, user2_id, status, viewed_by_user1, viewed_by_user2')
    .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);

  if (matchesError) {
    console.error(matchesError);
    return NextResponse.json({ error: matchesError.message }, { status: 500 });
  }

  if (!matches || matches.length === 0) {
    return NextResponse.json([]);
  }

  const otherUserIds = [...new Set(
    matches.map(m => m.user1_id === user.id ? m.user2_id : m.user1_id)
  )].filter(Boolean);

  if (otherUserIds.length === 0) {
    return NextResponse.json(matches.map(m => ({ ...m, profile: null })));
  }

  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url, city, nationality, bio')
    .in('id', otherUserIds);

  if (profilesError) {
    console.error(profilesError);
    return NextResponse.json({ error: profilesError.message }, { status: 500 });
  }

  const matchesWithProfiles = matches.map(m => {
    const otherId = m.user1_id === user.id ? m.user2_id : m.user1_id;
    return { ...m, profile: profiles?.find(p => p.id === otherId) ?? null };
  });

  return NextResponse.json(matchesWithProfiles);
}

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );

  const { matchId, action } = await request.json();

  if (!matchId || !action || !['accept', 'reject'].includes(action)) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { data: match, error: fetchError } = await supabaseAdmin
    .from('matches')
    .select('user1_id, user2_id')
    .eq('id', matchId)
    .single();

  console.log('Fetched match:', match);

  if (fetchError || !match) {
    console.error('Error fetching match:', fetchError);
    return NextResponse.json({ error: 'Match not found' }, { status: 404 });
  }

  let updateData: { status: string; viewed_by_user1?: boolean; viewed_by_user2?: boolean };

  if (action === 'accept') {
    updateData = { status: 'accepted' };

    // Create a group for the match
    const { data: profiles, error: profilesError } = await supabaseAdmin
        .from('profiles')
        .select('id, full_name')
        .in('id', [match.user1_id, match.user2_id]);

    console.log('Fetched profiles:', profiles);

    if (profilesError || !profiles) {
        console.error('Error fetching profiles:', profilesError);
        return NextResponse.json({ error: 'Failed to get user profiles' }, { status: 500 });
    }

    const user1 = profiles.find(p => p.id === match.user1_id);
    const user2 = profiles.find(p => p.id === match.user2_id);

    const groupName = `Match: ${user1?.full_name} and ${user2?.full_name}`;

    const { data: group, error: groupError } = await supabaseAdmin
      .from('groups')
      .insert({
        name: groupName,
        created_by: user.id,
      })
      .select()
      .single();

    console.log('Created group:', group);

    if (groupError || !group) {
      console.error('Error creating group:', groupError);
      return NextResponse.json({ error: 'Failed to create group' }, { status: 500 });
    }

    // Add the two matched users
    const membersToAdd = [
      { group_id: group.id, user_id: match.user1_id },
      { group_id: group.id, user_id: match.user2_id },
    ];

    // Try to add 1-2 additional members to make group size 3-4
    // Find other users who are matchable and not already in this match
    const { data: allMatchableUsers, error: findUsersError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('is_matchable', true)
      .neq('id', match.user1_id)
      .neq('id', match.user2_id)
      .limit(10); // Get more than needed for randomization

    if (!findUsersError && allMatchableUsers && allMatchableUsers.length > 0) {
      // Randomly shuffle and select 1-2 additional members
      const shuffled = allMatchableUsers.sort(() => 0.5 - Math.random());
      const numAdditional = Math.min(Math.floor(Math.random() * 2) + 1, shuffled.length);
      const selectedUsers = shuffled.slice(0, numAdditional);
      
      selectedUsers.forEach((user: { id: string }) => {
        membersToAdd.push({
          group_id: group.id,
          user_id: user.id,
        });
      });
      
      console.log(`Adding ${membersToAdd.length} members to group (${numAdditional} additional)`);
    } else {
      console.log('Adding 2 members to group (no additional members found)');
    }

    const { error: memberError } = await supabaseAdmin
      .from('group_members')
      .insert(membersToAdd);

    if (memberError) {
      console.error('Error adding members to group:', memberError);
      return NextResponse.json({ error: 'Failed to add members to group' }, { status: 500 });
    }

    console.log(`✅ Added ${membersToAdd.length} members to group`);

    // Return group ID so frontend can redirect
    if (match.user1_id === user.id) {
      updateData.viewed_by_user1 = true;
    } else if (match.user2_id === user.id) {
      updateData.viewed_by_user2 = true;
    } else {
      return NextResponse.json({ error: 'User not part of this match' }, { status: 403 });
    }

    const { error } = await supabaseAdmin
      .from('matches')
      .update(updateData)
      .eq('id', matchId);

    console.log('Updated match status');

    if (error) {
      console.error('Error updating match status:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      message: `Match ${matchId} ${action}ed successfully`,
      groupId: group.id 
    });
  } else {
    updateData = { status: 'rejected' };
  }

  if (match.user1_id === user.id) {
    updateData.viewed_by_user1 = true;
  } else if (match.user2_id === user.id) {
    updateData.viewed_by_user2 = true;
  } else {
    return NextResponse.json({ error: 'User not part of this match' }, { status: 403 });
  }

  const { error } = await supabaseAdmin
    .from('matches')
    .update(updateData)
    .eq('id', matchId);

  console.log('Updated match status');

  if (error) {
    console.error('Error updating match status:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: `Match ${matchId} ${action}ed successfully` });
}
