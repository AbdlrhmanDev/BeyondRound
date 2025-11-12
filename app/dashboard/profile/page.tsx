// 'use client';

// import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Separator } from '@/components/ui/separator';
// import { useState, useEffect } from 'react';
// import { createClient } from '@/utils/supabase/client';
// import { User } from '@supabase/supabase-js';
// import { motion } from 'framer-motion';
// import { PlaceholderChart } from '@/components/dashboard/placeholder-chart';
// import { Alert, AlertDescription } from '@/components/ui/alert';

// export default function ProfilePage() {
//   const [user, setUser] = useState<User | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [fullName, setFullName] = useState('');
//   const [isSaving, setIsSaving] = useState(false);
//   const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

//   useEffect(() => {
//     async function getUser() {
//       const supabase = createClient();
//       const {
//         data: { session },
//       } = await supabase.auth.getSession();

//       if (session?.user) {
//         setUser(session.user);
        
//         // Fetch the profile to get the current full_name
//         const { data: profile } = await supabase
//           .from('profiles')
//           .select('full_name')
//           .eq('id', session.user.id)
//           .single();
        
//         // Set initial full name from profile or user metadata
//         setFullName(profile?.full_name || session.user.user_metadata?.full_name || '');
//       }

//       setIsLoading(false);
//     }

//     getUser();
//   }, []);

//   const handleSaveProfile = async () => {
//     if (!user) return;

//     setIsSaving(true);
//     setSaveMessage(null);

//     try {
//       const supabase = createClient();
      
//       // Update Supabase Auth user metadata
//       const { error: authError } = await supabase.auth.updateUser({
//         data: {
//           full_name: fullName,
//         },
//       });

//       if (authError) {
//         throw authError;
//       }

//       // Also update the profiles table
//       const { error: profileError } = await supabase
//         .from('profiles')
//         .update({ 
//           full_name: fullName,
//           updated_at: new Date().toISOString()
//         })
//         .eq('id', user.id);

//       if (profileError) {
//         console.error('Error updating profile:', profileError);
//         // Still show success since auth update worked
//       }

//       setSaveMessage({ type: 'success', text: 'Profile updated successfully!' });
      
//       // Clear success message after 3 seconds
//       setTimeout(() => {
//         setSaveMessage(null);
//       }, 3000);
//     } catch (error) {
//       setSaveMessage({ 
//         type: 'error', 
//         text: error instanceof Error ? error.message : 'Failed to update profile' 
//       });
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   if (isLoading) {
//     return null; // Loading state is handled by the layout
//   }

//   return (
//     <DashboardLayout>
//       <div className="space-y-6">
//         <div>
//           <h2 className="text-2xl font-bold tracking-tight">Profile</h2>
//           <p className="text-muted-foreground">
//             Manage your account settings and preferences.
//           </p>
//         </div>

//         <Separator />

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           {/* Profile Information */}
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.5 }}
//           >
//             <Card>
//               <CardHeader>
//                 <CardTitle>Personal Information</CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 {saveMessage && (
//                   <Alert variant={saveMessage.type === 'error' ? 'destructive' : 'default'}>
//                     <AlertDescription>{saveMessage.text}</AlertDescription>
//                   </Alert>
//                 )}

//                 <div className="space-y-2">
//                   <Label htmlFor="email">Email</Label>
//                   <Input id="email" value={user?.email || ''} disabled />
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="name">Full Name</Label>
//                   <Input 
//                     id="name" 
//                     value={fullName}
//                     onChange={(e) => setFullName(e.target.value)}
//                     placeholder="Enter your full name" 
//                   />
//                 </div>

//                 <Button 
//                   className="w-full" 
//                   onClick={handleSaveProfile}
//                   disabled={isSaving}
//                 >
//                   {isSaving ? 'Saving...' : 'Save Changes'}
//                 </Button>
//               </CardContent>
//             </Card>
//           </motion.div>

//           {/* Security Settings */}
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.5, delay: 0.1 }}
//           >
//             <Card>
//               <CardHeader>
//                 <CardTitle>Security</CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="current-password">Current Password</Label>
//                   <Input id="current-password" type="password" />
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="new-password">New Password</Label>
//                   <Input id="new-password" type="password" />
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="confirm-password">Confirm New Password</Label>
//                   <Input id="confirm-password" type="password" />
//                 </div>

//                 <Button className="w-full">Update Password</Button>
//               </CardContent>
//             </Card>
//           </motion.div>

//           {/* Activity Chart */}
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.5, delay: 0.2 }}
//             className="md:col-span-2"
//           >
//             <Card>
//               <CardHeader>
//                 <CardTitle>Login Activity</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <PlaceholderChart
//                   variant="line"
//                   height={200}
//                   showToggle={true}
//                 />
//                 <p className="text-sm text-muted-foreground mt-4">
//                   This chart shows your login activity over the past 30 days.
//                 </p>
//               </CardContent>
//             </Card>
//           </motion.div>

