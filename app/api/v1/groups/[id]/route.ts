// import { createClient } from '@/utils/supabase/server';
// import { NextResponse } from 'next/server';

// export async function GET(request: Request, { params }: { params: { id: string } }) {
//   const supabase = await createClient();
//   const { id: groupId } = await params;

//   const {
//     data: { user },
//   } = await supabase.auth.getUser();

//   if (!user) {
//     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//   }

//   const { data: group, error } = await supabase
//     .from('groups')
//     .select('*')
//     .eq('id', groupId)
//     .single();

//   if (error || !group) {
//     console.error('Error fetching group:', error);
//     return NextResponse.json({ error: 'Group not found' }, { status: 404 });
//   }

//   return NextResponse.json(group);
// }


import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(_req: Request, context: { params: { id: string } }) {
  const supabase = await createClient();
  const groupId = context.params.id;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: group, error } = await supabase
    .from('groups')
    .select('*')
    .eq('id', groupId)
    .single();

  if (error || !group) {
    console.error(error);
    return NextResponse.json({ error: 'Group not found' }, { status: 404 });
  }

  return NextResponse.json(group);
}
