-- Create questions table with full passage + sub-question support
CREATE TABLE public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID REFERENCES public.tests(id) ON DELETE CASCADE NOT NULL,
  
  -- Question identification
  question_type TEXT NOT NULL CHECK (question_type IN ('mcq', 'short-answer', 'long-answer')),
  difficulty TEXT NOT NULL CHECK (difficulty IN ('practice', 'easy', 'medium', 'hard')),
  
  -- Passage & Sub-question support (Q1a, Q1b, Q1c)
  passage_id UUID, -- Links sub-questions to a shared passage
  passage_text TEXT, -- The reading passage (only for first question in group)
  passage_title TEXT,
  sub_question_label TEXT, -- e.g., "a", "b", "c" for Q1a, Q1b, Q1c
  
  -- Question content
  question_text TEXT NOT NULL,
  options JSONB, -- ["Option A", "Option B", "Option C", "Option D"]
  correct_answer TEXT,
  marks INTEGER DEFAULT 1,
  order_index INTEGER DEFAULT 0,
  
  -- Media support
  media_url TEXT,
  media_type TEXT CHECK (media_type IN ('image', 'audio', 'video', NULL)),
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Update tests table for PDF URLs
ALTER TABLE public.tests 
ADD COLUMN practice_pdf_url TEXT,
ADD COLUMN easy_pdf_url TEXT,
ADD COLUMN medium_pdf_url TEXT,
ADD COLUMN hard_pdf_url TEXT,
ADD COLUMN practice_question_count INTEGER DEFAULT 0,
ADD COLUMN easy_question_count INTEGER DEFAULT 0,
ADD COLUMN medium_question_count INTEGER DEFAULT 0,
ADD COLUMN hard_question_count INTEGER DEFAULT 0;

-- Create storage bucket for media/PDFs
INSERT INTO storage.buckets (id, name, public) VALUES ('test-files', 'test-files', true);

-- RLS for questions table
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

-- Teachers can manage questions for their own tests
CREATE POLICY "Teachers can manage questions"
  ON public.questions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.tests 
      WHERE tests.id = questions.test_id 
      AND tests.created_by = auth.uid()
    )
  );

-- Students can view questions for active tests
CREATE POLICY "Students can view test questions"
  ON public.questions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.tests 
      WHERE tests.id = questions.test_id 
      AND tests.is_active = true
    )
  );

-- Storage policies for test-files bucket
CREATE POLICY "Teachers can upload test files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'test-files' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Public can view test files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'test-files');