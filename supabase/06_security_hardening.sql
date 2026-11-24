-- ============================================================================
-- 06_security_hardening.sql
-- ============================================================================

REVOKE ALL ON FUNCTION public.get_inactive_learners(INT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_inactive_learners(INT) FROM anon;
REVOKE ALL ON FUNCTION public.get_inactive_learners(INT) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.get_inactive_learners(INT) TO service_role;

DROP POLICY IF EXISTS "Certificates: learners can create own on completion" ON public.certificates;

CREATE OR REPLACE FUNCTION public.issue_certificate_if_eligible(p_course_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_total_lessons INT;
  v_completed_lessons INT;
  v_total_quizzes INT;
  v_passed_quizzes INT;
  v_code TEXT;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.enrollments
    WHERE user_id = v_user_id AND course_id = p_course_id
  ) THEN
    RETURN NULL;
  END IF;

  SELECT COUNT(*) INTO v_total_lessons
  FROM public.lessons l
  JOIN public.modules m ON m.id = l.module_id
  WHERE m.course_id = p_course_id;

  SELECT COUNT(*) INTO v_completed_lessons
  FROM public.lesson_progress lp
  JOIN public.lessons l ON l.id = lp.lesson_id
  JOIN public.modules m ON m.id = l.module_id
  WHERE m.course_id = p_course_id
    AND lp.user_id = v_user_id
    AND lp.is_completed = true;

  SELECT COUNT(*) INTO v_total_quizzes
  FROM public.quizzes
  WHERE course_id = p_course_id;

  SELECT COUNT(DISTINCT qa.quiz_id) INTO v_passed_quizzes
  FROM public.quiz_attempts qa
  JOIN public.quizzes q ON q.id = qa.quiz_id
  WHERE q.course_id = p_course_id
    AND qa.user_id = v_user_id
    AND qa.passed = true;

  IF (v_total_lessons + v_total_quizzes) = 0
     OR v_completed_lessons < v_total_lessons
     OR v_passed_quizzes < v_total_quizzes THEN
    RETURN NULL;
  END IF;

  UPDATE public.enrollments
  SET completed_at = COALESCE(completed_at, now())
  WHERE user_id = v_user_id AND course_id = p_course_id;

  INSERT INTO public.certificates (user_id, course_id)
  VALUES (v_user_id, p_course_id)
  ON CONFLICT (user_id, course_id) DO NOTHING;

  SELECT verification_code INTO v_code
  FROM public.certificates
  WHERE user_id = v_user_id AND course_id = p_course_id;

  RETURN v_code;
END;
$$;

GRANT EXECUTE ON FUNCTION public.issue_certificate_if_eligible(UUID) TO authenticated;

DROP POLICY IF EXISTS "Discussion posts: learners edit own posts" ON public.discussion_posts;

CREATE POLICY "Discussion posts: learners edit own posts"
  ON public.discussion_posts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id AND is_pinned = false);
