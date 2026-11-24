-- ============================================================================
-- 05_email_notifications.sql
-- ============================================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS email_opt_out BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS unsubscribe_token UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS welcome_email_sent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_reminder_sent_at TIMESTAMPTZ;

UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id AND p.email IS NULL;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    NEW.raw_user_meta_data->>'avatar_url',
    'learner'
  )
  ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;
  RETURN NEW;
END;
$$;

ALTER TABLE public.certificates
  ADD COLUMN IF NOT EXISTS completion_email_sent_at TIMESTAMPTZ;

CREATE OR REPLACE FUNCTION public.unsubscribe_by_token(p_token UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_updated INT;
BEGIN
  UPDATE public.profiles
  SET email_opt_out = true
  WHERE unsubscribe_token = p_token;

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN v_updated > 0;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_inactive_learners(p_limit INT DEFAULT 25)
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  full_name TEXT,
  unsubscribe_token UUID,
  course_title TEXT,
  course_slug TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT DISTINCT ON (p.id)
    p.id AS user_id,
    p.email,
    p.full_name,
    p.unsubscribe_token,
    c.title AS course_title,
    c.slug AS course_slug
  FROM public.profiles p
  JOIN public.enrollments e ON e.user_id = p.id AND e.completed_at IS NULL
  JOIN public.courses c ON c.id = e.course_id AND c.is_published = true
  LEFT JOIN LATERAL (
    SELECT MAX(lp.updated_at) AS last_activity
    FROM public.lesson_progress lp
    WHERE lp.user_id = p.id
  ) activity ON true
  WHERE p.email IS NOT NULL
    AND p.email_opt_out = false
    AND COALESCE(activity.last_activity, e.enrolled_at) < now() - interval '3 days'
    AND (p.last_reminder_sent_at IS NULL OR p.last_reminder_sent_at < now() - interval '7 days')
  ORDER BY p.id, e.enrolled_at DESC
  LIMIT p_limit;
$$;
