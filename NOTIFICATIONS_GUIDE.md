# 🔔 Notifications System Guide

## Overview
This guide explains how to use the comprehensive notifications system in BeyondRounds. The system includes real-time updates, a beautiful UI, and helper functions for easy integration.

## 📋 Table of Contents
1. [Setup](#setup)
2. [Database Schema](#database-schema)
3. [Features](#features)
4. [Usage Examples](#usage-examples)
5. [UI Components](#ui-components)
6. [Testing](#testing)

---

## Setup

### 1. Install Dependencies
```bash
npm install date-fns
```

### 2. Run Migration
Apply the notifications migration to your Supabase database:

```bash
# Using Supabase CLI
supabase db push

# Or manually run the SQL file
# supabase/migrations/20241030_notifications_system.sql
```

### 3. Enable Realtime
The migration automatically enables Realtime for the `notifications` table. Ensure Realtime is enabled in your Supabase project settings.

---

## Database Schema

### Notifications Table
```sql
notifications (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,        -- 'info' | 'success' | 'warning' | 'error' | 'match' | 'group' | 'message'
  link TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'
)
```

### Available Functions
- `mark_notification_read(p_notification_id UUID)` - Mark single notification as read
- `mark_all_notifications_read()` - Mark all user notifications as read
- `get_unread_count()` - Get count of unread notifications
- `create_notification(...)` - Create a new notification
- `cleanup_old_notifications(days_to_keep INTEGER)` - Delete old read notifications

---

## Features

✅ **Real-time Updates** - Notifications appear instantly without page refresh  
✅ **Beautiful UI** - Glossy black design matching the site theme  
✅ **Notification Bell** - Shows unread count in header  
✅ **Filter & Search** - Filter by read/unread status  
✅ **Mark as Read** - Individual or bulk mark as read  
✅ **Delete Notifications** - Remove unwanted notifications  
✅ **Type Icons** - Different icons for different notification types  
✅ **Click to Navigate** - Click notifications to go to related pages  
✅ **Relative Timestamps** - "2 minutes ago" format  

---

## Usage Examples

### Creating Notifications

#### 1. New Match Notification
```typescript
import { notifyNewMatch } from '@/lib/notifications';

// When a match is created
await notifyNewMatch(userId, 'Dr. Ahmad');
```

#### 2. Group Invite Notification
```typescript
import { notifyGroupInvite } from '@/lib/notifications';

// When user is added to a group
await notifyGroupInvite(userId, 'Weekend Doctors', groupId);
```

#### 3. New Message Notification
```typescript
import { notifyNewMessage } from '@/lib/notifications';

// When a message is sent in a group
await notifyNewMessage(userId, 'Dr. Sarah', 'Weekend Doctors', groupId);
```

#### 4. Custom Notification
```typescript
import { createNotification } from '@/lib/notifications';

await createNotification({
  userId: user.id,
  title: 'Profile Updated',
  message: 'Your profile has been successfully updated!',
  type: 'success',
  link: '/dashboard/profile',
  metadata: { action: 'profile_update' }
});
```

### Using in API Routes

#### Example: Notify users when match is accepted
```typescript
// app/api/matches/route.ts

import { notifyGroupInvite } from '@/lib/notifications';

export async function POST(request: Request) {
  // ... match logic ...
  
  // After creating a group
  const { data: group } = await supabase
    .from('groups')
    .insert({ name: 'New Group' })
    .select()
    .single();
  
  // Notify all members
  for (const memberId of memberIds) {
    await notifyGroupInvite(memberId, group.name, group.id);
  }
  
  return Response.json({ success: true });
}
```

### Notification Types

| Type | Icon | Color | Use Case |
|------|------|-------|----------|
| `info` | ℹ️ | Gray | General information |
| `success` | ✅ | Green | Success messages |
| `warning` | ⚠️ | Yellow | Warnings |
| `error` | ❌ | Red | Error messages |
| `match` | 👥 | Blue | New matches |
| `group` | 👥 | Purple | Group activities |
| `message` | 💬 | Blue | New messages |

---

## UI Components

### NotificationBell Component
Displays a bell icon with unread count badge in the header.

**Location:** `components/dashboard/notification-bell.tsx`

**Features:**
- Real-time unread count updates
- Animated pulse for new notifications
- Links to notifications page
- Shows "9+" for 10 or more unread

### Notifications Page
Full notifications page with filtering and management.

**Location:** `app/dashboard/notifications/page.tsx`

**Features:**
- List all notifications
- Filter by read/unread
- Mark as read (single or bulk)
- Delete notifications
- Click to navigate to related page
- Real-time updates
- Beautiful card-based UI

---

## Testing

### 1. Create Test Notifications

You can create test notifications using the Supabase SQL editor:

```sql
-- Test notification for current user
SELECT public.create_notification(
  auth.uid(),
  'Test Notification',
  'This is a test notification message!',
  'info',
  '/dashboard',
  '{}'::jsonb
);

-- Create multiple test notifications
DO $$
BEGIN
  FOR i IN 1..5 LOOP
    PERFORM public.create_notification(
      auth.uid(),
      'Test Notification ' || i,
      'This is test message number ' || i,
      CASE 
        WHEN i % 5 = 0 THEN 'success'
        WHEN i % 5 = 1 THEN 'match'
        WHEN i % 5 = 2 THEN 'group'
        WHEN i % 5 = 3 THEN 'message'
        ELSE 'info'
      END,
      '/dashboard',
      '{}'::jsonb
    );
  END LOOP;
END $$;
```

### 2. Test Real-time Updates

1. Open the notifications page in two browser tabs
2. Create a notification in one tab (or via SQL)
3. Watch it appear instantly in the other tab

### 3. Test Functions

```typescript
// In your app or console
import { createClient } from '@/utils/supabase/client';

const supabase = createClient();

// Test mark as read
await supabase.rpc('mark_notification_read', {
  p_notification_id: 'your-notification-id'
});

// Test mark all as read
await supabase.rpc('mark_all_notifications_read');

// Test get unread count
const { data } = await supabase.rpc('get_unread_count');
console.log('Unread count:', data);
```

---

## Integration Points

### Where to Add Notifications

1. **Matching System** (`app/api/matches/route.ts`)
   - New match found
   - Match accepted
   - Match rejected

2. **Groups** (`app/api/groups/route.ts`)
   - Added to group
   - Group message posted
   - Group member joined

3. **Profile** (`app/api/profile/route.ts`)
   - Profile completed
   - Profile verified

4. **Onboarding** (`app/api/onboarding/route.ts`)
   - Onboarding completed
   - Ready for matching

5. **Scheduled Jobs** (Cron/Background)
   - Weekly matching day reminder
   - Feedback request after weekend
   - Subscription expiring soon

---

## Best Practices

1. **Be Specific** - Make titles and messages clear and actionable
2. **Use Appropriate Types** - Choose the right notification type for better UX
3. **Add Links** - Always include a link for users to take action
4. **Metadata** - Store extra info in metadata for filtering/processing
5. **Cleanup** - Regularly run `cleanup_old_notifications()` to keep database clean
6. **Don't Spam** - Avoid sending too many notifications
7. **Test Realtime** - Always test that real-time updates work properly

---

## Troubleshooting

### Notifications not appearing in real-time
- Check Realtime is enabled in Supabase project settings
- Verify the table is added to publication: `ALTER PUBLICATION supabase_realtime ADD TABLE notifications;`
- Check browser console for WebSocket errors

### Unread count not updating
- Verify RLS policies allow reading notifications
- Check `user_id` matches `auth.uid()`
- Test the `get_unread_count()` function directly

### Can't create notifications
- Verify "System can insert notifications" policy exists
- Check user_id is valid UUID
- Ensure all required fields are provided

---

## Migration to Database

If you haven't run the migration yet:

```bash
# Connect to Supabase
supabase link --project-ref your-project-ref

# Push migrations
supabase db push

# Or manually in Supabase SQL Editor
# Copy and paste the contents of:
# supabase/migrations/20241030_notifications_system.sql
```

---

## Support

For issues or questions:
- Check the [Supabase Documentation](https://supabase.com/docs)
- Review RLS policies in Supabase Dashboard
- Test functions in SQL Editor
- Check browser console for errors

---

**Created:** October 30, 2024  
**Version:** 1.0.0  
**Author:** BeyondRounds Team

