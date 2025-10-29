'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, Check, CheckCheck, Trash2, Info, AlertCircle, CheckCircle, Users, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';

interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'match' | 'group' | 'message';
  link: string | null;
  is_read: boolean;
  created_at: string;
  read_at: string | null;
  metadata: Record<string, unknown>;
}

export default function NotificationsPage() {
  const supabase = createClient();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  // Fetch initial notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/auth/signin');
        return;
      }

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching notifications:', error);
      } else if (data) {
        setNotifications(data);
      }
      setLoading(false);
    };

    fetchNotifications();
  }, [supabase, router]);

  // Listen for real-time updates
  useEffect(() => {
    const setupRealtimeSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const channel = supabase
        .channel(`notifications-${user.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            setNotifications((current) => [payload.new as Notification, ...current]);
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            setNotifications((current) =>
              current.map((n) => (n.id === payload.new.id ? (payload.new as Notification) : n))
            );
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'DELETE',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            setNotifications((current) => current.filter((n) => n.id !== payload.old.id));
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    setupRealtimeSubscription();
  }, [supabase]);

  // Mark notification as read
  const handleNotificationClick = async (notification: Notification) => {
    // Navigate first for better UX
    if (notification.link) {
      const fixedLink = notification.link.replace(/^\/groups\//, '/dashboard/messages/');
      router.push(fixedLink);
    }

    if (!notification.is_read) {
      // Optimistic update
      setNotifications((current) =>
        current.map((n) => (n.id === notification.id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n))
      );

      // Try to update in database
      try {
        const { error } = await supabase.rpc('mark_notification_read', {
          p_notification_id: notification.id,
        });

        if (error && error.message) {
          console.warn('Could not mark notification as read:', error.message);
        }
      } catch {
        console.warn('Notification system not fully set up. Please run the migration.');
      }
    }
  };

  // Mark all as read
  const handleMarkAllRead = async () => {
    setNotifications((current) =>
      current.map((n) => ({ ...n, is_read: true, read_at: new Date().toISOString() }))
    );

    try {
      const { error } = await supabase.rpc('mark_all_notifications_read');

      if (error && error.message) {
        console.warn('Could not mark all notifications as read:', error.message);
      }
    } catch {
      console.warn('Notification system not fully set up. Please run the migration.');
    }
  };

  // Delete notification
  const handleDelete = async (notificationId: string) => {
    setNotifications((current) => current.filter((n) => n.id !== notificationId));

    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    if (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Get icon based on notification type
  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'match':
        return <Users className="h-5 w-5 text-blue-500" />;
      case 'group':
        return <Users className="h-5 w-5 text-purple-500" />;
      case 'message':
        return <MessageSquare className="h-5 w-5 text-blue-500" />;
      default:
        return <Info className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const filteredNotifications = notifications.filter((n) =>
    filter === 'all' ? true : !n.is_read
  );

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading notifications...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Bell className="h-8 w-8 text-primary" />
              Notifications
              {unreadCount > 0 && (
                <span className="text-lg font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </h1>
            <p className="text-muted-foreground mt-2">Stay updated with your latest activities</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilter(filter === 'all' ? 'unread' : 'all')}
            >
              {filter === 'all' ? 'Show Unread' : 'Show All'}
            </Button>
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
                <CheckCheck className="h-4 w-4 mr-2" />
                Mark All Read
              </Button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {filteredNotifications.length === 0 ? (
            <Card className="bg-card border-border">
              <CardContent className="p-10 text-center">
                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-foreground mb-1">No notifications</h3>
                <p className="text-sm text-muted-foreground">
                  {filter === 'unread'
                    ? "You're all caught up! No unread notifications."
                    : "You don't have any notifications yet."}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredNotifications.map((notification) => (
              <Card
                key={notification.id}
                className={`border bg-card transition-colors duration-200 cursor-pointer group ${
                  notification.is_read
                    ? 'hover:bg-muted/40'
                    : 'hover:bg-muted/30 border-l-4 border-l-primary'
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`rounded-full p-2 ${
                      notification.is_read ? 'bg-muted' : 'bg-primary/10'
                    }`}>
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className={`font-medium ${
                          notification.is_read ? 'text-foreground/80' : 'text-foreground'
                        }`}>
                          {notification.title}
                        </h4>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 mb-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="whitespace-nowrap">
                          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                        </span>
                        {notification.is_read && notification.read_at && (
                          <span className="flex items-center gap-1">
                            <Check className="h-3 w-3" />
                            Read
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!notification.is_read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNotificationClick(notification);
                          }}
                          className="h-8 w-8 p-0"
                          title="Mark as read"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(notification.id);
                        }}
                        className="h-8 w-8 p-0"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
