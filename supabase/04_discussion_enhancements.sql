-- ============================================================================
-- 04_discussion_enhancements.sql
-- ============================================================================

ALTER TABLE public.discussion_posts
  ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS author_name TEXT NOT NULL DEFAULT 'Learner';

CREATE TABLE IF NOT EXISTS public.discussion_upvotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.discussion_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (post_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_discussion_upvotes_post ON public.discussion_upvotes(post_id);
CREATE INDEX IF NOT EXISTS idx_discussion_upvotes_user ON public.discussion_upvotes(user_id);

ALTER TABLE public.discussion_upvotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Discussion upvotes: enrolled learners can view"
  ON public.discussion_upvotes FOR SELECT
  USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1
      FROM public.discussion_posts dp
      JOIN public.enrollments e ON e.course_id = dp.course_id
      WHERE dp.id = discussion_upvotes.post_id
        AND e.user_id = auth.uid()
    )
  );

CREATE POLICY "Discussion upvotes: learners can upvote"
  ON public.discussion_upvotes FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND (
      public.is_admin()
      OR EXISTS (
        SELECT 1
        FROM public.discussion_posts dp
        JOIN public.enrollments e ON e.course_id = dp.course_id
        WHERE dp.id = discussion_upvotes.post_id
          AND e.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Discussion upvotes: learners can remove own upvote"
  ON public.discussion_upvotes FOR DELETE
  USING (auth.uid() = user_id OR public.is_admin());
