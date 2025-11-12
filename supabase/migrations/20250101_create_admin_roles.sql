-- ============================================
-- Admin Roles System Migration
-- ============================================
-- Creates admin_roles table for managing admin users

-- 1. Create admin_roles table
CREATE TABLE IF NOT EXISTS public.admin_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create indexes
CREATE INDEX IF NOT EXISTS idx_admin_roles_user_id ON public.admin_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_roles_role ON public.admin_roles(role);

-- 3. Enable Row Level Security
ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
-- Only admins can view admin roles (for security)
CREATE POLICY "Admins can view admin roles"
    ON public.admin_roles
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_roles ar
            WHERE ar.user_id = auth.uid()
        )
    );

-- System can insert admin roles (for initial setup)
CREATE POLICY "System can insert admin roles"
    ON public.admin_roles
    FOR INSERT
    WITH CHECK (true);

-- Only super admins can update admin roles
CREATE POLICY "Super admins can update admin roles"
    ON public.admin_roles
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_roles ar
            WHERE ar.user_id = auth.uid()
            AND ar.role = 'super_admin'
        )
    );

-- Only super admins can delete admin roles
CREATE POLICY "Super admins can delete admin roles"
    ON public.admin_roles
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_roles ar
            WHERE ar.user_id = auth.uid()
            AND ar.role = 'super_admin'
        )
    );

-- 5. Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(p_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.admin_roles
        WHERE user_id = p_user_id
    );
END;
$$;

-- 6. Function to check if user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin(p_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.admin_roles
        WHERE user_id = p_user_id
        AND role = 'super_admin'
    );
END;
$$;

-- 7. Add comment
COMMENT ON TABLE public.admin_roles IS 'Admin user roles and permissions';
COMMENT ON FUNCTION public.is_admin IS 'Check if a user has admin role';
COMMENT ON FUNCTION public.is_super_admin IS 'Check if a user has super admin role';

