-- ============================================
-- Auto-Complete Admin Onboarding
-- ============================================
-- Automatically sets is_onboarding_complete = true for admins
-- This ensures admins don't need to go through the onboarding process

-- Function: Automatically complete onboarding for admins
-- Uses SECURITY DEFINER to bypass RLS and avoid recursion
CREATE OR REPLACE FUNCTION auto_complete_admin_onboarding()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- When an admin role is added, automatically complete onboarding
  -- SECURITY DEFINER allows this to bypass RLS policies
  UPDATE public.profiles
  SET is_onboarding_complete = true
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Executes when a new admin role is inserted
CREATE TRIGGER trigger_complete_admin_onboarding
AFTER INSERT ON public.admin_roles
FOR EACH ROW
EXECUTE FUNCTION auto_complete_admin_onboarding();

-- Also update existing admins to have completed onboarding
UPDATE public.profiles
SET is_onboarding_complete = true
WHERE id IN (
  SELECT user_id FROM public.admin_roles
)
AND is_onboarding_complete = false;

-- Add comment
COMMENT ON FUNCTION auto_complete_admin_onboarding IS 'Automatically completes onboarding for users when they receive admin role';
COMMENT ON TRIGGER trigger_complete_admin_onboarding ON public.admin_roles IS 'Triggers onboarding completion when admin role is assigned';

