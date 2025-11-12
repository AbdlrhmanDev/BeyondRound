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
  Shield,
  Crown,
  Activity,
  TrendingUp,
  BarChart3,
  Settings,
  Database,
  Lock,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  UserPlus,
  UserX,
  FileText
} from 'lucide-react';
import Link from 'next/link';

interface SuperAdminStats {
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
  regularAdmins: number;
  recentSignups: number;
  systemHealth: 'healthy' | 'warning' | 'error';
}

export default function SuperAdminDashboard() {
  const supabase = useMemo(() => createClient(), []);
  const [stats, setStats] = useState<SuperAdminStats>({
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
    regularAdmins: 0,
    recentSignups: 0,
    systemHealth: 'healthy',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);

  // Check super admin access first
  useEffect(() => {
    let isMounted = true;

    async function checkSuperAdmin() {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          if (isMounted) {
            setIsSuperAdmin(false);
            setIsCheckingAccess(false);
            setIsLoading(false);
          }
          return;
        }

        let isSuper = false;
        let rpcError = null;

        try {
          const result = await supabase.rpc('is_super_admin', {
            p_user_id: user.id
          });
          
          if (result.error) {
            rpcError = result.error;
            // Try fallback: query admin_roles directly
            console.warn('RPC failed, trying fallback query:', rpcError);
            try {
              const { data: adminRole, error: queryError } = await supabase
                .from('admin_roles')
                .select('role')
                .eq('user_id', user.id)
                .eq('role', 'super_admin')
                .maybeSingle();
              
              if (!queryError && adminRole) {
                isSuper = true;
                rpcError = null; // Clear error since fallback worked
              }
            } catch (fallbackError) {
              console.error('Fallback query also failed:', fallbackError);
            }
          } else {
            isSuper = result.data === true;
          }
        } catch (rpcCallError) {
          console.error('Exception calling is_super_admin RPC:', rpcCallError);
          rpcError = rpcCallError instanceof Error ? rpcCallError : new Error(String(rpcCallError));
          
          // Try fallback on exception too
          try {
            const { data: adminRole, error: queryError } = await supabase
              .from('admin_roles')
              .select('role')
              .eq('user_id', user.id)
              .eq('role', 'super_admin')
              .maybeSingle();
            
            if (!queryError && adminRole) {
              isSuper = true;
              rpcError = null;
            }
          } catch (fallbackError) {
            console.error('Fallback query failed:', fallbackError);
          }
        }

        if (!isMounted) return;

        if (rpcError && !isSuper) {
          console.error('Error checking super admin:', rpcError);
          console.error('Error details:', {
            message: rpcError instanceof Error ? rpcError.message : String(rpcError),
            code: (rpcError as any)?.code,
            details: (rpcError as any)?.details,
            hint: (rpcError as any)?.hint
          });
        }
        
        setIsSuperAdmin(isSuper);
        setIsCheckingAccess(false);
      } catch (error) {
        console.error('Error in checkSuperAdmin:', error);
        if (isMounted) {
          setIsSuperAdmin(false);
          setIsCheckingAccess(false);
          setIsLoading(false);
        }
      }
    }

    checkSuperAdmin();

    return () => {
      isMounted = false;
    };
  }, [supabase]);

  const loadSuperAdminData = useCallback(async () => {
    try {
      // Get current user to verify super admin status
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error('Error getting user:', userError);
        setIsLoading(false);
        return;
      }

      const { data: isSuper, error: rpcError } = await supabase.rpc('is_super_admin', {
        p_user_id: user.id
      });

      if (rpcError) {
        console.error('Error checking super admin in loadSuperAdminData:', rpcError);
        setIsLoading(false);
        return;
      }

      if (!isSuper) {
        setIsLoading(false);
        return;
      }

      const [
        usersRes, 
        groupsRes, 
        matchesRes, 
        notificationsRes, 
        adminsRes,
        recentUsersRes
      ] = await Promise.all([
        supabase.from('profiles_with_email').select('id, is_onboarding_complete, is_matchable, created_at', { count: 'exact' }),
        supabase.from('groups').select('id', { count: 'exact' }),
        supabase.from('matches').select('id', { count: 'exact' }),
        supabase.from('notifications').select('id, is_read', { count: 'exact' }),
        // Use RPC function or fallback to direct query with RLS policy
        supabase.from('admin_roles').select('id, role', { count: 'exact' }),
        supabase.from('profiles_with_email')
          .select('created_at')
          .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
          .order('created_at', { ascending: false })
      ]);

      const totalUsers = usersRes.count || 0;
      const allUsers = usersRes.data || [];
      const completedOnboarding = allUsers.filter(u => u.is_onboarding_complete).length;
      const matchableUsers = allUsers.filter(u => u.is_matchable).length;
      const totalGroups = groupsRes.count || 0;
      const totalMatches = matchesRes.count || 0;
      const totalNotifications = notificationsRes.count || 0;
      const unreadNotifications = notificationsRes.data?.filter(n => !n.is_read).length || 0;
      const adminsData = adminsRes.data || [];
      const totalAdmins = adminsRes.count || adminsData.length || 0;
      const superAdmins = adminsData.filter((a: any) => a.role === 'super_admin').length || 0;
      const regularAdmins = totalAdmins - superAdmins;
      const recentSignups = recentUsersRes.data?.length || 0;

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
        regularAdmins,
        recentSignups,
        systemHealth: 'healthy',
      });
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading super admin data:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Error details:', errorMessage);
      setStats(prev => ({ ...prev, systemHealth: 'error' }));
      setIsLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    // Only load data after access check is complete and user is super admin
    if (!isCheckingAccess && isSuperAdmin) {
      loadSuperAdminData();
    } else if (!isCheckingAccess) {
      setIsLoading(false);
    }
  }, [loadSuperAdminData, isCheckingAccess, isSuperAdmin]);

  // Show loading while checking access or loading data
  if (isCheckingAccess || (isLoading && isSuperAdmin)) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">
              {isCheckingAccess ? 'Checking access...' : 'Loading super admin dashboard...'}
            </p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Show access denied if not super admin (after check is complete)
  if (!isSuperAdmin) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-[60vh]">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                Access Denied
              </CardTitle>
              <CardDescription>
                Super Admin privileges required
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                This dashboard is only accessible to Super Admins. Please contact a Super Admin if you need access.
              </p>
              <Link href="/admin">
                <Button variant="outline" className="w-full">
                  Go to Admin Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>
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
                Super Admin Dashboard
              </h1>
              <Badge variant="default" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                <Crown className="h-3 w-3 mr-1" />
                Super Admin
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Complete system overview and management controls
            </p>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Users"
            value={stats.totalUsers.toString()}
            description={`${stats.recentSignups} new this week`}
            icon={<Users className="h-5 w-5" />}
            delay={0.1}
          />
          <StatsCard
            title="Active Users"
            value={stats.activeUsers.toString()}
            description={`${stats.totalUsers > 0 ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0}% of total`}
            icon={<Activity className="h-5 w-5" />}
            delay={0.2}
          />
          <StatsCard
            title="Admins"
            value={stats.totalAdmins.toString()}
            description={`${stats.superAdmins} super, ${stats.regularAdmins} regular`}
            icon={<Shield className="h-5 w-5" />}
            delay={0.3}
          />
          <StatsCard
            title="Matchable Users"
            value={stats.matchableUsers.toString()}
            description="Ready for matching"
            icon={<CheckCircle2 className="h-5 w-5" />}
            delay={0.4}
          />
        </div>

        {/* Super Admin Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-yellow-500/20">
            <Link href="/admin/admins">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Admin Management</CardTitle>
                  <Shield className="h-5 w-5 text-yellow-500" />
                </div>
                <CardDescription>Manage admin users and roles</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" className="w-full justify-between group">
                  <span>Manage Admins</span>
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
                <CardDescription>Full CRUD access to all users</CardDescription>
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
            <Link href="/admin/analytics">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Analytics</CardTitle>
                  <BarChart3 className="h-5 w-5 text-primary" />
                </div>
                <CardDescription>Advanced analytics and reports</CardDescription>
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
            <Link href="/admin/settings">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">System Settings</CardTitle>
                  <Settings className="h-5 w-5 text-primary" />
                </div>
                <CardDescription>Configure system settings</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" className="w-full justify-between group">
                  <span>Settings</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Link>
          </Card>
        </div>

        {/* System Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Database Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm font-medium">Total Groups</span>
                <span className="text-lg font-bold">{stats.totalGroups}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm font-medium">Total Matches</span>
                <span className="text-lg font-bold">{stats.totalMatches}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm font-medium">Notifications</span>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold">{stats.totalNotifications}</span>
                  {stats.unreadNotifications > 0 && (
                    <Badge variant="default" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                      {stats.unreadNotifications} unread
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm font-medium">Onboarding Rate</span>
                <span className="text-lg font-bold">
                  {stats.totalUsers > 0 
                    ? Math.round((stats.completedOnboarding / stats.totalUsers) * 100)
                    : 0}%
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Security & Access
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm font-medium">Super Admins</p>
                  <p className="text-xs text-muted-foreground">Full system access</p>
                </div>
                <div className="flex items-center gap-2">
                  <Crown className="h-4 w-4 text-yellow-500" />
                  <span className="text-lg font-bold">{stats.superAdmins}</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm font-medium">Regular Admins</p>
                  <p className="text-xs text-muted-foreground">Limited admin access</p>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  <span className="text-lg font-bold">{stats.regularAdmins}</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm font-medium">System Health</p>
                  <p className="text-xs text-muted-foreground">Current status</p>
                </div>
                <Badge 
                  variant="default" 
                  className={
                    stats.systemHealth === 'healthy' 
                      ? 'bg-green-500/10 text-green-500 border-green-500/20'
                      : stats.systemHealth === 'warning'
                      ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                      : 'bg-red-500/10 text-red-500 border-red-500/20'
                  }
                >
                  {stats.systemHealth === 'healthy' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                  {stats.systemHealth === 'warning' && <AlertTriangle className="h-3 w-3 mr-1" />}
                  {stats.systemHealth === 'error' && <AlertTriangle className="h-3 w-3 mr-1" />}
                  {stats.systemHealth.charAt(0).toUpperCase() + stats.systemHealth.slice(1)}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common super admin tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-auto py-4 flex flex-col items-start gap-2" asChild>
                <Link href="/admin/admins">
                  <div className="flex items-center gap-2">
                    <UserPlus className="h-5 w-5" />
                    <span className="font-semibold">Create Admin</span>
                  </div>
                  <p className="text-xs text-muted-foreground text-left">
                    Add a new admin or super admin user
                  </p>
                </Link>
              </Button>

              <Button variant="outline" className="h-auto py-4 flex flex-col items-start gap-2" asChild>
                <Link href="/admin/users">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    <span className="font-semibold">Manage Users</span>
                  </div>
                  <p className="text-xs text-muted-foreground text-left">
                    View, edit, or delete any user
                  </p>
                </Link>
              </Button>

              <Button variant="outline" className="h-auto py-4 flex flex-col items-start gap-2" asChild>
                <Link href="/admin/analytics">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    <span className="font-semibold">View Reports</span>
                  </div>
                  <p className="text-xs text-muted-foreground text-left">
                    Generate system reports and exports
                  </p>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

