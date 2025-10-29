'use client';

import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';

interface Group {
  id: string;
  name: string;
  description: string;
  avatar_url: string;
  created_by: string;
  member_count: number;
}

export default function GroupDetailsPage() {
  const params = useParams();
  const groupId = params.id as string;
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!groupId) return;

    const fetchGroupDetails = async () => {
      try {
        const response = await fetch(`/api/groups/${groupId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: Group = await response.json();
        setGroup(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGroupDetails();
  }, [groupId]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-full">
          <p>Loading group details...</p>
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

  if (!group) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-full">
          <p>Group not found.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center space-x-4">
            <Avatar className="w-24 h-24">
              <AvatarImage src={group.avatar_url || 'https://github.com/shadcn.png'} alt={group.name} />
              <AvatarFallback>{group.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-3xl">{group.name}</CardTitle>
              <p className="text-muted-foreground">Members: {group.member_count}</p>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-lg mb-4">{group.description}</p>

          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
