-- Drop existing restrictive policies for test-files bucket
DROP POLICY IF EXISTS "Teachers can upload test files" ON storage.objects;
DROP POLICY IF EXISTS "Teachers can update test files" ON storage.objects;
DROP POLICY IF EXISTS "Teachers can delete test files" ON storage.objects;

-- Create permissive policies for public bucket (works with localStorage auth)
CREATE POLICY "Allow upload to test-files"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'test-files');

CREATE POLICY "Allow update test-files"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'test-files');

CREATE POLICY "Allow delete test-files"
ON storage.objects
FOR DELETE
USING (bucket_id = 'test-files');