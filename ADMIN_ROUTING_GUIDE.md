# دليل توجيه المستخدمين (Admin Routing Guide)

## نظرة عامة

هذا الدليل يشرح كيفية عمل نظام التوجيه للمستخدمين العاديين و Super Admins في التطبيق.

## الملفات المهمة

### 1. Middleware (`utils/supabase/middleware.ts`)
- يتحقق من دور المستخدم (Admin/Regular User)
- يوجه المستخدمين تلقائياً بناءً على دورهم
- يحمي صفحات Admin من المستخدمين العاديين

### 2. Login Form (`components/auth/login-form.tsx`)
- بعد تسجيل الدخول، يتحقق من دور المستخدم
- يوجه Super Admins إلى `/admin`
- يوجه المستخدمين العاديين إلى `/dashboard` أو `/onboarding`

### 3. Admin Helpers (`lib/admin.ts`)
- `checkIsAdmin()`: للتحقق من أن المستخدم admin
- `checkIsSuperAdmin()`: للتحقق من أن المستخدم super admin
- `getAdminRole()`: للحصول على دور المستخدم

## كيفية عمل التوجيه

### بعد تسجيل الدخول:
1. المستخدم يسجل الدخول بنجاح
2. النظام يتحقق من `admin_roles` table
3. إذا كان Super Admin → `/admin`
4. إذا كان مستخدم عادي → `/dashboard` أو `/onboarding`

### أثناء التنقل:
1. Middleware يتحقق من كل طلب
2. إذا كان Admin يحاول الوصول لـ `/dashboard` → يوجهه إلى `/admin`
3. إذا كان مستخدم عادي يحاول الوصول لـ `/admin` → يوجهه إلى `/dashboard`

## استخدام Admin Helpers

### في Server Components:
```typescript
import { checkIsAdmin, checkIsSuperAdmin } from '@/lib/admin';
import { redirect } from 'next/navigation';

export default async function AdminPage() {
  const isAdmin = await checkIsAdmin();
  
  if (!isAdmin) {
    redirect('/dashboard');
  }

  return <div>Admin Content</div>;
}
```

### في Client Components:
```typescript
'use client';
import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function checkAdmin() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: adminRole } = await supabase
        .from('admin_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      setIsAdmin(!!adminRole);
    }

    checkAdmin();
  }, [supabase]);

  if (!isAdmin) {
    return <div>Access Denied</div>;
  }

  return <div>Admin Content</div>;
}
```

## قاعدة البيانات

### جدول `admin_roles`:
```sql
- id (uuid)
- user_id (uuid) → profiles(id)
- role ('admin' | 'super_admin')
- created_at (timestamp)
- updated_at (timestamp)
```

### View `user_login_info`:
يحتوي على معلومات المستخدم ومسار التوجيه:
- `is_admin`: boolean
- `admin_role`: 'super_admin' | 'admin' | null
- `redirect_path`: '/admin' | '/dashboard' | '/onboarding'

## استكشاف الأخطاء

### المشكلة: Super Admin لا يتم توجيهه إلى `/admin`
**الحل:**
1. تحقق من وجود سجل في `admin_roles` table
2. تحقق من أن `user_id` صحيح
3. تحقق من console logs في login form
4. تحقق من أن middleware يعمل (تحقق من network tab)

### المشكلة: المستخدم العادي يمكنه الوصول لصفحات Admin
**الحل:**
1. تحقق من أن middleware يعمل
2. تحقق من منطق التحقق في `AdminLayout`
3. تأكد من أن RLS policies صحيحة

## ملاحظات مهمة

- Middleware يستخدم cache لمدة دقيقة لتقليل استعلامات قاعدة البيانات
- Login form لديه fallback متعدد المستويات للتأكد من التوجيه الصحيح
- جميع صفحات Admin محمية بواسطة `AdminLayout` component

