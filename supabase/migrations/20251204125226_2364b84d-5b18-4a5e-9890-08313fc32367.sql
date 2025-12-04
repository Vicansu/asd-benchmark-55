-- Fix security definer view warning by using SECURITY INVOKER (default)
-- Drop the old view and recreate with proper security

DROP VIEW IF EXISTS public.questions_student_view;

-- Create the view without SECURITY DEFINER
-- The is_teacher_or_admin function will handle the security check
CREATE VIEW public.questions_student_view 
WITH (security_invoker = true)
AS
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
  CASE WHEN public.is_teacher_or_admin() THEN correct_answer ELSE NULL END as correct_answer
FROM public.questions;

-- Grant access
GRANT SELECT ON public.questions_student_view TO authenticated;
GRANT SELECT ON public.questions_student_view TO anon;