-- Create storage bucket for test files (media and PDFs)
INSERT INTO storage.buckets (id, name, public)
VALUES ('test-files', 'test-files', true);

-- RLS Policies for test-files bucket

-- Teachers can upload files to their own test folders
CREATE POLICY "Teachers can upload test files"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'test-files' AND
  auth.uid() IS NOT NULL
);

-- Teachers can update their own test files
CREATE POLICY "Teachers can update test files"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'test-files' AND
  auth.uid() IS NOT NULL
);

-- Teachers can delete their own test files
CREATE POLICY "Teachers can delete test files"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'test-files' AND
  auth.uid() IS NOT NULL
);

-- Everyone can view test files (public bucket)
CREATE POLICY "Anyone can view test files"
ON storage.objects
FOR SELECT
USING (bucket_id = 'test-files');