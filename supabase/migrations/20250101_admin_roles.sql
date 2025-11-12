-- ============================================
-- ADMIN NOTIFICATIONS QUERIES
-- Comprehensive Admin Dashboard & Management
-- ============================================

-- ============================================
-- 📊 SYSTEM OVERVIEW QUERIES
-- ============================================

-- 1️⃣ Complete System Statistics Dashboard
SELECT 
  COUNT(*) as total_notifications,
  COUNT(DISTINCT user_id) as total_users_with_notifications,
  COUNT(*) FILTER (WHERE is_read = false) as total_unread,
  COUNT(*) FILTER (WHERE is_read = true) as total_read,
  ROUND(COUNT(*) FILTER (WHERE is_read = true)::NUMERIC / NULLIF(COUNT(*), 0) * 100, 2) as overall_read_rate,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours') as last_24h,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') as last_7_days,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '30 days') as last_30_days,
  COUNT(*) FILTER (WHERE is_read = false AND created_at < NOW() - INTERVAL '7 days') as urgent_unread
FROM public.notifications;

-- 2️⃣ Notifications by Type Breakdown
SELECT 
  type,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE is_read = false) as unread,
  COUNT(*) FILTER (WHERE is_read = true) as read,
  ROUND(COUNT(*) FILTER (WHERE is_read = true)::NUMERIC / NULLIF(COUNT(*), 0) * 100, 2) as read_rate,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage_of_total,
  MIN(created_at) as first_sent,
  MAX(created_at) as last_sent
FROM public.notifications
GROUP BY type
ORDER BY total DESC;

-- 3️⃣ Top 20 Users by Notification Activity
SELECT 
  p.id,
  p.full_name,
  p.city,
  p.created_at as user_joined_date,
  COUNT(n.id) as total_notifications,
  COUNT(n.id) FILTER (WHERE n.is_read = false) as unread_count,
  COUNT(n.id) FILTER (WHERE n.is_read = true) as read_count,
  ROUND(COUNT(n.id) FILTER (WHERE n.is_read = true)::NUMERIC / NULLIF(COUNT(n.id), 0) * 100, 2) as read_rate,
  MAX(n.created_at) as last_notification_date
FROM public.profiles p
LEFT JOIN public.notifications n ON p.id = n.user_id
GROUP BY p.id, p.full_name, p.city, p.created_at
HAVING COUNT(n.id) > 0
ORDER BY total_notifications DESC
LIMIT 20;

-- 4️⃣ Users with Most Unread Notifications (Problem Users)
SELECT 
  p.id,
  p.full_name,
  p.city,
  p.last_activity,
  COUNT(n.id) as unread_count,
  MIN(n.created_at) as oldest_unread_date,
  MAX(n.created_at) as newest_unread_date,
  EXTRACT(DAY FROM (NOW() - MIN(n.created_at))) as days_since_oldest_unread
FROM public.notifications n
JOIN public.profiles p ON n.user_id = p.id
WHERE n.is_read = false
GROUP BY p.id, p.full_name, p.city, p.last_activity
ORDER BY unread_count DESC
LIMIT 50;

-- 5️⃣ Inactive Users with Unread Notifications
SELECT 
  p.id,
  p.full_name,
  p.city,
  p.last_activity,
  COUNT(n.id) as unread_notifications,
  EXTRACT(DAY FROM (NOW() - p.last_activity)) as days_inactive
FROM public.profiles p
JOIN public.notifications n ON p.id = n.user_id
WHERE n.is_read = false
  AND p.last_activity < NOW() - INTERVAL '30 days'
GROUP BY p.id, p.full_name, p.city, p.last_activity
ORDER BY days_inactive DESC, unread_notifications DESC
LIMIT 50;

-- 6️⃣ Notification Volume Over Time (Daily)
SELECT 
  DATE(created_at) as date,
  COUNT(*) as total_sent,
  COUNT(*) FILTER (WHERE is_read = true) as read,
  COUNT(*) FILTER (WHERE is_read = false) as unread,
  COUNT(DISTINCT user_id) as unique_users,
  ROUND(COUNT(*) FILTER (WHERE is_read = true)::NUMERIC / COUNT(*) * 100, 2) as read_rate
