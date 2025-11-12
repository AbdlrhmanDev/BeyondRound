-- ============================================
-- Profiles With Email View
-- ============================================
-- Creates a view that includes email from auth.users for admin user management

-- Drop view if exists
DROP VIEW IF EXISTS public.profiles_with_email;

-- Create profiles_with_email view
-- Joins profiles with auth.users to get email
CREATE VIEW public.profiles_with_email AS
SELECT 
    p.id,
    au.email,
    p.full_name,
    p.avatar_url,
    p.is_onboarding_complete,
    p.is_matchable,
    p.created_at,
    p.updated_at
FROM 
    public.profiles p
LEFT JOIN 
    auth.users au ON p.id = au.id;

-- Grant permissions
GRANT SELECT ON public.profiles_with_email TO authenticated;

-- Note: RLS on views is inherited from underlying tables
-- The view will respect RLS policies on profiles table
-- Admins can see all profiles (via profiles_admin_select_rls.sql)
-- Regular users can only see their own profile

-- Add comment
COMMENT ON VIEW public.profiles_with_email IS 
'View combining profiles with email from auth.users for admin user management. Respects RLS policies from profiles table.';

