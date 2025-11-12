-- ============================================
-- Fix Admin Roles INSERT RLS Policy
-- ============================================
-- Updates INSERT policy to use SECURITY DEFINER function
-- to allow super admins to insert admin roles

-- Drop the existing INSERT policy
DROP POLICY IF EXISTS "System can insert admin roles" ON public.admin_roles;

-- Create new INSERT policy using check_is_super_admin function
-- This allows super admins to insert new admin roles
CREATE POLICY "Super admins can insert admin roles"
    ON public.admin_roles
    FOR INSERT
    TO authenticated
    WITH CHECK (public.check_is_super_admin(auth.uid()));

-- Grant execute permission on the function if not already granted
GRANT EXECUTE ON FUNCTION public.check_is_super_admin(UUID) TO authenticated;

-- Add comment
COMMENT ON POLICY "Super admins can insert admin roles" ON public.admin_roles IS 
    'Allows super admins to insert new admin roles';