FROM public.notifications
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- 7️⃣ Hourly Notification Distribution (Last 7 Days)
SELECT 
  EXTRACT(HOUR FROM created_at) as hour_of_day,
  COUNT(*) as total_notifications,
  ROUND(AVG(COUNT(*)) OVER (), 2) as average_per_hour
FROM public.notifications
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY EXTRACT(HOUR FROM created_at)
ORDER BY hour_of_day;

-- 8️⃣ Notification Performance by City
SELECT 
  p.city,
  COUNT(n.id) as total_notifications,
  COUNT(n.id) FILTER (WHERE n.is_read = true) as read_notifications,
  ROUND(COUNT(n.id) FILTER (WHERE n.is_read = true)::NUMERIC / NULLIF(COUNT(n.id), 0) * 100, 2) as read_rate,
  COUNT(DISTINCT n.user_id) as unique_users
FROM public.notifications n
JOIN public.profiles p ON n.user_id = p.id
GROUP BY p.city
HAVING COUNT(n.id) > 10
ORDER BY total_notifications DESC;

-- ============================================
-- 📬 BULK NOTIFICATION OPERATIONS
-- ============================================

-- 9️⃣ Send Notification to All Active Users
INSERT INTO public.notifications (user_id, type, title, message, link)
SELECT 
  id as user_id,
  'announcement',
  'System Announcement',
  'Important system update message here',
  '/announcements/latest'
FROM public.profiles
WHERE deleted_at IS NULL
  AND last_activity > NOW() - INTERVAL '30 days';

-- 🔟 Send Notification to Users by City
INSERT INTO public.notifications (user_id, type, title, message, link)
SELECT 
  id as user_id,
  'announcement',
  'City Event Announcement',
  'Special event in your city',
  '/events/city-event'
FROM public.profiles
WHERE city = 'Riyadh'
  AND deleted_at IS NULL;

-- 1️⃣1️⃣ Send Notification to Users with Unread Notifications (Reminder)
INSERT INTO public.notifications (user_id, type, title, message, link)
SELECT DISTINCT 
  n.user_id,
  'reminder',
  'You Have Unread Notifications',
  'Don''t miss out on important updates',
  '/notifications'
FROM public.notifications n
WHERE n.is_read = false
  AND n.created_at < NOW() - INTERVAL '7 days'
GROUP BY n.user_id
HAVING COUNT(*) >= 5;

-- 1️⃣2️⃣ Send Notification to Users by Medical Specialty
INSERT INTO public.notifications (user_id, type, title, message, link)
SELECT 
  mp.user_id,
  'announcement',
  'Specialty-Specific Update',
  'Important update for your specialty',
  '/specialty-updates'
FROM public.medical_profiles mp
WHERE 'cardiology' = ANY(mp.specialties)
  AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = mp.user_id AND p.deleted_at IS NULL);

-- 1️⃣3️⃣ Send Notification to Premium Users
INSERT INTO public.notifications (user_id, type, title, message, link)
SELECT 
  s.user_id,
  'premium',
  'Exclusive Premium Update',
  'Special message for premium members',
  '/premium/exclusive'
FROM public.subscriptions s
WHERE s.status = 'active'
  AND s.plan IN ('monthly', 'annual');

-- 1️⃣4️⃣ Send Welcome Notification to New Users (Last 7 Days)
INSERT INTO public.notifications (user_id, type, title, message, link)
SELECT 
  id as user_id,
  'welcome',
  'Welcome to the Platform!',
  'Get started with your profile',
  '/onboarding'
FROM public.profiles
WHERE created_at >= NOW() - INTERVAL '7 days'
  AND is_onboarding_complete = false
  AND NOT EXISTS (
    SELECT 1 FROM public.notifications n 
    WHERE n.user_id = profiles.id AND n.type = 'welcome'
  );

-- ============================================
-- 📈 USER ENGAGEMENT TRACKING
-- ============================================

