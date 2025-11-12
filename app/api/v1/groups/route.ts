import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get query parameter to filter: 'my-groups' or 'all'
  const { searchParams } = new URL(request.url);
  const filter = searchParams.get('filter') || 'my-groups'; // Default: show only user's groups

  if (filter === 'my-groups') {
    // Only get groups where the user is a member
    const { data: groups, error } = await supabase
      .from('group_members')
      .select(`
        groups!group_members_group_id_fkey (
          id,
          name,
          description,
          avatar_url,
          created_at
        )
      `)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching user groups:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Extract groups from the nested structure
    const userGroups = groups
      ?.map((member: { groups: unknown }) => {
        const group = member.groups;
        return Array.isArray(group) ? group[0] : group;
      })
      .filter((g: unknown) => g !== null && g !== undefined) || [];

    return NextResponse.json(userGroups);
  } else {
    // Get all groups (for admin or public view)
  const { data: groups, error } = await supabase
    .from('groups')
    .select('*');

  if (error) {
    console.error('Error fetching groups:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(groups);
  }
}
