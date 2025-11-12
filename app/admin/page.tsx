'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { AdminLayout } from '@/components/admin/admin-layout';
import { StatsCard } from '@/components/dashboard/stats-card';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/utils/supabase/client';
import { 
  Users, 
  UserCheck, 
  CheckCircle2,
  Shield,
  Activity,
  TrendingUp,
  BarChart3,
  ArrowRight,
  Crown
} from 'lucide-react';
import Link from 'next/link';

interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  completedOnboarding: number;
  matchableUsers: number;
  totalGroups: number;
  totalMatches: number;
  totalNotifications: number;
  unreadNotifications: number;
  totalAdmins: number;
  superAdmins: number;
}

export default function AdminHomePage() {
  const supabase = useMemo(() => createClient(), []);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 0,
    activeUsers: 0,
    completedOnboarding: 0,
    matchableUsers: 0,
    totalGroups: 0,
    totalMatches: 0,
    totalNotifications: 0,
    unreadNotifications: 0,
    totalAdmins: 0,
    superAdmins: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkSuperAdmin() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: isSuper } = await supabase.rpc('is_super_admin', {
        p_user_id: user.id
      });

      setIsSuperAdmin(isSuper || false);
    }
    checkSuperAdmin();
  }, [supabase]);

  const loadAdminData = useCallback(async () => {
    try {
      const [usersRes, groupsRes, matchesRes, notificationsRes, adminsRes] = await Promise.all([
        supabase.from('profiles').select('id, is_onboarding_complete, is_matchable', { count: 'exact' }),
        supabase.from('groups').select('id', { count: 'exact' }),
        supabase.from('matches').select('id', { count: 'exact' }),
        supabase.from('notifications').select('id, is_read', { count: 'exact' }),
        supabase.from('admin_roles').select('id, role', { count: 'exact' }),
      ]);

      const totalUsers = usersRes.count || 0;
      const allUsers = usersRes.data || [];
      const completedOnboarding = allUsers.filter(u => u.is_onboarding_complete).length;
      const matchableUsers = allUsers.filter(u => u.is_matchable).length;
      const totalGroups = groupsRes.count || 0;
      const totalMatches = matchesRes.count || 0;
      const totalNotifications = notificationsRes.count || 0;
      const unreadNotifications = notificationsRes.data?.filter(n => !n.is_read).length || 0;
      const totalAdmins = adminsRes.count || 0;
      const superAdmins = adminsRes.data?.filter(a => a.role === 'super_admin').length || 0;

      setStats({
        totalUsers,
        activeUsers: completedOnboarding,
        completedOnboarding,
        matchableUsers,
        totalGroups,
        totalMatches,
        totalNotifications,
        unreadNotifications,
        totalAdmins,
        superAdmins,
      });
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading admin data:', error);
      setIsLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-foreground">
                Admin Dashboard
              </h1>
              {isSuperAdmin && (
                <Badge variant="default" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                  <Crown className="h-3 w-3 mr-1" />
                  Super Admin
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground">
              Overview of your platform&apos;s key metrics and activities
            </p>
          </div>
          {isSuperAdmin && (
            <Link href="/admin/super-admin">
              <Button variant="outline" className="border-yellow-500/20 text-yellow-500 hover:bg-yellow-500/10">
                <Crown className="h-4 w-4 mr-2" />
                Super Admin Dashboard
              </Button>
            </Link>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Users"
            value={stats.totalUsers.toString()}
            description="Registered users"
            icon={<Users className="h-5 w-5" />}
            delay={0.1}
          />
          <StatsCard
            title="Active Users"
            value={stats.activeUsers.toString()}
            description="Completed onboarding"
            icon={<UserCheck className="h-5 w-5" />}
            delay={0.2}
          />
          <StatsCard
            title="Matchable Users"
            value={stats.matchableUsers.toString()}
            description="Ready for matching"
            icon={<CheckCircle2 className="h-5 w-5" />}
            delay={0.3}
          />
          <StatsCard
            title="Total Groups"
            value={stats.totalGroups.toString()}
            description="Active groups"
            icon={<Users className="h-5 w-5" />}
            delay={0.4}
          />
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Onboarding Completion</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalUsers > 0 
                  ? Math.round((stats.completedOnboarding / stats.totalUsers) * 100)
                  : 0}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.completedOnboarding} of {stats.totalUsers} users
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Matches</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalMatches}</div>
              <p className="text-xs text-muted-foreground mt-1">
                All-time matches created
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Match Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.matchableUsers > 0 
                  ? Math.round((stats.totalGroups / stats.matchableUsers) * 100)
                  : 0}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Users in groups
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/admin/analytics">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Analytics</CardTitle>
                  <BarChart3 className="h-5 w-5 text-primary" />
                </div>
                <CardDescription>View detailed analytics and reports</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" className="w-full justify-between group">
                  <span>View Analytics</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/admin/users">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">User Management</CardTitle>
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <CardDescription>Manage all platform users</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" className="w-full justify-between group">
                  <span>Manage Users</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/admin/admins">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Admin Management</CardTitle>
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <CardDescription>Manage admin users and permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" className="w-full justify-between group">
                  <span>Manage Admins</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Link>
          </Card>
        </div>

        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
            <CardDescription>Platform status and performance metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Database</p>
                  <p className="text-sm text-muted-foreground">Operational</p>
                </div>
              </div>
              <Badge variant="default" className="bg-green-500/10 text-green-500 border-green-500/20">
                Healthy
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Authentication</p>
                  <p className="text-sm text-muted-foreground">Supabase Auth</p>
                </div>
              </div>
              <Badge variant="default" className="bg-green-500/10 text-green-500 border-green-500/20">
                Active
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Activity className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Matching System</p>
                  <p className="text-sm text-muted-foreground">Weekly matches enabled</p>
                </div>
              </div>
              <Badge variant="default" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                Enabled
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
