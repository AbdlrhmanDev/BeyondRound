# 🔐 User Login Info System Guide

## Overview

The `user_login_info` view provides a single source of truth for determining where users should be redirected after login. It combines profile data with admin role information to automatically determine the correct redirect path.

## Database Setup

### 1. Run Migrations

```bash
# Run all admin-related migrations
supabase db push

# Or manually run:
# 1. supabase/migrations/20250101_create_admin_roles.sql
# 2. supabase/migrations/20250101_fix_admin_roles_rls.sql
# 3. supabase/migrations/20250101_auto_complete_admin_onboarding.sql
# 4. supabase/migrations/20250101_user_login_info_view.sql
```

### 2. Verify View Exists

```sql
-- Check if view exists
SELECT * FROM user_login_info LIMIT 1;

-- Check admin users
SELECT * FROM user_login_info WHERE is_admin = true;
```

## How It Works

### Redirect Logic

The `redirect_path` is automatically determined based on:

1. **Admin Users** → `/admin`
   - If user has an entry in `admin_roles` table
   - Automatically skips onboarding (via trigger)

2. **Completed Onboarding** → `/dashboard`
   - If `is_onboarding_complete = true`
   - Regular users who finished onboarding

3. **New Users** → `/onboarding`
   - If `is_onboarding_complete = false`
   - Users who need to complete their profile

### View Structure

```sql
user_login_info (
  id UUID,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  is_onboarding_complete BOOLEAN,
  is_matchable BOOLEAN,
  is_admin BOOLEAN,              -- TRUE if user has admin role
  admin_role TEXT,               -- 'super_admin' | 'admin' | NULL
  redirect_path TEXT,            -- '/admin' | '/dashboard' | '/onboarding'
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
```

## Usage Examples

### Example 1: After Login (Current Implementation)

```typescript
// components/auth/login-form.tsx
import { login, getUserLoginInfo } from '@/lib/utils/auth-helpers';

async function onSubmit(email: string, password: string) {
  // 1. Login
  const authData = await login(email, password);
  
  // 2. Get user info
  const { data: userInfo } = await getUserLoginInfo(authData.user.id);
  
  // 3. Redirect
  router.push(userInfo.redirect_path);
  // Admins → /admin
  // Completed → /dashboard
  // New users → /onboarding
}
```

### Example 2: Using RPC Function

```typescript
import { createClient } from '@/utils/supabase/client';

const supabase = createClient();

// Get redirect path directly
const { data: redirectPath } = await supabase.rpc('get_user_redirect_path', {
  p_user_id: userId
});

router.push(redirectPath || '/onboarding');
```

### Example 3: Check Admin Status

```typescript
import { getUserLoginInfo } from '@/lib/utils/auth-helpers';

const { data: userInfo } = await getUserLoginInfo(userId);

if (userInfo?.is_admin) {
  // User is admin
  if (userInfo.admin_role === 'super_admin') {
    // Super admin - show all features
  } else {
    // Regular admin - show limited features
  }
}
```

## Available Functions

### 1. `get_user_login_info(p_user_id UUID)`
Returns complete user login information including redirect path.

```sql
SELECT * FROM get_user_login_info('user-id-here');
```

### 2. `get_user_redirect_path(p_user_id UUID)`
Returns only the redirect path for a user.

```sql
SELECT get_user_redirect_path('user-id-here');
-- Returns: '/admin', '/dashboard', or '/onboarding'
```

### 3. `is_user_admin(p_user_id UUID)`
Quick check if user is admin.

```sql
SELECT is_user_admin('user-id-here');
-- Returns: TRUE or FALSE
```

## Auto-Complete Onboarding Trigger

When an admin role is assigned, the trigger automatically:
- Sets `is_onboarding_complete = true` in profiles table
- Updates `redirect_path` to `/admin` in the view

This means admins never need to go through onboarding!

## Testing

### Test Admin Login

```sql
-- 1. Create admin user (or use existing)
-- Run: node create-admin-user.js

-- 2. Check user_login_info
SELECT 
  email,
  is_admin,
  admin_role,
  redirect_path,
  is_onboarding_complete
FROM user_login_info
WHERE email = 'admin@test.com';

-- Expected:
-- is_admin: true
-- admin_role: 'super_admin'
-- redirect_path: '/admin'
-- is_onboarding_complete: true
```

### Test Regular User Login

```sql
-- Check regular user
SELECT 
  email,
  is_admin,
  redirect_path,
  is_onboarding_complete
FROM user_login_info
WHERE is_admin = false
LIMIT 1;

-- Expected redirect_path:
-- '/dashboard' if onboarding complete
-- '/onboarding' if not complete
```

## Integration Points

### ✅ Already Integrated

1. **Login Form** (`components/auth/login-form.tsx`)
   - Uses `getUserLoginInfo()` after login
   - Redirects based on `redirect_path`

2. **Auth Helpers** (`lib/utils/auth-helpers.ts`)
   - `getUserLoginInfo()` function
   - `getUserRedirectPath()` function
   - TypeScript interface for `UserLoginInfo`

3. **Middleware** (`utils/supabase/middleware.ts`)
   - Already handles admin redirects
   - Can be enhanced to use the view

### 🔄 Can Be Enhanced

- **Signup Flow**: Auto-redirect new users to onboarding
- **Protected Routes**: Use view to check access
- **Admin Layout**: Use view instead of separate queries

## Troubleshooting

### Issue: View returns NULL
**Solution:** Ensure user has a profile entry:
```sql
-- Check if profile exists
SELECT * FROM profiles WHERE id = 'user-id';
```

### Issue: Admin not showing as admin
**Solution:** Check admin_roles table:
```sql
SELECT * FROM admin_roles WHERE user_id = 'user-id';
```

### Issue: Redirect path is wrong
**Solution:** The view calculates it automatically. Check:
1. Does user have admin role? → `/admin`
2. Is onboarding complete? → `/dashboard`
3. Otherwise → `/onboarding`

## Benefits

✅ **Single Source of Truth** - One view for all login decisions  
✅ **Automatic Redirects** - No manual logic needed  
✅ **Admin Auto-Skip** - Admins skip onboarding automatically  
✅ **Type Safe** - TypeScript interfaces included  
✅ **Performance** - Single query instead of multiple  
✅ **Maintainable** - Easy to update redirect logic  

## Next Steps

1. ✅ Run migrations
2. ✅ Test admin login
3. ✅ Test regular user login
4. ✅ Verify redirects work correctly
5. Optional: Update middleware to use view

