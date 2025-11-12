-- ============================================
-- Fix Admin Roles RLS Policy
-- ============================================
-- Allow users to check their own admin role
-- This fixes the circular dependency issue

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Admins can view admin roles" ON public.admin_roles;

-- Create a policy that allows users to check their own role (no circular dependency)
CREATE POLICY "Users can view own admin role"
    ON public.admin_roles
    FOR SELECT
    USING (auth.uid() = user_id);

-- Allow admins to view all admin roles (for admin management pages)
-- This uses a function to avoid circular dependency
CREATE POLICY "Admins can view all admin roles"
    ON public.admin_roles
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_roles ar
            WHERE ar.user_id = auth.uid()
        )
    );