-- 1️⃣5️⃣ User Engagement Score (Read Rate Analysis)
SELECT 
  p.id,
  p.full_name,
  p.city,
  COUNT(n.id) as total_notifications,
  COUNT(n.id) FILTER (WHERE n.is_read = true) as notifications_read,
  ROUND(COUNT(n.id) FILTER (WHERE n.is_read = true)::NUMERIC / NULLIF(COUNT(n.id), 0) * 100, 2) as engagement_score,
  CASE 
    WHEN COUNT(n.id) FILTER (WHERE n.is_read = true)::NUMERIC / NULLIF(COUNT(n.id), 0) >= 0.8 THEN 'Highly Engaged'
    WHEN COUNT(n.id) FILTER (WHERE n.is_read = true)::NUMERIC / NULLIF(COUNT(n.id), 0) >= 0.5 THEN 'Moderately Engaged'
    WHEN COUNT(n.id) FILTER (WHERE n.is_read = true)::NUMERIC / NULLIF(COUNT(n.id), 0) >= 0.2 THEN 'Low Engagement'
    ELSE 'Not Engaged'
  END as engagement_level,
  MAX(n.created_at) as last_notification_date
FROM public.profiles p
JOIN public.notifications n ON p.id = n.user_id
GROUP BY p.id, p.full_name, p.city
HAVING COUNT(n.id) >= 5
ORDER BY engagement_score DESC;

-- 1️⃣6️⃣ Notification Type Engagement Analysis
SELECT 
  n.type,
  COUNT(*) as total_sent,
  COUNT(*) FILTER (WHERE n.is_read = true) as total_read,
  ROUND(COUNT(*) FILTER (WHERE n.is_read = true)::NUMERIC / COUNT(*) * 100, 2) as read_rate,
  COUNT(DISTINCT n.user_id) as unique_users_reached,
  COUNT(DISTINCT CASE WHEN n.is_read = true THEN n.user_id END) as unique_users_engaged,
  ROUND(COUNT(DISTINCT CASE WHEN n.is_read = true THEN n.user_id END)::NUMERIC / 
        NULLIF(COUNT(DISTINCT n.user_id), 0) * 100, 2) as user_engagement_rate
FROM public.notifications n
WHERE n.created_at >= NOW() - INTERVAL '30 days'
GROUP BY n.type
ORDER BY read_rate DESC;

-- 1️⃣7️⃣ Users Who Never Read Notifications
SELECT 
  p.id,
  p.full_name,
  p.city,
  p.created_at as joined_date,
  COUNT(n.id) as total_notifications_received,
  COUNT(n.id) FILTER (WHERE n.is_read = false) as unread_count,
  MAX(n.created_at) as last_notification_sent
FROM public.profiles p
JOIN public.notifications n ON p.id = n.user_id
GROUP BY p.id, p.full_name, p.city, p.created_at
HAVING COUNT(n.id) >= 10
  AND COUNT(n.id) FILTER (WHERE n.is_read = true) = 0
ORDER BY total_notifications_received DESC;

-- 1️⃣8️⃣ Most Responsive Users (Quick Readers)
SELECT 
  p.id,
  p.full_name,
  p.city,
  COUNT(n.id) as total_read,
  ROUND(AVG(EXTRACT(EPOCH FROM (NOW() - n.created_at)) / 3600), 2) as avg_hours_notification_age
FROM public.profiles p
JOIN public.notifications n ON p.id = n.user_id
WHERE n.is_read = true
  AND n.created_at >= NOW() - INTERVAL '30 days'
GROUP BY p.id, p.full_name, p.city
HAVING COUNT(n.id) >= 5
ORDER BY avg_hours_notification_age ASC
LIMIT 20;

-- 1️⃣9️⃣ User Segments by Engagement Level
WITH engagement_data AS (
  SELECT 
    n.user_id,
    COUNT(*) as total_notifications,
    COUNT(*) FILTER (WHERE n.is_read = true) as read_count,
    ROUND(COUNT(*) FILTER (WHERE n.is_read = true)::NUMERIC / COUNT(*) * 100, 2) as read_rate
  FROM public.notifications n
  WHERE n.created_at >= NOW() - INTERVAL '30 days'
  GROUP BY n.user_id
  HAVING COUNT(*) >= 3
),
segments AS (
  SELECT 
    CASE 
      WHEN read_rate >= 80 THEN 'Highly Engaged (80-100%)'
      WHEN read_rate >= 50 THEN 'Moderately Engaged (50-79%)'
      WHEN read_rate >= 20 THEN 'Low Engagement (20-49%)'
      ELSE 'Not Engaged (0-19%)'
    END as engagement_segment,
    total_notifications,
    read_count
  FROM engagement_data
)
SELECT 
  engagement_segment,
  COUNT(*) as user_count,
  ROUND(AVG(total_notifications), 1) as avg_notifications_received,
  ROUND(AVG(read_count), 1) as avg_notifications_read
