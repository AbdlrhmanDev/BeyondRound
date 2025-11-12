'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { AdminLayout } from '@/components/admin/admin-layout';
import { AnalyticsDashboard } from '@/components/admin/analytics-dashboard';
import { createClient } from '@/utils/supabase/client';

export default function AdminAnalyticsPage() {
  const supabase = useMemo(() => createClient(), []);
  const [analyticsData, setAnalyticsData] = useState({
    totalUsers: 0,
    activeUsers: 0,
    newUsersThisWeek: 0,
    newUsersLastWeek: 0,
    onboardingCompletionRate: 0,
    matchableUsers: 0,
    totalGroups: 0,
    totalMatches: 0,
    matchesThisWeek: 0,
    matchesLastWeek: 0,
    totalNotifications: 0,
    notificationReadRate: 0,
    averageResponseTime: 24,
  });
  const [isLoading, setIsLoading] = useState(true);

  const loadAnalytics = useCallback(async () => {
    try {
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

      // Load user data
      const { data: usersData, count: totalUsers } = await supabase
        .from('profiles')
        .select('id, is_onboarding_complete, is_matchable, created_at', { count: 'exact' });

      const activeUsers = usersData?.filter(u => u.is_onboarding_complete).length || 0;
      const matchableUsers = usersData?.filter(u => u.is_matchable).length || 0;
      const newUsersThisWeek = usersData?.filter(u => 
        new Date(u.created_at) >= weekAgo
      ).length || 0;
      const newUsersLastWeek = usersData?.filter(u => 
        new Date(u.created_at) >= twoWeeksAgo && new Date(u.created_at) < weekAgo
      ).length || 0;

      // Load groups and matches
      const { count: totalGroups } = await supabase
        .from('groups')
        .select('id', { count: 'exact' });

      const { data: matchesData, count: totalMatches } = await supabase
        .from('matches')
        .select('id, created_at', { count: 'exact' });

      const matchesThisWeek = matchesData?.filter(m => 
        new Date(m.created_at) >= weekAgo
      ).length || 0;
      const matchesLastWeek = matchesData?.filter(m => 
        new Date(m.created_at) >= twoWeeksAgo && new Date(m.created_at) < weekAgo
      ).length || 0;

      // Load notifications
      const { data: notificationsData, count: totalNotifications } = await supabase
        .from('notifications')
        .select('id, is_read', { count: 'exact' });

      const readNotifications = notificationsData?.filter(n => n.is_read).length || 0;
      const notificationReadRate = totalNotifications 
        ? Math.round((readNotifications / totalNotifications) * 100)
        : 0;

      setAnalyticsData({
        totalUsers: totalUsers || 0,
        activeUsers,
        newUsersThisWeek,
        newUsersLastWeek,
        onboardingCompletionRate: totalUsers 
          ? Math.round((activeUsers / totalUsers) * 100)
          : 0,
        matchableUsers,
        totalGroups: totalGroups || 0,
        totalMatches: totalMatches || 0,
        matchesThisWeek,
        matchesLastWeek,
        totalNotifications: totalNotifications || 0,
        notificationReadRate,
        averageResponseTime: 24, // Placeholder
      });

      setIsLoading(false);
    } catch (error) {
      console.error('Error loading analytics:', error);
      setIsLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading analytics...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive analytics and insights about your platform
          </p>
        </div>
        <AnalyticsDashboard data={analyticsData} />
      </div>
    </AdminLayout>
  );
}

