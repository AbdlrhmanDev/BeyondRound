# 📋 Views vs Tables - Update Best Practices

## ⚠️ Important Rule: Never Update Views Directly

**Views are read-only** - they are virtual tables that combine data from underlying tables. Always update the **underlying tables** directly.

## ❌ BAD - Don't Do This

```typescript
// ❌ BAD - This would cause recursion and won't work
const { data } = await supabase
  .from('user_login_info')  // This is a VIEW, not a table!
  .update({ is_onboarding_complete: true })
  .eq('id', userId);
```

**Why this is bad:**
- Views cannot be updated directly in PostgreSQL/Supabase
- Even if it worked, it would query `admin_roles` (via the view's JOIN), which could cause RLS recursion
- The view is read-only by design

## ✅ GOOD - Do This Instead

```typescript
// ✅ GOOD - Direct update to the underlying table
const { data } = await supabase
  .from('profiles')  // Update the actual table
  .update({ is_onboarding_complete: true })
  .eq('id', userId);
```

**Why this is good:**
- Updates the actual data in the `profiles` table
- No recursion issues
- The view will automatically reflect the changes on next SELECT

## 📊 Our Views and Their Underlying Tables

### 1. `user_login_info` View
**Underlying Tables:**
- `profiles` (main table)
- `admin_roles` (joined for admin info)

**What to Update:**
- ✅ Update `profiles` table for profile data
- ✅ Update `admin_roles` table for admin status
- ❌ Never update `user_login_info` directly

**Example:**
```typescript
// ✅ Update profile
await supabase
  .from('profiles')
  .update({ is_onboarding_complete: true })
  .eq('id', userId);

// ✅ Add admin role
await supabase
  .from('admin_roles')
  .insert({ user_id: userId, role: 'admin' });

// ❌ Don't do this
await supabase
  .from('user_login_info')
  .update({ is_onboarding_complete: true });  // Won't work!
```

### 2. `notifications_view` View
**Underlying Tables:**
- `notifications` (main table)
- `profiles` (joined for user info)

**What to Update:**
- ✅ Update `notifications` table directly
- ❌ Never update `notifications_view` directly

**Example:**
```typescript
// ✅ Mark notification as read
await supabase
  .from('notifications')
  .update({ is_read: true })
  .eq('id', notificationId);

// ❌ Don't do this
await supabase
  .from('notifications_view')
  .update({ is_read: true });  // Won't work!
```

## 🔍 How to Identify Views vs Tables

### In Supabase Dashboard:
1. Go to **Table Editor**
2. Views will show **"View"** badge
3. Tables will show **"Table"** badge

### In SQL:
```sql
-- Check if something is a view
SELECT table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'user_login_info';

-- Returns: 'VIEW' or 'BASE TABLE'
```

### In Code:
- Views are typically named with `_view` suffix (e.g., `user_login_info`, `notifications_view`)
- But not always! Check the migration files

## ✅ Current Code Status

### ✅ Correctly Using Tables:
- `app/api/v1/onboarding/route.ts` - Updates `profiles` table ✅
- `app/api/v1/profile/route.ts` - Updates `profiles` table ✅
- `supabase/migrations/20250101_auto_complete_admin_onboarding.sql` - Updates `profiles` table ✅

### ✅ Correctly Using Views (Read-Only):
- `lib/utils/auth-helpers.ts` - Only SELECTs from `user_login_info` ✅
- `components/auth/login-form.tsx` - Only reads from `user_login_info` ✅

## 🎯 Best Practices Summary

1. **Views are for READING only** - Use them for SELECT queries
2. **Tables are for WRITING** - Use them for INSERT, UPDATE, DELETE
3. **Always update underlying tables** - Views will reflect changes automatically
4. **Check migration files** - See which tables a view depends on
5. **Use TypeScript types** - Helps prevent accidentally updating views

## 🚨 Common Mistakes to Avoid

### Mistake 1: Trying to update a view
```typescript
// ❌ This will fail
await supabase.from('user_login_info').update({ ... });
```

### Mistake 2: Using view in RLS policy that updates
```sql
-- ❌ Don't use views in UPDATE policies
CREATE POLICY "bad_policy"
ON profiles FOR UPDATE
USING (EXISTS (SELECT 1 FROM user_login_info WHERE ...));
```

### Mistake 3: Assuming view updates propagate
```typescript
// ❌ Views don't update - you must update the table
await supabase.from('user_login_info').update({ ... });
// Then expect it to update profiles - it won't!
```

## 📝 Quick Reference

| Operation | Use View? | Use Table? |
|-----------|-----------|------------|
| SELECT (read) | ✅ Yes | ✅ Yes |
| INSERT | ❌ No | ✅ Yes |
| UPDATE | ❌ No | ✅ Yes |
| DELETE | ❌ No | ✅ Yes |
| RLS Policies | ⚠️ Careful | ✅ Yes |

## 🔗 Related Files

- `supabase/migrations/20250101_user_login_info_view.sql` - View definition
- `supabase/migrations/20250101_notifications_view.sql` - View definition
- `lib/utils/auth-helpers.ts` - Correct usage examples

