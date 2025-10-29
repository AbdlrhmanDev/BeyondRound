'use client';

import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { motion } from 'framer-motion';
import { updateSettings } from './actions';
import { toast } from 'sonner';
import { TwoFactorAuth } from '@/components/dashboard/two-factor-auth';
import { ActivityLog } from '@/components/dashboard/activity-log';

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState({
    email_notifications: false,
    security_alerts: false,
    marketing_emails: false,
    theme: 'system' as 'light' | 'dark' | 'system',
    animations: true,
  });

  useEffect(() => {
    async function getUserSettings() {
      const supabase = await createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setIsLoading(false);
        return;
      }

      const { data } = await supabase
        .from('profiles')
        .select(
          'email_notifications, security_alerts, marketing_emails, theme, interface_animations'
        )
        .eq('id', session.user.id)
        .single();

      if (data) {
        setSettings({
          email_notifications: data.email_notifications,
          security_alerts: data.security_alerts,
          marketing_emails: data.marketing_emails,
          theme: data.theme,
          animations: data.interface_animations,
        });
      }

      setIsLoading(false);
    }
    getUserSettings();
  }, []);

  useEffect(() => {
    document.body.classList.remove('light', 'dark');
    document.body.classList.add(settings.theme);
  }, [settings.theme]);

  const handleSettingChange = <K extends keyof typeof settings>(key: K, value: typeof settings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    try {
      await updateSettings(settings);
      toast.success('Settings updated successfully!');
    } catch (error: unknown) {
      console.error(error instanceof Error ? error.message : 'Failed to update settings');
      toast.error('Failed to update settings.');
    }
  };

  if (isLoading) {
    return null; // Loading state is handled by the layout
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">
            Manage your application settings and preferences.
          </p>
        </div>

        <Separator />

        <div className="grid grid-cols-1 gap-6">
          {/* Notification Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notifications">
                      Email Notifications
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Receive email notifications about account activity
                    </p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={settings.email_notifications}
                    onCheckedChange={(value) =>
                      handleSettingChange('email_notifications', value)
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="security-alerts">Security Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified about important security events
                    </p>
                  </div>
                  <Switch
                    id="security-alerts"
                    checked={settings.security_alerts}
                    onCheckedChange={(value) =>
                      handleSettingChange('security_alerts', value)
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="marketing-emails">Marketing Emails</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive updates about new features and promotions
                    </p>
                  </div>
                  <Switch
                    id="marketing-emails"
                    checked={settings.marketing_emails}
                    onCheckedChange={(value) =>
                      handleSettingChange('marketing_emails', value)
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Appearance Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div
                    className="flex flex-col items-center gap-2 cursor-pointer"
                    onClick={() => handleSettingChange('theme', 'system')}
                  >
                    <div
                      className={`border-2 rounded-md p-2 ${
                        settings.theme === 'system'
                          ? 'border-primary'
                          : 'border-muted'
                      }`}
                    >
                      <div className="w-full h-24 bg-background rounded-md border border-border"></div>
                    </div>
                    <span className="text-sm font-medium">System</span>
                  </div>

                  <div
                    className="flex flex-col items-center gap-2 cursor-pointer"
                    onClick={() => handleSettingChange('theme', 'light')}
                  >
                    <div
                      className={`border-2 rounded-md p-2 ${
                        settings.theme === 'light'
                          ? 'border-primary'
                          : 'border-muted'
                      }`}
                    >
                      <div className="w-full h-24 bg-white rounded-md border border-gray-200"></div>
                    </div>
                    <span className="text-sm font-medium">Light</span>
                  </div>

                  <div
                    className="flex flex-col items-center gap-2 cursor-pointer"
                    onClick={() => handleSettingChange('theme', 'dark')}
                  >
                    <div
                      className={`border-2 rounded-md p-2 ${
                        settings.theme === 'dark'
                          ? 'border-primary'
                          : 'border-muted'
                      }`}
                    >
                      <div className="w-full h-24 bg-gray-950 rounded-md border border-gray-800"></div>
                    </div>
                    <span className="text-sm font-medium">Dark</span>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="animations">Interface Animations</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable animations throughout the interface
                    </p>
                  </div>
                  <Switch
                    id="animations"
                    checked={settings.animations}
                    onCheckedChange={(value) =>
                      handleSettingChange('animations', value)
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Privacy Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Privacy & Security</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="two-factor">
                      Two-Factor Authentication
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <TwoFactorAuth />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="activity-log">Activity Log</Label>
                    <p className="text-sm text-muted-foreground">
                      View a history of your account activity
                    </p>
                  </div>
                  <ActivityLog />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="data-export">Export Your Data</Label>
                    <p className="text-sm text-muted-foreground">
                      Download a copy of your personal data
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Export
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Save Settings */}
          <div className="flex justify-end">
            <Button onClick={handleSave}>Save Settings</Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}