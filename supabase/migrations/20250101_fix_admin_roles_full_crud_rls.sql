-- ============================================
-- Fix Admin Roles Full CRUD RLS Policies
-- ============================================
-- Ensures all CRUD operations work correctly for super admins
-- This migration consolidates and fixes all RLS policies

-- 1. Ensure check_is_super_admin function exists and is correct
CREATE OR REPLACE FUNCTION public.check_is_super_admin(p_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
BEGIN
    -- Direct query without RLS recursion
    RETURN EXISTS (
        SELECT 1 FROM public.admin_roles
        WHERE user_id = p_user_id
        AND role = 'super_admin'
    );
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.check_is_super_admin(UUID) TO authenticated;

-- 2. Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Admins can view admin roles" ON public.admin_roles;
DROP POLICY IF EXISTS "Super admins can view all admin roles" ON public.admin_roles;
DROP POLICY IF EXISTS "System can insert admin roles" ON public.admin_roles;
DROP POLICY IF EXISTS "Super admins can insert admin roles" ON public.admin_roles;
DROP POLICY IF EXISTS "Super admins can update admin roles" ON public.admin_roles;
DROP POLICY IF EXISTS "Super admins can delete admin roles" ON public.admin_roles;

-- 3. Create SELECT policy - Super admins can view all admin roles
CREATE POLICY "Super admins can view all admin roles"
    ON public.admin_roles
    FOR SELECT
    TO authenticated
    USING (public.check_is_super_admin(auth.uid()));

-- 4. Create INSERT policy - Super admins can insert admin roles
CREATE POLICY "Super admins can insert admin roles"
    ON public.admin_roles
    FOR INSERT
    TO authenticated
    WITH CHECK (public.check_is_super_admin(auth.uid()));

-- 5. Create UPDATE policy - Super admins can update admin roles
CREATE POLICY "Super admins can update admin roles"
    ON public.admin_roles
    FOR UPDATE
    TO authenticated
    USING (public.check_is_super_admin(auth.uid()))
    WITH CHECK (public.check_is_super_admin(auth.uid()));

-- 6. Create DELETE policy - Super admins can delete admin roles
CREATE POLICY "Super admins can delete admin roles"
    ON public.admin_roles
    FOR DELETE
    TO authenticated
    USING (public.check_is_super_admin(auth.uid()));

-- 7. Add comments
COMMENT ON FUNCTION public.check_is_super_admin(UUID) IS 
    'Check if user is super admin (non-recursive, used in RLS policies)';

COMMENT ON POLICY "Super admins can view all admin roles" ON public.admin_roles IS 
    'Allows super admins to view all admin roles for management purposes';

COMMENT ON POLICY "Super admins can insert admin roles" ON public.admin_roles IS 
    'Allows super admins to insert new admin roles';

COMMENT ON POLICY "Super admins can update admin roles" ON public.admin_roles IS 
    'Allows super admins to update existing admin roles';

COMMENT ON POLICY "Super admins can delete admin roles" ON public.admin_roles IS 
    'Allows super admins to delete admin roles';

