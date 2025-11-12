-- Create storage buckets for avatars and verifications
-- Note: Buckets need to be created manually in Supabase Dashboard -> Storage
-- This migration only creates the policies

-- Storage policies for avatars bucket
-- Bucket should be created as PUBLIC for avatars

CREATE POLICY "Users can upload their own avatar"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own avatar"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Public avatar access"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Storage policies for verifications bucket
-- Bucket should be created as PRIVATE for verifications

CREATE POLICY "Users can upload their own verification documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'verifications' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own verification documents"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'verifications' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can read their own verification documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'verifications' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Admins can read all verification documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'verifications'
  AND EXISTS (
    SELECT 1 FROM admin_roles
    WHERE admin_roles.user_id = auth.uid()
  )
);

