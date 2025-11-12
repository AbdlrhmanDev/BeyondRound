'use client';

import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';

interface Group {
  id: string;
  name: string;
  description: string;
  avatar_url: string;
}

export default function MessagesPage() {
  const router = useRouter();
  const supabase = createClient();

  const [userGroups, setUserGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserAndGroups = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        try {
          // Fetch groups the user is a member of
          const { data: groupMemberships, error: membershipsError } = await supabase
            .from('group_members')
            .select(`
              group_id,
              groups!group_members_group_id_fkey (id, name, description, avatar_url)
            `)
            .eq('user_id', user.id);

          if (membershipsError) throw membershipsError;

          const groups = (groupMemberships || [])
            .map((membership) => membership.groups)
            .filter((group): group is Group => group !== null && typeof group === 'object' && 'id' in group);
          setUserGroups(groups);

        } catch (err: unknown) {
          setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
        setError('User not logged in.');
      }
    };

    fetchUserAndGroups();
  }, [supabase]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-full">
          <p>Loading your groups...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-full text-red-500">
          <p>Error: {error}</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Your Chats</h2>
          <p className="text-muted-foreground">
            Select a group to start chatting.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-6">
          {userGroups.length > 0 ? (
            userGroups.map((group) => (
              <Card key={group.id}>
                <CardHeader className="items-center">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={group.avatar_url || 'https://github.com/shadcn.png'} alt={group.name} />
                    <AvatarFallback>{group.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="font-semibold">{group.name}</p>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{group.description}</p>
                  <div className="mt-4 flex justify-center gap-2">
                    <Button size="sm" onClick={() => router.push(`/dashboard/messages/${group.id}`)}>
                      Open Chat
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="col-span-full text-center text-muted-foreground">You are not a member of any groups yet. Join a group to start chatting!</p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
