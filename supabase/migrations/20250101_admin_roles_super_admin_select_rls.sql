-- ============================================
-- Add RLS Policy for Super Admins to View All Admin Roles
-- ============================================
-- This allows super admins to SELECT all admin roles for management pages
-- Uses check_is_super_admin() function to avoid recursion

-- Add policy for super admins to view all admin roles
CREATE POLICY "Super admins can view all admin roles"
    ON public.admin_roles
    FOR SELECT
    TO authenticated
    USING (public.check_is_super_admin(auth.uid()));

-- Grant execute permission on the function if not already granted
GRANT EXECUTE ON FUNCTION public.check_is_super_admin(UUID) TO authenticated;

-- Add comment
COMMENT ON POLICY "Super admins can view all admin roles" ON public.admin_roles IS 
    'Allows super admins to view all admin roles for management purposes';

