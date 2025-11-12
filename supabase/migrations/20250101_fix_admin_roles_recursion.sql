-- ============================================
-- Fix Infinite Recursion in Admin Roles RLS
-- ============================================
-- The "Admins can view all admin roles" policy causes infinite recursion
-- because it queries admin_roles within its own RLS check

-- Drop the problematic policy that causes recursion
DROP POLICY IF EXISTS "Admins can view all admin roles" ON public.admin_roles;

-- Create a SECURITY DEFINER function to get all admin roles (bypasses RLS)
-- This function can be used by admin management pages
CREATE OR REPLACE FUNCTION public.get_all_admin_roles()
RETURNS TABLE (
    id UUID,
    user_id UUID,
    role TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Check if current user is an admin using the non-recursive function
    IF NOT public.is_admin(auth.uid()) THEN
        RAISE EXCEPTION 'Access denied. Admin access required.';
    END IF;
    
    -- Return all admin roles (bypasses RLS due to SECURITY DEFINER)
    RETURN QUERY
    SELECT 
        ar.id,
        ar.user_id,
        ar.role,
        ar.created_at,
        ar.updated_at
    FROM public.admin_roles ar;
END;
$$;

-- Also fix the UPDATE and DELETE policies to avoid recursion
-- Use SECURITY DEFINER functions instead

-- Function to check if user is super admin (non-recursive)
CREATE OR REPLACE FUNCTION public.check_is_super_admin(p_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- Drop existing UPDATE and DELETE policies
DROP POLICY IF EXISTS "Super admins can update admin roles" ON public.admin_roles;
DROP POLICY IF EXISTS "Super admins can delete admin roles" ON public.admin_roles;

-- Create new policies using the function (avoids recursion)
CREATE POLICY "Super admins can update admin roles"
    ON public.admin_roles
    FOR UPDATE
    TO authenticated
    USING (public.check_is_super_admin(auth.uid()))
    WITH CHECK (public.check_is_super_admin(auth.uid()));

CREATE POLICY "Super admins can delete admin roles"
    ON public.admin_roles
    FOR DELETE
    TO authenticated
    USING (public.check_is_super_admin(auth.uid()));

-- Add comments
COMMENT ON FUNCTION public.get_all_admin_roles IS 'Get all admin roles (admin only, bypasses RLS to avoid recursion)';
COMMENT ON FUNCTION public.check_is_super_admin IS 'Check if user is super admin (non-recursive)';

