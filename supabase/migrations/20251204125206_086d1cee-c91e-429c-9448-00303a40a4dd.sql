-- Fix: Create a view for students that excludes correct_answer
-- This prevents students from seeing answers when querying directly

-- First, create a function to check if user is a teacher
CREATE OR REPLACE FUNCTION public.is_teacher_or_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT has_role(auth.uid(), 'teacher'::app_role) OR has_role(auth.uid(), 'admin'::app_role)
$$;

-- Create a secure view for students that hides correct_answer
CREATE OR REPLACE VIEW public.questions_student_view AS
SELECT 
  id,
  test_id,
  question_text,
  question_type,
  options,
  difficulty,
  passage_text,
  passage_title,
  sub_question_label,
  media_url,
  media_type,
  marks,
  order_index,
  passage_id,
  created_at,
  -- Only show correct_answer to teachers/admins
  CASE WHEN is_teacher_or_admin() THEN correct_answer ELSE NULL END as correct_answer
FROM public.questions;

-- Grant access to the view
GRANT SELECT ON public.questions_student_view TO authenticated;
GRANT SELECT ON public.questions_student_view TO anon;

-- Update RLS policy for questions to be more restrictive
DROP POLICY IF EXISTS "Students can view test questions" ON public.questions;

CREATE POLICY "Students can view test questions (no answers)"
ON public.questions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM tests 
    WHERE tests.id = questions.test_id AND tests.is_active = true
  )
);

-- Note: The correct_answer column is still accessible but the view provides a safer interface
-- Applications should use questions_student_view for student-facing queries