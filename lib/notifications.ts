/**
 * Notifications Helper Functions
 * 
 * This file contains utility functions for creating notifications
 * in different scenarios throughout the application.
 */

import { createClient } from '@/utils/supabase/client';

export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'match' | 'group' | 'message';

interface CreateNotificationParams {
  userId: string;
  title: string;
  message: string;
  type?: NotificationType;
  link?: string;
  metadata?: Record<string, any>;
}

/**
 * Create a notification for a user
 */
export async function createNotification({
  userId,
  title,
  message,
  type = 'info',
  link,
  metadata = {},
}: CreateNotificationParams) {
  const supabase = createClient();

  const { data, error } = await supabase.rpc('create_notification', {
    p_user_id: userId,
    p_title: title,
    p_message: message,
    p_type: type,
    p_link: link || null,
    p_metadata: metadata,
  });

  if (error) {
    console.error('Error creating notification:', error);
    return null;
  }

  return data;
}

/**
 * Notify user about a new match
 */
export async function notifyNewMatch(userId: string, matchUserName: string) {
  return createNotification({
    userId,
    title: '🎉 New Match!',
    message: `You've been matched with ${matchUserName}! Check out your matches page.`,
    type: 'match',
    link: '/dashboard/matches',
    metadata: { type: 'new_match' },
  });
}

/**
 * Notify user about being added to a group
 */
export async function notifyGroupInvite(userId: string, groupName: string, groupId: string) {
  return createNotification({
    userId,
    title: '👥 Added to Group',
    message: `You've been added to "${groupName}". Start connecting with your group members!`,
    type: 'group',
    link: `/dashboard/messages/${groupId}`,
    metadata: { type: 'group_invite', groupId },
  });
}

/**
 * Notify user about a new message in their group
 */
export async function notifyNewMessage(
  userId: string,
  senderName: string,
  groupName: string,
  groupId: string
) {
  return createNotification({
    userId,
    title: '💬 New Message',
    message: `${senderName} sent a message in "${groupName}"`,
    type: 'message',
    link: `/dashboard/messages/${groupId}`,
    metadata: { type: 'new_message', groupId },
  });
}

/**
 * Notify user about matching day (Thursday 4 PM)
 */
export async function notifyMatchingDay(userId: string) {
  return createNotification({
    userId,
    title: '⏰ Matching Day',
    message: 'Today is matching day! New matches will be available at 4:00 PM.',
    type: 'info',
    link: '/dashboard/matches',
    metadata: { type: 'matching_day' },
  });
}

/**
 * Notify user about profile completion
 */
export async function notifyProfileComplete(userId: string) {
  return createNotification({
    userId,
    title: '✅ Profile Complete',
    message: 'Your profile is complete! You are now in the matching queue.',
    type: 'success',
    link: '/dashboard',
    metadata: { type: 'profile_complete' },
  });
}

/**
 * Notify user about feedback request
 */
export async function notifyFeedbackRequest(userId: string, groupName: string, groupId: string) {
  return createNotification({
    userId,
    title: '⭐ Share Your Feedback',
    message: `How was your experience with "${groupName}"? We'd love to hear your thoughts.`,
    type: 'info',
    link: `/dashboard/messages/${groupId}`,
    metadata: { type: 'feedback_request', groupId },
  });
}

/**
 * Notify user about account verification
 */
export async function notifyAccountVerified(userId: string) {
  return createNotification({
    userId,
    title: '✅ Account Verified',
    message: 'Your account has been verified! You now have full access to all features.',
    type: 'success',
    link: '/dashboard',
    metadata: { type: 'account_verified' },
  });
}

/**
 * Notify user about subscription expiring soon
 */
export async function notifySubscriptionExpiring(userId: string, daysLeft: number) {
  return createNotification({
    userId,
    title: '⚠️ Subscription Expiring Soon',
    message: `Your subscription expires in ${daysLeft} days. Renew now to keep matching!`,
    type: 'warning',
    link: '/dashboard/settings/billing',
    metadata: { type: 'subscription_expiring', daysLeft },
  });
}

/**
 * Get unread notification count for a user
 */
export async function getUnreadCount(userId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false);

  if (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }

  return data || 0;
}

