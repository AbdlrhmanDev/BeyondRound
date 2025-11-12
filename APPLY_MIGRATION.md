# 🔧 تطبيق Migration لإصلاح صلاحيات Admin Roles

## المشكلة
عند محاولة عمل CREATE, UPDATE, أو DELETE على `admin_roles`، تظهر رسالة:
```
Permission denied. Make sure you are a Super Admin and the migration has been applied.
```

## الحل: تطبيق Migration

### الطريقة 1: استخدام Supabase Dashboard (الأسهل) ✅

1. **افتح Supabase Dashboard**
   - اذهب إلى: https://app.supabase.com
   - سجّل الدخول وافتح مشروعك

2. **افتح SQL Editor**
   - من القائمة الجانبية: **SQL Editor** → **New query**

3. **انسخ محتوى الـ Migration**
   - افتح الملف: `supabase/migrations/20250101_fix_admin_roles_full_crud_rls.sql`
   - انسخ كل المحتوى (Ctrl+A ثم Ctrl+C)

4. **الصق في SQL Editor**
   - الصق المحتوى في SQL Editor
   - اضغط **Run** أو **Ctrl+Enter**

5. **تحقق من النجاح**
   - يجب أن ترى رسالة "Success" في الأسفل
   - إذا ظهرت أخطاء، تأكد من أنك Super Admin

---

### الطريقة 2: استخدام Supabase CLI

```bash
# تأكد من أن Supabase CLI مثبت
npm install -g supabase

# تطبيق جميع الـ migrations
supabase db reset

# أو تطبيق migration واحد فقط
supabase migration up
```

---

## التحقق من التطبيق

بعد تطبيق الـ migration، تحقق من:

1. **افتح SQL Editor مرة أخرى**
2. **شغّل هذا الاستعلام:**

```sql
-- التحقق من وجود الدالة
SELECT proname, prosrc 
FROM pg_proc 
WHERE proname = 'check_is_super_admin';

-- التحقق من وجود السياسات
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'admin_roles';
```

يجب أن ترى:
- ✅ دالة `check_is_super_admin`
- ✅ 4 سياسات: SELECT, INSERT, UPDATE, DELETE

---

## ملاحظات مهمة

1. **يجب أن تكون Super Admin** لتطبيق الـ migration
2. **إذا لم تكن Super Admin:**
   - استخدم `create-admin-user.js` لإنشاء Super Admin
   - أو اطلب من Super Admin موجود تطبيق الـ migration

3. **بعد التطبيق:**
   - أعد تحميل الصفحة (F5)
   - جرب عمليات CRUD مرة أخرى

---

## إذا استمرت المشكلة

1. **تحقق من أنك Super Admin:**
```sql
SELECT * FROM admin_roles WHERE user_id = auth.uid();
```

2. **تحقق من أن الدالة تعمل:**
```sql
SELECT check_is_super_admin(auth.uid());
```

3. **إذا كانت النتيجة `false`:**
   - أنت لست Super Admin
   - استخدم `create-admin-user.js` لإنشاء Super Admin

