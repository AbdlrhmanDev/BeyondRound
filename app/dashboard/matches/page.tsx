
'use client';

import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, MessageCircle, UserPlus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';

interface Match {
  id: string;
  status: string;
  profile: {
    id: string;
    full_name: string;
    avatar_url: string;
    city: string;
    nationality: string;
    bio: string;
  };
}

export default function MatchesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await fetch('/api/matches');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: Match[] = await response.json();
        setMatches(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  const filteredMatches = matches.filter(match =>
    match.profile.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    match.profile.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    match.profile.bio.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleConnect = async (matchId: string) => {
    try {
      const response = await fetch('/api/matches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ matchId, action: 'accept' }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
          }

      const result = await response.json();
      
      // If API returned groupId, redirect to chat directly
      if (result.groupId) {
        window.location.href = `/dashboard/messages/${result.groupId}`;
      } else {
        // Otherwise, try to find existing group
        await handleMessage(matchId);
      }

    } catch (err: unknown) {
      alert(`Error connecting: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleMessage = async (matchId: string) => {
    try {
      // First, check if a group already exists for this match
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        alert('Please log in first');
        return;
      }

      // Get the match to find the other user
      const match = matches.find(m => m.id === matchId);
      if (!match) {
        alert('Match not found');
        return;
      }

      // Find group that contains both users
      const { data: groups, error: groupsError } = await supabase
        .from('group_members')
        .select(`
          group_id,
          groups!group_members_group_id_fkey (id, name)
        `)
        .eq('user_id', user.id);

      if (groupsError) {
        console.error('Error fetching groups:', groupsError);
        // Try to connect first (creates group)
        await handleConnect(matchId);
        return;
      }

      // Find group that contains the matched user
      if (groups && groups.length > 0) {
        for (const member of groups) {
          const group = Array.isArray(member.groups) ? member.groups[0] : member.groups;
          if (group) {
            // Check if the matched user is also in this group
            const { data: otherMember } = await supabase
              .from('group_members')
              .select('user_id')
              .eq('group_id', group.id)
              .eq('user_id', match.profile.id)
              .single();

            if (otherMember) {
              // Group exists, navigate to chat
              window.location.href = `/dashboard/messages/${group.id}`;
              return;
            }
          }
        }
      }

      // No group found, connect first (creates group)
      await handleConnect(matchId);

    } catch (err: unknown) {
      console.error('Error handling message:', err);
      alert(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-full">
          <p>Loading matches...</p>
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
          <h2 className="text-2xl font-bold tracking-tight">Find Matches</h2>
          <p className="text-muted-foreground">
            Connect with other professionals in your field.
          </p>
        </div>

        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, specialty, or location..."
            className="pl-8 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Tabs defaultValue="new">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="new">New Matches</TabsTrigger>
            <TabsTrigger value="recommended">Recommended</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
          </TabsList>
          <TabsContent value="new">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-6">
              {filteredMatches.length > 0 ? (
                filteredMatches.map((match) => (
                  <Card key={match.id}>
                    <CardHeader className="items-center">
                      <Avatar className="w-20 h-20">
                        <AvatarImage src={match.profile.avatar_url || 'https://github.com/shadcn.png'} alt={match.profile.full_name} />
                        <AvatarFallback>{match.profile.full_name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    </CardHeader>
                    <CardContent className="text-center">
                      <p className="font-semibold">{match.profile.full_name}</p>
                      <p className="text-sm text-muted-foreground">{match.profile.city}, {match.profile.nationality}</p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{match.profile.bio}</p>
                      <div className="mt-4 flex justify-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleConnect(match.id)}>
                          <UserPlus className="mr-2 h-4 w-4" />
                          Connect
                        </Button>
                        <Button size="sm" onClick={() => handleMessage(match.id)}>
                          <MessageCircle className="mr-2 h-4 w-4" />
                          Message
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <p className="col-span-full text-center text-muted-foreground">No matches found.</p>
              )}
            </div>
          </TabsContent>
          <TabsContent value="recommended">
            <p className="col-span-full text-center text-muted-foreground mt-6">No recommended matches yet.</p>
          </TabsContent>
          <TabsContent value="favorites">
            <p className="col-span-full text-center text-muted-foreground mt-6">No favorite matches yet.</p>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