FROM segments
GROUP BY engagement_segment
ORDER BY 
  CASE 
    WHEN engagement_segment = 'Highly Engaged (80-100%)' THEN 1
    WHEN engagement_segment = 'Moderately Engaged (50-79%)' THEN 2
    WHEN engagement_segment = 'Low Engagement (20-49%)' THEN 3
    ELSE 4
  END;

-- 2️⃣0️⃣ Re-engagement Candidates (Users to Target)
SELECT 
  p.id,
  p.full_name,
  p.city,
  p.last_activity,
  COUNT(n.id) as unread_notifications,
  MIN(n.created_at) as oldest_unread_notification,
  EXTRACT(DAY FROM (NOW() - MIN(n.created_at))) as days_since_first_unread,
  EXTRACT(DAY FROM (NOW() - p.last_activity)) as days_since_last_activity
FROM public.profiles p
JOIN public.notifications n ON p.id = n.user_id
WHERE n.is_read = false
  AND p.last_activity BETWEEN (NOW() - INTERVAL '90 days') AND (NOW() - INTERVAL '14 days')
GROUP BY p.id, p.full_name, p.city, p.last_activity
HAVING COUNT(n.id) >= 3
ORDER BY days_since_last_activity DESC
LIMIT 100;

-- ============================================
-- 🎯 PERFORMANCE METRICS
-- ============================================

-- 2️⃣1️⃣ Notification Delivery Performance
SELECT 
  DATE(created_at) as date,
  COUNT(*) as notifications_sent,
  COUNT(*) FILTER (WHERE is_read = true) as notifications_read,
  ROUND(COUNT(*) FILTER (WHERE is_read = true)::NUMERIC / COUNT(*) * 100, 2) as delivery_success_rate,
  COUNT(DISTINCT user_id) as unique_users,
  ROUND(COUNT(*)::NUMERIC / COUNT(DISTINCT user_id), 2) as avg_notifications_per_user
FROM public.notifications
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- 2️⃣2️⃣ Performance by Notification Type (Detailed)
SELECT 
  type,
  COUNT(*) as total_sent,
  COUNT(*) FILTER (WHERE is_read = true) as total_read,
  COUNT(*) FILTER (WHERE is_read = false) as total_unread,
  ROUND(COUNT(*) FILTER (WHERE is_read = true)::NUMERIC / COUNT(*) * 100, 2) as read_rate,
  ROUND(COUNT(*) FILTER (WHERE is_read = false)::NUMERIC / COUNT(*) * 100, 2) as unread_rate,
  COUNT(DISTINCT user_id) as unique_recipients,
  ROUND(COUNT(*)::NUMERIC / COUNT(DISTINCT user_id), 2) as avg_per_user
FROM public.notifications
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY type
ORDER BY total_sent DESC;

-- 2️⃣3️⃣ Peak Notification Hours (Best Time to Send)
SELECT 
  EXTRACT(HOUR FROM created_at) as hour_of_day,
  COUNT(*) as total_sent,
  COUNT(*) FILTER (WHERE is_read = true) as total_read,
  ROUND(COUNT(*) FILTER (WHERE is_read = true)::NUMERIC / COUNT(*) * 100, 2) as read_rate,
  CASE 
    WHEN EXTRACT(HOUR FROM created_at) BETWEEN 6 AND 11 THEN 'Morning (6AM-11AM)'
    WHEN EXTRACT(HOUR FROM created_at) BETWEEN 12 AND 17 THEN 'Afternoon (12PM-5PM)'
    WHEN EXTRACT(HOUR FROM created_at) BETWEEN 18 AND 22 THEN 'Evening (6PM-10PM)'
    ELSE 'Night (11PM-5AM)'
  END as time_period
FROM public.notifications
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY EXTRACT(HOUR FROM created_at)
ORDER BY read_rate DESC;

