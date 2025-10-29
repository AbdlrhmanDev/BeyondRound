-- Migration: إضافة حقل is_matchable وجدول match_feedback
-- التاريخ: 2024-10-29

-- ==========================================
-- 1. إضافة حقل is_matchable إلى جدول profiles
-- ==========================================

-- إضافة الحقل إذا لم يكن موجوداً
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_matchable BOOLEAN DEFAULT false;

-- إنشاء فهرس للبحث السريع عن المستخدمين الجاهزين للمطابقة
CREATE INDEX IF NOT EXISTS idx_profiles_matchable 
ON profiles(is_matchable) 
WHERE is_matchable = true;

-- ==========================================
-- 2. إنشاء جدول match_feedback
-- ==========================================

-- إنشاء الجدول إذا لم يكن موجوداً
CREATE TABLE IF NOT EXISTS match_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  would_meet_again BOOLEAN NOT NULL,
  comments TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء فهارس للبحث السريع
CREATE INDEX IF NOT EXISTS idx_match_feedback_user 
ON match_feedback(user_id);

CREATE INDEX IF NOT EXISTS idx_match_feedback_group 
ON match_feedback(group_id);

CREATE INDEX IF NOT EXISTS idx_match_feedback_created 
ON match_feedback(created_at DESC);

-- منع تكرار التغذية الراجعة لنفس المستخدم والمجموعة
CREATE UNIQUE INDEX IF NOT EXISTS idx_match_feedback_unique 
ON match_feedback(user_id, group_id);

-- ==========================================
-- 3. إضافة RLS (Row Level Security) policies
-- ==========================================

-- تفعيل RLS على جدول match_feedback
ALTER TABLE match_feedback ENABLE ROW LEVEL SECURITY;

-- السماح للمستخدمين بإدراج تغذية راجعة خاصة بهم فقط
CREATE POLICY "Users can insert their own feedback"
ON match_feedback
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- السماح للمستخدمين بقراءة تغذيتهم الراجعة فقط
CREATE POLICY "Users can view their own feedback"
ON match_feedback
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- السماح للمستخدمين بتحديث تغذيتهم الراجعة فقط
CREATE POLICY "Users can update their own feedback"
ON match_feedback
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- السماح للمستخدمين بحذف تغذيتهم الراجعة
CREATE POLICY "Users can delete their own feedback"
ON match_feedback
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- ==========================================
-- 4. إنشاء trigger لتحديث updated_at تلقائياً
-- ==========================================

-- إنشاء دالة trigger إذا لم تكن موجودة
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- إنشاء trigger على جدول match_feedback
DROP TRIGGER IF EXISTS update_match_feedback_updated_at ON match_feedback;
CREATE TRIGGER update_match_feedback_updated_at
BEFORE UPDATE ON match_feedback
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- 5. إضافة تعليقات على الجداول والأعمدة
-- ==========================================

COMMENT ON COLUMN profiles.is_matchable IS 
'يحدد ما إذا كان المستخدم جاهزاً للمطابقة بعد إكمال عملية التسجيل';

COMMENT ON TABLE match_feedback IS 
'يحتوي على التغذية الراجعة من المستخدمين حول تجربتهم مع المجموعات';

COMMENT ON COLUMN match_feedback.rating IS 
'تقييم المجموعة من 1 إلى 5 نجوم';

COMMENT ON COLUMN match_feedback.would_meet_again IS 
'هل يرغب المستخدم في الاجتماع مع نفس المجموعة مرة أخرى';

COMMENT ON COLUMN match_feedback.comments IS 
'تعليقات إضافية اختيارية من المستخدم';

-- ==========================================
-- تم بنجاح! ✅
-- ==========================================

