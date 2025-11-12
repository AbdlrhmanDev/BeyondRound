'use client';

import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

interface Group {
  id: string;
  name: string;
  description: string;
  avatar_url: string;
  isMember: boolean;
}

export default function GroupsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserAndGroups = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('User not logged in');
        setLoading(false);
        return;
      }

      try {
        // Fetch only groups where user is a member
        const response = await fetch('/api/v1/groups?filter=my-groups');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: Group[] = await response.json();

        // All groups returned are already user's groups
        const groupsWithMembership = data.map((group) => ({
          ...group,
          isMember: true, // User is already a member since we filtered
        }));
        setGroups(groupsWithMembership);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndGroups();
  }, []);


  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-full">
          <p>Loading groups...</p>
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
          <h2 className="text-2xl font-bold tracking-tight">My Groups</h2>
          <p className="text-muted-foreground">
            Groups you are matched with and belong to.
          </p>
        </div>

        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or description..."
            className="pl-8 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-6">
          {filteredGroups.length > 0 ? (
            filteredGroups.map((group) => (
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
                    <Button 
                      size="sm" 
                      onClick={() => router.push(`/dashboard/messages/${group.id}`)}
                    >
                      Open Chat
                      </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="col-span-full text-center text-muted-foreground">No groups found.</p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
