-- ============================================
-- Fix Admin Roles DELETE Permissions
-- ============================================
-- Creates RPC function for deleting admin roles to bypass RLS issues
-- This ensures super admins can delete admin roles without permission errors

-- 1. Create RPC function to delete admin role (bypasses RLS)
CREATE OR REPLACE FUNCTION public.delete_admin_role(p_admin_role_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_current_user_id UUID;
    v_is_super_admin BOOLEAN;
BEGIN
    -- Get current user
    v_current_user_id := auth.uid();
    
    IF v_current_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;
    
    -- Check if current user is super admin (bypasses RLS due to SECURITY DEFINER)
    SELECT EXISTS (
        SELECT 1 FROM public.admin_roles
        WHERE user_id = v_current_user_id
        AND role = 'super_admin'
    ) INTO v_is_super_admin;
    
    IF NOT v_is_super_admin THEN
        RAISE EXCEPTION 'Permission denied. Super admin access required.';
    END IF;
    
    -- Delete the admin role (bypasses RLS due to SECURITY DEFINER)
    DELETE FROM public.admin_roles
    WHERE id = p_admin_role_id;
    
    -- Return true if row was deleted
    RETURN FOUND;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.delete_admin_role(UUID) TO authenticated;

-- 2. Ensure DELETE policy exists and uses the function
DROP POLICY IF EXISTS "Super admins can delete admin roles" ON public.admin_roles;

CREATE POLICY "Super admins can delete admin roles"
    ON public.admin_roles
    FOR DELETE
    TO authenticated
    USING (
        public.check_is_super_admin(auth.uid())
    );

-- 3. Add comment
COMMENT ON FUNCTION public.delete_admin_role(UUID) IS 
    'Delete an admin role. Requires super admin privileges. Bypasses RLS to avoid permission issues.';

