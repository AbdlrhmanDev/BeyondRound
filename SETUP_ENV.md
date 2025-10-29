# 🔧 إعداد ملف Environment Variables

## ❌ المشكلة
إذا ظهر لك خطأ `TypeError: Failed to fetch` من Supabase، فهذا يعني أن ملف `.env.local` غير موجود أو فارغ.

---

## ✅ الحل (خطوات بسيطة)

### 1️⃣ افتح Supabase Dashboard
- اذهب إلى: https://app.supabase.com
- سجّل الدخول (أو أنشئ حساب)
- افتح المشروع الخاص بك

### 2️⃣ احصل على القيم
- اذهب إلى: **Settings** → **API**
- ستجد:
  - **Project URL** → هذا هو `NEXT_PUBLIC_SUPABASE_URL`
  - **anon public** → هذا هو `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - **service_role** → هذا هو `SUPABASE_SERVICE_ROLE_KEY` (⚠️ سري - لا تشاركه!)

### 3️⃣ أنشئ ملف `.env.local`
- في المجلد الرئيسي للمشروع، أنشئ ملف جديد اسمه: `.env.local`
- انسخ المحتوى من `.env.local.example` والصقه في `.env.local`
- املأ القيم من Supabase Dashboard

### 4️⃣ مثال على `.env.local` بعد الملء:
```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYzNzI4MDAwMCwiZXhwIjoxOTUyODU2MDAwfQ.example
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjM3MjgwMDAwLCJleHAiOjE5NTI4NTYwMDB9.example
```

### 5️⃣ أعد تشغيل Next.js
```bash
# أغلق الـ dev server (Ctrl+C)
# ثم شغله من جديد:
npm run dev
```

---

## ⚠️ ملاحظات مهمة:

1. **لا ترفع `.env.local` إلى GitHub!** - الملف موجود في `.gitignore`
2. **`SUPABASE_SERVICE_ROLE_KEY` سري جداً** - لا تستخدمه في الكود الذي يعمل في المتصفح (client-side)
3. **تأكد من نسخ القيم بشكل صحيح** - بدون مسافات إضافية

---

## 🧪 تحقق من الحل:

بعد إنشاء `.env.local`:
1. افتح: http://localhost:3000
2. افتح **Developer Console** (F12)
3. لا يجب أن ترى `TypeError: Failed to fetch`
4. يجب أن تعمل تسجيل الدخول بشكل طبيعي ✅

---

## 🆘 إذا لم يعمل:

### تحقق من:
- ✅ ملف `.env.local` موجود في المجلد الرئيسي (نفس مكان `package.json`)
- ✅ القيم صحيحة (نسختها بشكل صحيح من Supabase Dashboard)
- ✅ أعدت تشغيل `npm run dev` بعد إنشاء الملف
- ✅ الـ Supabase Project نشط (غير paused)

### للمساعدة:
- راجع: https://supabase.com/docs/guides/getting-started/quickstarts/nextjs

