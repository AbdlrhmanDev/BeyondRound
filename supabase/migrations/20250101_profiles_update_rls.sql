-- ============================================
-- Profiles Table RLS Policy for Updates
-- ============================================
-- Allows users to update their own profile during onboarding

-- Enable RLS if not already enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing update policy if it exists
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Create policy: Users can update their own profile
-- This policy does NOT check admin_roles to avoid recursion issues
CREATE POLICY "Users can update own profile"
    ON public.profiles
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Add comment
COMMENT ON POLICY "Users can update own profile" ON public.profiles IS 
'Allows authenticated users to update their own profile data, including during onboarding completion';

