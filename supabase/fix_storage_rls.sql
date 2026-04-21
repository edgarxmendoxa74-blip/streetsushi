-- SQL for fixing Supabase Storage RLS error

-- 1. Create the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('streetsushi', 'streetsushi', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Allow public access to the bucket's objects
-- This allows anyone to view the images (Bucket is public, but RLS still applies to management)

-- 3. DROP old policies if they exist (to avoid duplicates)
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Allow All Anon" ON storage.objects;
DROP POLICY IF EXISTS "Allow Upload for Anon" ON storage.objects;
DROP POLICY IF EXISTS "Allow Update for Anon" ON storage.objects;
DROP POLICY IF EXISTS "Allow Delete for Anon" ON storage.objects;

-- 4. Create new policies for the 'streetsushi' bucket
-- Note: 'anon' role is used because the dashboard doesn't use Supabase Auth

-- Allow anyone to view objects in the 'streetsushi' bucket
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'streetsushi' );

-- Allow anyone to upload objects to the 'streetsushi' bucket
CREATE POLICY "Allow Upload for Anon"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'streetsushi' );

-- Allow anyone to update objects in the 'streetsushi' bucket
CREATE POLICY "Allow Update for Anon"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'streetsushi' )
WITH CHECK ( bucket_id = 'streetsushi' );

-- Allow anyone to delete objects from the 'streetsushi' bucket
CREATE POLICY "Allow Delete for Anon"
ON storage.objects FOR DELETE
USING ( bucket_id = 'streetsushi' );
