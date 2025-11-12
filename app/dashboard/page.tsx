'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { WelcomeSection } from '@/components/dashboard/welcome-section';
import { StatsCard } from '@/components/dashboard/stats-card';
import { ActivityList } from '@/components/dashboard/activity-list';
import { PlaceholderChart } from '@/components/dashboard/placeholder-chart';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { createClient } from '@/utils/supabase/client';
import type { User } from '@supabase/supabase-js';
interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  is_onboarding_complete: boolean | null;
  is_matchable: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}

interface Activity {
  id: string;
  title: string;
  description: string;
  timestamp: string;
}

interface DashboardStats {
  loginCount: number;
  lastLogin: string;
  securityScore: number;
  accountStatus: string;
}

interface Group {
  id: string;
  name: string;
  description: string;
  avatar_url: string;
}

interface GroupMembership {
  group_id: string;
  groups: Group | Group[] | null;
}

export default function DashboardPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [userGroups, setUserGroups] = useState<Group[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [rawStats, setRawStats] = useState<{
    loginCount: number;
    lastLoginRaw: string | null;
    securityScore: number;
    accountStatus: string;
  } | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    loginCount: 0,
    lastLogin: 'Never',
    securityScore: 0,
    accountStatus: 'Inactive',
  });
  const [rawActivities, setRawActivities] = useState<Array<{
    id: string;
    title: string;
    description: string;
    created_at: string;
  }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  // Helper function to format time ago (client-side only)
  const formatTimeAgo = useCallback((dateString: string): string => {
    if (!isMounted) return 'Loading...'; // Prevent hydration mismatch
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    
    // Check if same day
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) return 'Today';
    
    // Check if yesterday
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();
    if (isYesterday) return 'Yesterday';
    
    return date.toLocaleDateString();
  }, [isMounted]);

  // Set mounted state after hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Format dates only after component is mounted (client-side only)
  useEffect(() => {
    if (!isMounted || !rawStats) return;

    setStats({
      loginCount: rawStats.loginCount,
      lastLogin: rawStats.lastLoginRaw ? formatTimeAgo(rawStats.lastLoginRaw) : 'Never',
      securityScore: rawStats.securityScore,
      accountStatus: rawStats.accountStatus,
    });
  }, [isMounted, rawStats, formatTimeAgo]);

  // Format activities only after component is mounted
  useEffect(() => {
    if (!isMounted || rawActivities.length === 0) return;

    const formattedActivities: Activity[] = rawActivities.map((activity) => ({
      id: activity.id,
      title: activity.title,
      description: activity.description,
      timestamp: formatTimeAgo(activity.created_at),
    }));
    setActivities(formattedActivities);
  }, [isMounted, rawActivities, formatTimeAgo]);

  // 1) احصل على الجلسة ثم حمّل البروفايل والمجموعات
  useEffect(() => {
    (async () => {
      const { data: { session }, error: sessionErr } = await supabase.auth.getSession();
      if (sessionErr) console.error('getSession error:', sessionErr);

      if (session?.user) {
        setUser(session.user);

        // جلب بيانات البروفايل
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url, is_onboarding_complete, is_matchable, created_at, updated_at')
          .eq('id', session.user.id)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
        } else {
          setUserProfile(profileData as Profile);
        }

        // Get user auth data for last sign in
        const { data: authUser } = await supabase.auth.getUser();
        
        // Calculate stats
        const lastSignIn = authUser?.user?.last_sign_in_at;
        const profileCreated = profileData?.created_at;
        
        // Fetch notifications for activities
        const { data: notifications, error: notificationsError } = await supabase
          .from('notifications')
          .select('id, title, message, created_at, type')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })
          .limit(5);

        // Calculate security score based on profile completeness
        let securityScore = 0;
        if (profileData?.is_onboarding_complete) securityScore += 30;
        if (profileData?.avatar_url) securityScore += 20;
        if (authUser?.user?.email_confirmed_at) securityScore += 25;
        if (profileData?.full_name) securityScore += 15;
        if (profileData?.is_matchable) securityScore += 10;

        // Get login count (estimate from account age or use a simple calculation)
        const accountAgeDays = profileCreated 
          ? Math.floor((Date.now() - new Date(profileCreated).getTime()) / (1000 * 60 * 60 * 24))
          : 0;
        const loginCount = Math.max(1, Math.floor(accountAgeDays / 7)); // Estimate based on account age

        // Store raw data first (without date formatting to avoid hydration mismatch)
        setRawStats({
          loginCount,
          lastLoginRaw: lastSignIn || null,
          securityScore,
          accountStatus: profileData?.is_onboarding_complete ? 'Active' : 'Incomplete',
        });

        // Store raw activities data
        if (!notificationsError && notifications && notifications.length > 0) {
          setRawActivities(notifications.map((notif) => ({
            id: notif.id,
            title: notif.title || 'Notification',
            description: notif.message || '',
            created_at: notif.created_at,
          })));
        } else {
          // If no notifications, show account creation activity
          if (profileCreated) {
            setRawActivities([
              {
                id: 'account-created',
                title: 'Account Created',
                description: 'Your account was successfully created',
                created_at: profileCreated,
              },
            ]);
          }
        }

        // جلب المجموعات التي ينتمي إليها المستخدم
        const { data: groupMemberships, error: membershipsError } = await supabase
          .from('group_members')
          .select(`
            group_id,
            groups!group_members_group_id_fkey (id, name, description, avatar_url)
          `)
          .eq('user_id', session.user.id);

        if (membershipsError) {
          console.error('Error fetching groups:', membershipsError);
        } else {
          const groups = groupMemberships
            ?.map((membership: GroupMembership) => {
              // Handle both single object and array returns from Supabase
              const group = membership.groups;
              return Array.isArray(group) ? group[0] : group;
            })
            .filter((g): g is Group => g !== null && g !== undefined);
          setUserGroups(groups || []);
        }
      }
      setIsLoading(false);
    })();
  }, [supabase]);

  // 2) افتح قناة Realtime بعد توفر userId
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`profile-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          const updated = payload.new as Profile;
          setUserProfile((prev) => ({ ...prev, ...updated }));
        }
      )
      .subscribe();

    // cleanup لتفادي تكرار القنوات مع Fast Refresh
    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, user?.id]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-[60vh]">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </DashboardLayout>
    );
  }

  // ✅ إذا لم يُكمل المستخدم التسجيل، وجّهه إلى Onboarding
  if (!userProfile?.is_onboarding_complete) {
    return (
      <DashboardLayout>
        <Card className="max-w-2xl mx-auto mt-12">
          <CardHeader>
            <CardTitle>Complete Your Profile</CardTitle>
            <CardDescription>
              You need to complete your profile before you can access the matching system.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/onboarding')} size="lg" className="w-full">
              Complete Onboarding
            </Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  // ✅ إذا أكمل التسجيل، اعرض Dashboard الرئيسي مباشرة
  return (
    <DashboardLayout>
      <WelcomeSection
        userName={userProfile?.full_name || 'User'}
        userEmail={user?.email || 'user@example.com'}
        avatarUrl={userProfile?.avatar_url || null}
      />

      {/* عرض المجموعات */}
      {userGroups.length > 0 && (
        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Groups This Week</CardTitle>
              <CardDescription>You&apos;ve been matched with these groups</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {userGroups.map((group) => (
                  <Card key={group.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg">{group.name}</CardTitle>
                      <CardDescription className="line-clamp-2">{group.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button 
                        onClick={() => router.push(`/dashboard/messages/${group.id}`)}
                        className="w-full"
                      >
                        Open Chat
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <StatsCard
          title="Login Count"
          value={stats.loginCount.toString()}
          description="Estimated logins since account creation"
          icon={<UserIcon className="h-5 w-5" />}
          delay={0.1}
        />
        <StatsCard
          title="Last Login"
          value={stats.lastLogin}
          description="Last accessed the platform"
          icon={<ClockIcon className="h-5 w-5" />}
          delay={0.2}
        />
        <StatsCard
          title="Security Score"
          value={`${stats.securityScore}%`}
          description="Your account security rating"
          icon={<ShieldIcon className="h-5 w-5" />}
          change={stats.securityScore >= 80 ? { value: 'Excellent', positive: true } : stats.securityScore >= 60 ? { value: 'Good', positive: true } : undefined}
          delay={0.3}
        />
        <StatsCard
          title="Account Status"
          value={stats.accountStatus}
          description={stats.accountStatus === 'Active' ? 'Your account is in good standing' : 'Complete your profile to activate'}
          icon={<CheckCircleIcon className="h-5 w-5" />}
          delay={0.4}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle>Account Activity</CardTitle>
              <Button variant="outline" size="sm">View All</Button>
            </CardHeader>
            <CardContent>
              <PlaceholderChart variant="area" height={250} showToggle />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <ActivityList activities={activities} />
        </div>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Security Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <SecurityRow
                title="Enable Two-Factor Authentication"
                subtitle="Add an extra layer of security to your account"
                icon={<LockIcon className="h-4 w-4" />}
                actionLabel="Enable"
              />
              <SecurityRow
                title="Update Recovery Email"
                subtitle="Ensure you can recover your account if needed"
                icon={<KeyIcon className="h-4 w-4" />}
                actionLabel="Update"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

function SecurityRow({
  title, subtitle, icon, actionLabel,
}: { title: string; subtitle: string; icon: React.ReactNode; actionLabel: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          {icon}
        </div>
        <div>
          <p className="font-medium">{title}</p>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      <Button variant="outline" size="sm">{actionLabel}</Button>
    </div>
  );
}

/* Icons */
function UserIcon(props: React.SVGProps<SVGSVGElement>) { /* ...same as yours... */ return (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);}
function ClockIcon(props: React.SVGProps<SVGSVGElement>) { /* ... */ return (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);}
function ShieldIcon(props: React.SVGProps<SVGSVGElement>) { /* ... */ return (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);}
function CheckCircleIcon(props: React.SVGProps<SVGSVGElement>) { /* ... */ return (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);}
function LockIcon(props: React.SVGProps<SVGSVGElement>) { /* ... */ return (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);}
function KeyIcon(props: React.SVGProps<SVGSVGElement>) { /* ... */ return (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
  </svg>
);}




// 'use client';

// import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
// import { WelcomeSection } from '@/components/dashboard/welcome-section';
// import { StatsCard } from '@/components/dashboard/stats-card';
// import { ActivityList } from '@/components/dashboard/activity-list';
// import { PlaceholderChart } from '@/components/dashboard/placeholder-chart';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { useState, useEffect } from 'react';
// import { createClient } from '@/utils/supabase/client';
// import { User } from '@supabase/supabase-js';

// interface Profile {
//   id: string;
//   full_name: string;
//   avatar_url: string;
// }

// export default function DashboardPage() {
//   const [user, setUser] = useState<User | null>(null);
//   const [userProfile, setUserProfile] = useState<Profile | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const supabase = createClient();

//   useEffect(() => {
//     async function fetchUserData() {
//       const { data: { session } } = await supabase.auth.getSession();

//       if (session?.user) {
//         setUser(session.user);

//         // Fetch profile data
//         const { data: profileData, error: profileError } = await supabase
//           .from('profiles')
//           .select('id, full_name, avatar_url')
//           .eq('id', session.user.id)
//           .single();

//         if (profileError) {
//           console.error('Error fetching profile:', profileError);
//         } else {
//           setUserProfile(profileData);
//         }
//       }

//       setIsLoading(false);
//     }

//     fetchUserData();

//     // Set up Realtime subscription for profile updates
//     const channel = supabase
//       .channel(`profile_updates_${user?.id}`)
//       .on(
//         'postgres_changes',
//         { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${user?.id}` },
//         (payload) => {
//           const updatedProfile = payload.new as Profile;
//           setUserProfile(updatedProfile);
//         }
//       )
//       .subscribe();

