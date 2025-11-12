-- ============================================
-- Profiles Table RLS Policy for SELECT
-- ============================================
-- Allows users to view their own profile and admins to view all profiles

-- Ensure RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing select policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Create policy: Users can view their own profile
CREATE POLICY "Users can view own profile"
    ON public.profiles
    FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

-- Create a helper function for RLS policy (avoids recursion)
-- This function bypasses RLS to check admin status
CREATE OR REPLACE FUNCTION public.check_user_is_admin_for_rls()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
    is_admin_user BOOLEAN;
BEGIN
    -- Direct query bypasses RLS due to SECURITY DEFINER
    -- This avoids recursion issues
    SELECT EXISTS (
        SELECT 1 FROM public.admin_roles
        WHERE user_id = auth.uid()
    ) INTO is_admin_user;
    
    RETURN COALESCE(is_admin_user, FALSE);
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.check_user_is_admin_for_rls() TO authenticated;

-- Create policy: Admins can view all profiles
-- Uses SECURITY DEFINER function to avoid recursion
CREATE POLICY "Admins can view all profiles"
    ON public.profiles
    FOR SELECT
    TO authenticated
    USING (public.check_user_is_admin_for_rls());

-- Add comments
COMMENT ON POLICY "Users can view own profile" ON public.profiles IS 
'Allows authenticated users to view their own profile';

COMMENT ON POLICY "Admins can view all profiles" ON public.profiles IS 
'Allows admins to view all profiles for user management';