//           {/* Account Settings */}
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.5, delay: 0.2 }}
//             className="md:col-span-2"
//           >
//             <Card>
//               <CardHeader>
//                 <CardTitle>Account Settings</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <div className="space-y-4">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <p className="font-medium">Two-Factor Authentication</p>
//                       <p className="text-sm text-muted-foreground">
//                         Add an extra layer of security to your account
//                       </p>
//                     </div>
//                     <Button variant="outline">Enable</Button>
//                   </div>

//                   <Separator />

//                   <div className="flex items-center justify-between">
//                     <div>
//                       <p className="font-medium">Email Notifications</p>
//                       <p className="text-sm text-muted-foreground">
//                         Receive email notifications about account activity
//                       </p>
//                     </div>
//                     <Button variant="outline">Configure</Button>
//                   </div>

//                   <Separator />

//                   <div className="flex items-center justify-between">
//                     <div>
//                       <p className="font-medium text-destructive">
//                         Delete Account
//                       </p>
//                       <p className="text-sm text-muted-foreground">
//                         Permanently delete your account and all data
//                       </p>
//                     </div>
//                     <Button variant="destructive">Delete Account</Button>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           </motion.div>
//         </div>
//       </div>
//     </DashboardLayout>
//   );
// }
'use client';

import { useEffect, useMemo, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { createClient } from '@/utils/supabase/client';
import type { User } from '@supabase/supabase-js';
import { motion } from 'framer-motion';
import { PlaceholderChart } from '@/components/dashboard/placeholder-chart';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function ProfilePage() {
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [fullName, setFullName] = useState('');
  const [initialFullName, setInitialFullName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 1) احصل على الجلسة ثم حمّل full_name من profiles أو من user_metadata كبديل
  useEffect(() => {
    (async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) console.error('getSession error:', error);

      if (session?.user) {
        setUser(session.user);

        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', session.user.id)
          .single();

        const name =
          profile?.full_name ??
          (session.user.user_metadata?.full_name as string | undefined) ??
          '';

        setFullName(name);
        setInitialFullName(name);
      }

      setIsLoading(false);
    })();
  }, [supabase]);

  // 2) افتح قناة Realtime لتحديث الاسم فورًا عند أي UPDATE على صفّ المستخدم
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`profile-${user.id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${user.id}` },
        (payload) => {
          const nextFull = (payload.new as { full_name?: string })?.full_name ?? '';
          setFullName(nextFull);
          setInitialFullName(nextFull);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, user?.id]);

  const handleSaveProfile = async () => {
    if (!user) return;
    if (fullName.trim() === initialFullName.trim()) {
      setSaveMessage({ type: 'success', text: 'No changes to save.' });
      setTimeout(() => setSaveMessage(null), 2000);
      return;
    }

    setIsSaving(true);
    setSaveMessage(null);

    try {
      // 1) حدّث ميتاداتا المستخدم في Auth
      const { error: authError } = await supabase.auth.updateUser({
        data: { full_name: fullName },
      });
      if (authError) throw authError;

      // 2) حدّث صفّ المستخدم في profiles (يتطلّب RLS UPDATE policy مذكورة أدناه)
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ full_name: fullName, updated_at: new Date().toISOString() })
        .eq('id', user.id);

      if (profileError) {
        console.error('Error updating profiles:', profileError);
        // ما نرمي خطأ هنا لو Auth نجح؛ لكن نعرض تنبيه خفيف
      }

      setInitialFullName(fullName);
      setSaveMessage({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err) {
      setSaveMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to update profile',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Profile</h2>
          <p className="text-muted-foreground">Manage your account settings and preferences.</p>
        </div>

        <Separator />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Profile Information */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {saveMessage && (
                  <Alert variant={saveMessage.type === 'error' ? 'destructive' : 'default'}>
                    <AlertDescription>{saveMessage.text}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={user?.email || ''} disabled />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>

                <Button className="w-full" onClick={handleSaveProfile} disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Security Settings */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
            <Card>
              <CardHeader>
                <CardTitle>Security</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input id="current-password" type="password" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input id="new-password" type="password" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input id="confirm-password" type="password" />
                </div>

                <Button className="w-full">Update Password</Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Activity Chart */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Login Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <PlaceholderChart variant="line" height={200} showToggle />
                <p className="text-sm text-muted-foreground mt-4">This chart shows your login activity over the past 30 days.</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Account Settings */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <SettingRow
                    title="Two-Factor Authentication"
                    subtitle="Add an extra layer of security to your account"
                    actionLabel="Enable"
                  />
                  <Separator />
                  <SettingRow
                    title="Email Notifications"
                    subtitle="Receive email notifications about account activity"
                    actionLabel="Configure"
                  />
                  <Separator />
                  <SettingRow
                    title="Delete Account"
                    subtitle="Permanently delete your account and all data"
                    actionLabel="Delete Account"
                    destructive
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function SettingRow({
  title,
  subtitle,
  actionLabel,
  destructive,
}: {
  title: string;
  subtitle: string;
  actionLabel: string;
  destructive?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className={`font-medium ${destructive ? 'text-destructive' : ''}`}>{title}</p>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
      <Button variant={destructive ? 'destructive' : 'outline'}>{actionLabel}</Button>
    </div>
  );
}