//     return () => {
//       supabase.removeChannel(channel);
//     };
//   }, [supabase, user?.id]);

//   // Mock data for the dashboard
//   const mockActivities = [
//     {
//       id: '1',
//       title: 'Account Created',
//       description: 'Your account was successfully created',
//       timestamp: '2 hours ago',
//     },
//     {
//       id: '2',
//       title: 'Email Verified',
//       description: 'Your email address has been verified',
//       timestamp: '1 hour ago',
//     },
//     {
//       id: '3',
//       title: 'Password Updated',
//       description: 'Your password was updated successfully',
//       timestamp: '30 minutes ago',
//     },
//   ];

//   if (isLoading) {
//     return null; // Loading state is handled by the layout
//   }

//   return (
//     <DashboardLayout>
//       {/* Welcome Section */}
//       <WelcomeSection
//         userName={userProfile?.full_name || 'User'}
//         userEmail={user?.email || 'user@example.com'}
//       />

//       {/* Stats Section */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
//         <StatsCard
//           title="Login Count"
//           value="5"
//           description="Total logins this month"
//           icon={<UserIcon className="h-5 w-5" />}
//           delay={0.1}
//         />
//         <StatsCard
//           title="Last Login"
//           value="Today"
//           description="Last accessed the platform"
//           icon={<ClockIcon className="h-5 w-5" />}
//           delay={0.2}
//         />
//         <StatsCard
//           title="Security Score"
//           value="85%"
//           description="Your account security rating"
//           icon={<ShieldIcon className="h-5 w-5" />}
//           change={{ value: '10%', positive: true }}
//           delay={0.3}
//         />
//         <StatsCard
//           title="Account Status"
//           value="Active"
//           description="Your account is in good standing"
//           icon={<CheckCircleIcon className="h-5 w-5" />}
//           delay={0.4}
//         />
        
