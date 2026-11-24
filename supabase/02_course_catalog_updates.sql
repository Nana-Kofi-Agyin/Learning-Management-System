-- ============================================================================
-- 02_course_catalog_updates.sql
-- ============================================================================

ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'General',
  ADD COLUMN IF NOT EXISTS instructor_name TEXT NOT NULL DEFAULT 'MOOC Team';

CREATE INDEX IF NOT EXISTS idx_courses_category ON public.courses(category);

INSERT INTO public.courses (title, slug, description, category, level, instructor_name, is_published)
VALUES
  (
    'Web Development Fundamentals',
    'web-dev-fundamentals',
    'Learn HTML, CSS, and modern JavaScript from scratch by building real mobile-friendly web pages.',
    'Programming',
    'beginner',
    'Alex Rivera',
    true
  ),
  (
    'Practical Data Literacy',
    'practical-data-literacy',
    'Understand spreadsheets, charts, and basic statistics to make better everyday and business decisions.',
    'Data',
    'beginner',
    'Dr. Samira Patel',
    true
  )
ON CONFLICT (slug) DO NOTHING;

DO $$
DECLARE
  v_course_id UUID;
  v_mod1_id UUID;
  v_mod2_id UUID;
BEGIN
  SELECT id INTO v_course_id FROM public.courses WHERE slug = 'web-dev-fundamentals';

  IF v_course_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.modules WHERE course_id = v_course_id
  ) THEN
    INSERT INTO public.modules (course_id, title, description, position)
    VALUES (v_course_id, 'Module 1: How the Web Works', 'Core concepts of browsers, HTML, and page structure.', 1)
    RETURNING id INTO v_mod1_id;

    INSERT INTO public.modules (course_id, title, description, position)
    VALUES (v_course_id, 'Module 2: Styling with CSS', 'Layouts, colors, and mobile-first responsive design.', 2)
    RETURNING id INTO v_mod2_id;

    INSERT INTO public.lessons (module_id, title, youtube_url, text_content, duration_seconds, position)
    VALUES
      (v_mod1_id, 'Welcome & Course Overview', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'Welcome! Here is what you will build in this course.', 300, 1),
      (v_mod1_id, 'Your First HTML Page', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'Learn headings, paragraphs, links, and semantic tags.', 720, 2),
      (v_mod2_id, 'CSS Basics & Box Model', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'Understanding margin, padding, border, and width.', 660, 1),
      (v_mod2_id, 'Mobile-First Layouts with Flexbox', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'Build responsive layouts that look great on phones.', 900, 2);
  END IF;
END $$;
