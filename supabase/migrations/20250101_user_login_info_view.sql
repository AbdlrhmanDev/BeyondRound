-- ============================================
-- User Login Info View
-- ============================================
-- Creates a comprehensive view for determining user redirect paths after login
-- Combines profile data with admin role information

-- Drop view if exists
DROP VIEW IF EXISTS public.user_login_info;

-- Create user_login_info view
CREATE VIEW public.user_login_info AS
SELECT 
    p.id,
    p.email,
    p.full_name,
    p.avatar_url,
    p.is_onboarding_complete,
    p.is_matchable,
    p.created_at,
    p.updated_at,
    -- Admin information
    CASE 
        WHEN ar.id IS NOT NULL THEN TRUE
        ELSE FALSE
    END AS is_admin,
    ar.role AS admin_role,
    -- Determine redirect path
    CASE 
        WHEN ar.id IS NOT NULL THEN '/admin'
        WHEN p.is_onboarding_complete = TRUE THEN '/dashboard'
        ELSE '/onboarding'
    END AS redirect_path
FROM 
    public.profiles p
LEFT JOIN 
    public.admin_roles ar ON p.id = ar.user_id;

-- Grant permissions
GRANT SELECT ON public.user_login_info TO authenticated;
GRANT SELECT ON public.user_login_info TO anon;

-- Create index on profiles for better performance (if not exists)
CREATE INDEX IF NOT EXISTS idx_profiles_id ON public.profiles(id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Function: Get user login info
CREATE OR REPLACE FUNCTION public.get_user_login_info(p_user_id UUID)
RETURNS TABLE (
    id UUID,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    is_onboarding_complete BOOLEAN,
    is_matchable BOOLEAN,
    is_admin BOOLEAN,
    admin_role TEXT,
    redirect_path TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        uli.id,
        uli.email,
        uli.full_name,
        uli.avatar_url,
        uli.is_onboarding_complete,
        uli.is_matchable,
        uli.is_admin,
        uli.admin_role,
        uli.redirect_path,
        uli.created_at,
        uli.updated_at
    FROM public.user_login_info uli
    WHERE uli.id = p_user_id;
END;
$$;

-- Function: Check if user is admin (simplified)
CREATE OR REPLACE FUNCTION public.is_user_admin(p_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_login_info
        WHERE id = p_user_id AND is_admin = TRUE
    );
END;
$$;

-- Function: Get redirect path for user
CREATE OR REPLACE FUNCTION public.get_user_redirect_path(p_user_id UUID DEFAULT auth.uid())
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    redirect_path TEXT;
BEGIN
    SELECT uli.redirect_path INTO redirect_path
    FROM public.user_login_info uli
    WHERE uli.id = p_user_id;
    
    RETURN COALESCE(redirect_path, '/onboarding');
END;
$$;

-- Add comments
COMMENT ON VIEW public.user_login_info IS 'Comprehensive view for determining user redirect paths after login';
COMMENT ON FUNCTION public.get_user_login_info IS 'Get complete login info for a user including admin status and redirect path';
COMMENT ON FUNCTION public.is_user_admin IS 'Check if a user is an admin (simplified check)';
COMMENT ON FUNCTION public.get_user_redirect_path IS 'Get the redirect path for a user after login';