//       </div>

//       {/* Charts and Activity Section */}
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
//         <div className="lg:col-span-2">
//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between pb-2">
//               <CardTitle>Account Activity</CardTitle>
//               <Button variant="outline" size="sm">
//                 View All
//               </Button>
//             </CardHeader>
//             <CardContent>
//               <PlaceholderChart variant="area" height={250} showToggle={true} />
//             </CardContent>
//           </Card>
//         </div>

//         <div className="lg:col-span-1">
//           <ActivityList activities={mockActivities} />
//         </div>
//       </div>

//       {/* Additional Section */}
//       <div className="mt-6">
//         <Card>
//           <CardHeader>
//             <CardTitle>Security Recommendations</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="space-y-4">
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center gap-2">
//                   <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
//                     <LockIcon className="h-4 w-4" />
//                   </div>
//                   <div>
//                     <p className="font-medium">
//                       Enable Two-Factor Authentication
//                     </p>
//                     <p className="text-sm text-muted-foreground">
//                       Add an extra layer of security to your account
//                     </p>
//                   </div>
//                 </div>
//                 <Button variant="outline" size="sm">
//                   Enable
//                 </Button>
//               </div>

//               <div className="flex items-center justify-between">
//                 <div className="flex items-center gap-2">
//                   <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
//                     <KeyIcon className="h-4 w-4" />
//                   </div>
//                   <div>
//                     <p className="font-medium">Update Recovery Email</p>
//                     <p className="text-sm text-muted-foreground">
//                       Ensure you can recover your account if needed
//                     </p>
//                   </div>
//                 </div>
//                 <Button variant="outline" size="sm">
//                   Update
//                 </Button>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     </DashboardLayout>
//   );
// }

