-- ============================================
-- Profiles Table - Full Admin Access (UPDATE & DELETE)
-- ============================================
-- Grants admins full CRUD access to profiles table

-- Ensure RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing admin policies if they exist
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can delete all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;

-- Create policy: Admins can update any profile
-- Uses SECURITY DEFINER function to avoid recursion
CREATE POLICY "Admins can update all profiles"
    ON public.profiles
    FOR UPDATE
    TO authenticated
    USING (public.check_user_is_admin_for_rls())
    WITH CHECK (public.check_user_is_admin_for_rls());

-- Create policy: Admins can delete any profile
-- Uses SECURITY DEFINER function to avoid recursion
CREATE POLICY "Admins can delete all profiles"
    ON public.profiles
    FOR DELETE
    TO authenticated
    USING (public.check_user_is_admin_for_rls());

-- Create policy: Admins can insert profiles
-- Uses SECURITY DEFINER function to avoid recursion
CREATE POLICY "Admins can insert profiles"
    ON public.profiles
    FOR INSERT
    TO authenticated
    WITH CHECK (public.check_user_is_admin_for_rls());

-- Add comments
COMMENT ON POLICY "Admins can update all profiles" ON public.profiles IS 
'Allows admins to update any user profile';

COMMENT ON POLICY "Admins can delete all profiles" ON public.profiles IS 
'Allows admins to delete any user profile';

COMMENT ON POLICY "Admins can insert profiles" ON public.profiles IS 
'Allows admins to create new user profiles';

