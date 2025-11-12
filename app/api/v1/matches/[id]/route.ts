
// import { createClient } from '@/utils/supabase/server';
// import { NextResponse } from 'next/server';

// export async function GET({ params }: { params: { id: string } }) {
//   const supabase = await createClient();
//   const { id } = params;

//   const {
//     data: { user },
//   } = await supabase.auth.getUser();

//   if (!user) {
//     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//   }

//   const { data: match, error } = await supabase
//     .from('matches')
//     .select('*, user1:user1_id(*), user2:user2_id(*)') // Fetch related user profiles
//     .eq('id', id)
//     .single();

//   if (error) {
//     console.error('Error fetching match:', error);
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }

//   if (!match) {
//     return NextResponse.json({ error: 'Match not found' }, { status: 404 });
//   }

//   return NextResponse.json(match);
// }
import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(_req: Request, context: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { id } = await context.params;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: match, error } = await supabase
    .from('matches')
    .select(`
      id, status, compatibility_score, created_at,
      user1:profiles!matches_user1_id_fkey ( id, full_name, avatar_url, city, nationality, bio ),
      user2:profiles!matches_user2_id_fkey ( id, full_name, avatar_url, city, nationality, bio )
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!match) return NextResponse.json({ error: 'Match not found' }, { status: 404 });

  return NextResponse.json(match);
}
