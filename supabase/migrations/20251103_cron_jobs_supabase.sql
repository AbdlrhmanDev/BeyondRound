-- ============================================
-- Cron Jobs for BeyondRounds (Supabase Compatible)
-- ============================================

-- Enable pg_cron extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Grant permissions
GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cron TO postgres;

-- ============================================
-- Helper Function: Call HTTP Endpoint
-- ============================================
-- This function will be used to trigger API endpoints from cron
CREATE OR REPLACE FUNCTION public.call_cron_endpoint(
    endpoint_path TEXT,
    cron_secret TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    response_code INT;
BEGIN
    -- Note: Supabase cron can't make HTTP calls directly
    -- This is a placeholder - you'll need to use Supabase Edge Functions
    -- or call SQL functions directly
    RAISE NOTICE 'Cron job triggered for endpoint: %', endpoint_path;
END;
$$;

-- ============================================
-- Direct SQL Cron Jobs (Recommended for Supabase)
-- ============================================

-- 1. Weekly Matching Day Reminder (Thursday 4:00 PM UTC)
SELECT cron.schedule(
    'weekly-matching-day-reminder',
    '0 16 * * 4',
    $$
    INSERT INTO public.notifications (user_id, type, title, message, link, metadata)
    SELECT 
        p.user_id,
        'system',
        'Matching Day Reminder! 🎯',
        'Groups will be created soon. Make sure your profile is up to date!',
        '/dashboard/profile',
        jsonb_build_object(
            'reminder_type', 'weekly_matching',
            'sent_at', NOW()
        )
    FROM public.profiles p
    WHERE p.is_matchable = true;
    $$
);

-- 2. Weekly Feedback Request (Monday 10:00 AM UTC)
SELECT cron.schedule(
    'weekly-feedback-request',
    '0 10 * * 1',
    $$
    WITH recent_groups AS (
        SELECT 
            g.id,
            g.name,
            g.created_at
        FROM public.groups g
        WHERE g.created_at >= NOW() - INTERVAL '7 days'
          AND g.created_at < NOW() - INTERVAL '3 days'
    )
    INSERT INTO public.notifications (user_id, type, title, message, link, metadata)
    SELECT 
        gm.user_id,
        'system',
        'How was your weekend meetup? 💭',
        CONCAT('Please share feedback about your experience with ', rg.name),
        CONCAT('/dashboard/groups/', rg.id),
        jsonb_build_object(
            'group_id', rg.id,
            'group_name', rg.name,
            'action_required', true,
            'feedback_request', true
        )
    FROM recent_groups rg
    INNER JOIN public.group_members gm ON gm.group_id = rg.id
    WHERE NOT EXISTS (
        SELECT 1 
        FROM public.group_feedback gf 
        WHERE gf.group_id = rg.id 
          AND gf.user_id = gm.user_id
    );
    $$
);

-- ============================================
-- Note: Weekly Matching Algorithm
-- ============================================
-- The weekly matching algorithm (weekly_matches_thursday) is complex
-- and requires custom logic. You have 2 options:

-- Option 1: Call it via Supabase Edge Function (Recommended)
-- Create an Edge Function and trigger it from cron

-- Option 2: Use direct SQL (Advanced)
-- Implement the matching algorithm in SQL
-- See example below (commented out)

/*
-- 3. Weekly Matches Thursday (Complex - needs custom implementation)
SELECT cron.schedule(
    'weekly_matches_thursday',
    '0 16 * * 4',
    $$
    -- Your matching algorithm here
    -- This is just a placeholder example
    DO $$
    DECLARE
        matchable_count INTEGER;
    BEGIN
        SELECT COUNT(*) INTO matchable_count
        FROM public.profiles
        WHERE is_matchable = true;
        
        RAISE NOTICE 'Weekly matching: Found % matchable users', matchable_count;
        
        -- TODO: Implement your matching algorithm
        -- 1. Fetch matchable users
        -- 2. Calculate compatibility scores
        -- 3. Create groups
        -- 4. Send notifications
    END $$;
    $$
);
*/

COMMENT ON FUNCTION public.call_cron_endpoint IS 'Helper function to trigger API endpoints from cron jobs';

-- ============================================
-- Verification Query
-- ============================================
-- Run this to see your scheduled jobs:
-- SELECT jobid, jobname, schedule, command FROM cron.job ORDER BY jobname;