-- 2️⃣4️⃣ Weekly Performance Trend
SELECT 
  DATE_TRUNC('week', created_at) as week_start,
  COUNT(*) as notifications_sent,
  COUNT(*) FILTER (WHERE is_read = true) as notifications_read,
  ROUND(COUNT(*) FILTER (WHERE is_read = true)::NUMERIC / COUNT(*) * 100, 2) as read_rate,
  COUNT(DISTINCT user_id) as active_users
FROM public.notifications
WHERE created_at >= NOW() - INTERVAL '90 days'
GROUP BY DATE_TRUNC('week', created_at)
ORDER BY week_start DESC;

-- 2️⃣5️⃣ Notification Load per User Analysis
SELECT 
  user_count_range,
  COUNT(*) as number_of_users,
  ROUND(AVG(total_notifications), 1) as avg_notifications,
  ROUND(AVG(unread_notifications), 1) as avg_unread
FROM (
  SELECT 
    user_id,
    COUNT(*) as total_notifications,
    COUNT(*) FILTER (WHERE is_read = false) as unread_notifications,
    CASE 
      WHEN COUNT(*) >= 100 THEN '100+'
      WHEN COUNT(*) >= 50 THEN '50-99'
      WHEN COUNT(*) >= 20 THEN '20-49'
      WHEN COUNT(*) >= 10 THEN '10-19'
      ELSE '1-9'
    END as user_count_range
  FROM public.notifications
  WHERE created_at >= NOW() - INTERVAL '30 days'
  GROUP BY user_id
) subquery
GROUP BY user_count_range
ORDER BY 
  CASE user_count_range
    WHEN '1-9' THEN 1
    WHEN '10-19' THEN 2
    WHEN '20-49' THEN 3
    WHEN '50-99' THEN 4
    WHEN '100+' THEN 5
  END;

-- 2️⃣6️⃣ System Health Check
SELECT 
  'Total Active Users' as metric,
  COUNT(DISTINCT id)::TEXT as value
FROM public.profiles
WHERE deleted_at IS NULL

UNION ALL

SELECT 
  'Users with Notifications' as metric,
  COUNT(DISTINCT user_id)::TEXT as value
FROM public.notifications

UNION ALL

SELECT 
  'Average Notifications per User' as metric,
  ROUND(COUNT(*)::NUMERIC / NULLIF(COUNT(DISTINCT user_id), 0), 2)::TEXT as value
FROM public.notifications

UNION ALL

SELECT 
  'Overall Read Rate' as metric,
  ROUND(COUNT(*) FILTER (WHERE is_read = true)::NUMERIC / NULLIF(COUNT(*), 0) * 100, 2)::TEXT || '%' as value
FROM public.notifications

UNION ALL

SELECT 
  'Unread Notifications' as metric,
  COUNT(*) FILTER (WHERE is_read = false)::TEXT as value
FROM public.notifications

UNION ALL

SELECT 
  'Last 24h Activity' as metric,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours')::TEXT as value
FROM public.notifications;

-- ============================================
-- 🧹 MAINTENANCE & CLEANUP QUERIES
-- ============================================

-- 2️⃣7️⃣ Identify Old Read Notifications for Cleanup
SELECT 
  COUNT(*) as notifications_to_delete,
  MIN(created_at) as oldest_notification,
  MAX(created_at) as newest_notification
FROM public.notifications
WHERE is_read = true
  AND created_at < NOW() - INTERVAL '90 days';

-- 2️⃣8️⃣ Cleanup Old Read Notifications (Execute with caution!)
-- DELETE FROM public.notifications
-- WHERE is_read = true
--   AND created_at < NOW() - INTERVAL '90 days';

-- 2️⃣9️⃣ Bulk Mark Old Unread as Read (for inactive users)
-- UPDATE public.notifications
-- SET is_read = true
-- WHERE is_read = false
--   AND created_at < NOW() - INTERVAL '180 days'
--   AND user_id IN (
--     SELECT id FROM public.profiles 
--     WHERE last_activity < NOW() - INTERVAL '90 days'
--   );

-- 3️⃣0️⃣ Database Size and Growth Metrics
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
  pg_total_relation_size(schemaname||'.'||tablename) AS size_bytes
FROM pg_tables
WHERE tablename = 'notifications'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;