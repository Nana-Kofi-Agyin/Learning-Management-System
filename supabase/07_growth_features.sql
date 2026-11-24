-- ============================================================================
-- 07_growth_features.sql - REVIEWS, PREREQUISITES, DRIP RELEASE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.course_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL DEFAULT 'Learner',
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (course_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_course_reviews_course ON public.course_reviews(course_id);
ALTER TABLE public.course_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviews: anyone can view reviews of published courses"
  ON public.course_reviews FOR SELECT
  USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = course_reviews.course_id AND c.is_published = true
    )
  );

CREATE POLICY "Reviews: enrolled learners can insert own review"
  ON public.course_reviews FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.enrollments e
      WHERE e.course_id = course_reviews.course_id AND e.user_id = auth.uid()
    )
  );

CREATE POLICY "Reviews: learners can update own review"
  ON public.course_reviews FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Reviews: learners can delete own review"
  ON public.course_reviews FOR DELETE
  USING (auth.uid() = user_id OR public.is_admin());

CREATE TABLE IF NOT EXISTS public.course_prerequisites (
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  prerequisite_course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  PRIMARY KEY (course_id, prerequisite_course_id),
  CHECK (course_id <> prerequisite_course_id)
);

ALTER TABLE public.course_prerequisites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Prerequisites: anyone can view"
  ON public.course_prerequisites FOR SELECT
  USING (true);

CREATE POLICY "Prerequisites: admins manage"
  ON public.course_prerequisites FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

ALTER TABLE public.modules
  ADD COLUMN IF NOT EXISTS unlock_after_days INT NOT NULL DEFAULT 0
  CHECK (unlock_after_days >= 0);
