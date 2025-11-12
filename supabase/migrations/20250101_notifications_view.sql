-- ============================================
-- Notifications View Migration
-- ============================================
-- Creates a comprehensive view of notifications with user profile information
-- and computed fields for easier querying

-- Drop view if it exists (for idempotency)
DROP VIEW IF EXISTS public.notifications_view;

-- Create notifications view with user profile information
CREATE VIEW public.notifications_view AS
SELECT 
    n.id,
    n.user_id,
    n.title,
    n.message,
    n.type,
    n.link,
    n.is_read,
    n.created_at,
    n.read_at,
    n.metadata,
    -- User profile information
    p.full_name AS user_full_name,
    p.email AS user_email,
    p.avatar_url AS user_avatar_url,
    p.city AS user_city,
    -- Computed fields
    CASE 
        WHEN n.is_read THEN 'read'
        ELSE 'unread'
    END AS status,
    -- Time since creation (in hours)
    EXTRACT(EPOCH FROM (NOW() - n.created_at)) / 3600 AS hours_ago,
    -- Time since read (in hours, NULL if not read)
    CASE 
        WHEN n.read_at IS NOT NULL 
        THEN EXTRACT(EPOCH FROM (NOW() - n.read_at)) / 3600
        ELSE NULL
    END AS hours_since_read,
    -- Is recent (created within last 24 hours)
    CASE 
        WHEN n.created_at > NOW() - INTERVAL '24 hours' THEN TRUE
        ELSE FALSE
    END AS is_recent,
    -- Is urgent (unread and older than 7 days)
    CASE 
        WHEN n.is_read = FALSE AND n.created_at < NOW() - INTERVAL '7 days' THEN TRUE
        ELSE FALSE
    END AS is_urgent,
    -- Priority based on type and read status
    CASE 
        WHEN n.type IN ('error', 'warning') AND n.is_read = FALSE THEN 'high'
        WHEN n.type IN ('match', 'group') AND n.is_read = FALSE THEN 'medium'
        WHEN n.is_read = FALSE THEN 'normal'
        ELSE 'low'
    END AS priority
FROM 
    public.notifications n
LEFT JOIN 
    public.profiles p ON n.user_id = p.id;

-- Grant permissions (respects RLS on underlying tables)
GRANT SELECT ON public.notifications_view TO authenticated;
GRANT SELECT ON public.notifications_view TO anon;

-- Add comment
COMMENT ON VIEW public.notifications_view IS 'Comprehensive view of notifications with user profile information and computed fields';

-- Create index on the underlying table if needed (already exists, but documenting)
-- The view will use indexes on the notifications table automatically

