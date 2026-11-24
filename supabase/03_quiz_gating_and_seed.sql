-- ============================================================================
-- 03_quiz_gating_and_seed.sql
-- ============================================================================

ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS require_quiz_to_unlock_next_module BOOLEAN NOT NULL DEFAULT false;

DO $$
DECLARE
  v_course_id UUID;
  v_mod1_id UUID;
  v_quiz_id UUID;
  v_q1_id UUID;
  v_q2_id UUID;
  v_q3_id UUID;
BEGIN
  SELECT id INTO v_course_id FROM public.courses WHERE slug = 'web-dev-fundamentals';
  IF v_course_id IS NULL THEN RETURN; END IF;

  UPDATE public.courses
  SET require_quiz_to_unlock_next_module = true
  WHERE id = v_course_id;

  SELECT id INTO v_mod1_id
  FROM public.modules
  WHERE course_id = v_course_id
  ORDER BY position ASC
  LIMIT 1;

  IF v_mod1_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.quizzes WHERE module_id = v_mod1_id
  ) THEN
    INSERT INTO public.quizzes (course_id, module_id, title, description, passing_score_percent)
    VALUES (
      v_course_id,
      v_mod1_id,
      'Module 1 Quiz: How the Web Works',
      'Pass with at least 70% to unlock Module 2.',
      70
    )
    RETURNING id INTO v_quiz_id;

    INSERT INTO public.questions (quiz_id, question_text, explanation, position)
    VALUES (
      v_quiz_id,
      'What does HTML stand for?',
      'HTML stands for HyperText Markup Language — it defines the structure and content of a web page.',
      1
    )
    RETURNING id INTO v_q1_id;

    INSERT INTO public.answers (question_id, answer_text, is_correct, position) VALUES
      (v_q1_id, 'HyperText Markup Language', true, 1),
      (v_q1_id, 'High Transfer Machine Language', false, 2),
      (v_q1_id, 'Hyperlink Text Management Logic', false, 3);

    INSERT INTO public.questions (quiz_id, question_text, explanation, position)
    VALUES (
      v_quiz_id,
      'Which HTML tag is used for the main heading of a page?',
      'The <h1> tag represents the top-level heading on a page and helps with accessibility and SEO.',
      2
    )
    RETURNING id INTO v_q2_id;

    INSERT INTO public.answers (question_id, answer_text, is_correct, position) VALUES
      (v_q2_id, '<p>', false, 1),
      (v_q2_id, '<h1>', true, 2),
      (v_q2_id, '<head>', false, 3);

    INSERT INTO public.questions (quiz_id, question_text, explanation, position)
    VALUES (
      v_quiz_id,
      'Which tag creates a clickable hyperlink to another page?',
      'The <a> (anchor) tag with an href attribute creates links between web pages.',
      3
    )
    RETURNING id INTO v_q3_id;

    INSERT INTO public.answers (question_id, answer_text, is_correct, position) VALUES
      (v_q3_id, '<link>', false, 1),
      (v_q3_id, '<url>', false, 2),
      (v_q3_id, '<a>', true, 3);
  END IF;
END $$;