// // Icons
// function UserIcon(props: React.SVGProps<SVGSVGElement>) {
//   return (
//     <svg
//       {...props}
//       xmlns="http://www.w3.org/2000/svg"
//       width="24"
//       height="24"
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="2"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//     >
//       <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
//       <circle cx="12" cy="7" r="4" />
//     </svg>
//   );
// }

// function ClockIcon(props: React.SVGProps<SVGSVGElement>) {
//   return (
//     <svg
//       {...props}
//       xmlns="http://www.w3.org/2000/svg"
//       width="24"
//       height="24"
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="2"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//     >
//       <circle cx="12" cy="12" r="10" />
//       <polyline points="12 6 12 12 16 14" />
//     </svg>
//   );
// }

// function ShieldIcon(props: React.SVGProps<SVGSVGElement>) {
//   return (
//     <svg
//       {...props}
//       xmlns="http://www.w3.org/2000/svg"
//       width="24"
//       height="24"
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="2"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//     >
//       <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
//     </svg>
//   );
// }

// function CheckCircleIcon(props: React.SVGProps<SVGSVGElement>) {
//   return (
//     <svg
//       {...props}
//       xmlns="http://www.w3.org/2000/svg"
//       width="24"
//       height="24"
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="2"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//     >
//       <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
//       <polyline points="22 4 12 14.01 9 11.01" />
//     </svg>
//   );
// }

// function LockIcon(props: React.SVGProps<SVGSVGElement>) {
//   return (
//     <svg
//       {...props}
//       xmlns="http://www.w3.org/2000/svg"
//       width="24"
//       height="24"
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="2"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//     >
//       <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
//       <path d="M7 11V7a5 5 0 0 1 10 0v4" />
//     </svg>
//   );
// }

// function KeyIcon(props: React.SVGProps<SVGSVGElement>) {
//   return (
//     <svg
//       {...props}
//       xmlns="http://www.w3.org/2000/svg"
//       width="24"
//       height="24"
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="2"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//     >
//       <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
//     </svg>
//   );
// }
