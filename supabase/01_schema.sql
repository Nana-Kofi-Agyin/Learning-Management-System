-- ============================================================================
-- 01_schema.sql - CORE MOOC LEARNING PLATFORM SCHEMA (RUN FIRST)
-- ============================================================================

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'learner' CHECK (role IN ('learner', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  thumbnail_url TEXT,
  level TEXT NOT NULL DEFAULT 'beginner' CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  position INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  youtube_url TEXT,
  text_content TEXT,
  duration_seconds INT NOT NULL DEFAULT 0 CHECK (duration_seconds >= 0),
  position INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  UNIQUE (user_id, course_id)
);

CREATE TABLE public.lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, lesson_id)
);

CREATE TABLE public.quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  module_id UUID REFERENCES public.modules(id) ON DELETE SET NULL,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  passing_score_percent INT NOT NULL DEFAULT 70 CHECK (passing_score_percent BETWEEN 0 AND 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  explanation TEXT,
  position INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  answer_text TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT false,
  position INT NOT NULL DEFAULT 1
);

CREATE TABLE public.quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  score_percent INT NOT NULL CHECK (score_percent BETWEEN 0 AND 100),
  passed BOOLEAN NOT NULL DEFAULT false,
  selected_answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  verification_code TEXT NOT NULL UNIQUE DEFAULT upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12)),
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, course_id)
);

CREATE TABLE public.discussion_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.discussion_posts(id) ON DELETE CASCADE,
  body TEXT NOT NULL CHECK (char_length(trim(body)) > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_courses_is_published ON public.courses(is_published);
CREATE INDEX idx_courses_created_by ON public.courses(created_by);
CREATE INDEX idx_modules_course_order ON public.modules(course_id, position);
CREATE INDEX idx_lessons_module_order ON public.lessons(module_id, position);
CREATE INDEX idx_enrollments_user_id ON public.enrollments(user_id);
CREATE INDEX idx_enrollments_course_id ON public.enrollments(course_id);
CREATE INDEX idx_lesson_progress_user_id ON public.lesson_progress(user_id);
CREATE INDEX idx_lesson_progress_lesson_id ON public.lesson_progress(lesson_id);
CREATE INDEX idx_quizzes_course_id ON public.quizzes(course_id);
CREATE INDEX idx_quizzes_module_id ON public.quizzes(module_id);
CREATE INDEX idx_quizzes_lesson_id ON public.quizzes(lesson_id);
CREATE INDEX idx_questions_quiz_order ON public.questions(quiz_id, position);
CREATE INDEX idx_answers_question_order ON public.answers(question_id, position);
CREATE INDEX idx_quiz_attempts_user_quiz ON public.quiz_attempts(user_id, quiz_id);
CREATE INDEX idx_certificates_user_id ON public.certificates(user_id);
CREATE INDEX idx_certificates_verification_code ON public.certificates(verification_code);
CREATE INDEX idx_discussion_posts_course ON public.discussion_posts(course_id, created_at DESC);
CREATE INDEX idx_discussion_posts_lesson ON public.discussion_posts(lesson_id, created_at DESC);
CREATE INDEX idx_discussion_posts_parent ON public.discussion_posts(parent_id);
CREATE INDEX idx_discussion_posts_user ON public.discussion_posts(user_id);

-- Triggers & Helper Functions
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER trg_courses_updated_at BEFORE UPDATE ON public.courses FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER trg_modules_updated_at BEFORE UPDATE ON public.modules FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER trg_lessons_updated_at BEFORE UPDATE ON public.lessons FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER trg_lesson_progress_updated_at BEFORE UPDATE ON public.lesson_progress FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER trg_quizzes_updated_at BEFORE UPDATE ON public.quizzes FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER trg_discussion_posts_updated_at BEFORE UPDATE ON public.discussion_posts FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    NEW.raw_user_meta_data->>'avatar_url',
    'learner'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin');
$$;

CREATE OR REPLACE FUNCTION public.verify_certificate(p_code TEXT)
RETURNS TABLE (
  verification_code TEXT,
  learner_name TEXT,
  course_title TEXT,
  issued_at TIMESTAMPTZ
) LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT c.verification_code, p.full_name, co.title, c.issued_at
  FROM public.certificates c
  JOIN public.profiles p ON p.id = c.user_id
  JOIN public.courses co ON co.id = c.course_id
  WHERE c.verification_code = upper(trim(p_code))
  LIMIT 1;
$$;

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discussion_posts ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Profiles: users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id OR public.is_admin());
CREATE POLICY "Profiles: learners can update own profile (not role)" ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id AND role = 'learner');
CREATE POLICY "Profiles: admins can manage all profiles" ON public.profiles FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Courses: anyone can view published courses" ON public.courses FOR SELECT USING (is_published = true OR public.is_admin());
CREATE POLICY "Courses: admins can manage all courses" ON public.courses FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Modules: view modules of published courses" ON public.modules FOR SELECT USING (public.is_admin() OR EXISTS (SELECT 1 FROM public.courses c WHERE c.id = modules.course_id AND c.is_published = true));
CREATE POLICY "Modules: admins can manage all modules" ON public.modules FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Lessons: view lessons of published courses" ON public.lessons FOR SELECT USING (public.is_admin() OR EXISTS (SELECT 1 FROM public.modules m JOIN public.courses c ON c.id = m.course_id WHERE m.id = lessons.module_id AND c.is_published = true));
CREATE POLICY "Lessons: admins can manage all lessons" ON public.lessons FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Enrollments: learners view own" ON public.enrollments FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Enrollments: learners enroll themselves in published courses" ON public.enrollments FOR INSERT WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.courses c WHERE c.id = enrollments.course_id AND c.is_published = true));
CREATE POLICY "Enrollments: learners update own" ON public.enrollments FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Enrollments: learners delete own" ON public.enrollments FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Enrollments: admins manage all" ON public.enrollments FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Lesson progress: learners view own" ON public.lesson_progress FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Lesson progress: learners insert own" ON public.lesson_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Lesson progress: learners update own" ON public.lesson_progress FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Lesson progress: learners delete own" ON public.lesson_progress FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Lesson progress: admins manage all" ON public.lesson_progress FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Quizzes: view quizzes of published courses" ON public.quizzes FOR SELECT USING (public.is_admin() OR EXISTS (SELECT 1 FROM public.courses c WHERE c.id = quizzes.course_id AND c.is_published = true));
CREATE POLICY "Quizzes: admins manage all" ON public.quizzes FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Questions: view questions of published courses" ON public.questions FOR SELECT USING (public.is_admin() OR EXISTS (SELECT 1 FROM public.quizzes q JOIN public.courses c ON c.id = q.course_id WHERE q.id = questions.quiz_id AND c.is_published = true));
CREATE POLICY "Questions: admins manage all" ON public.questions FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Answers: view answers of published courses" ON public.answers FOR SELECT USING (public.is_admin() OR EXISTS (SELECT 1 FROM public.questions qu JOIN public.quizzes q ON q.id = qu.quiz_id JOIN public.courses c ON c.id = q.course_id WHERE qu.id = answers.question_id AND c.is_published = true));
CREATE POLICY "Answers: admins manage all" ON public.answers FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Quiz attempts: learners view own" ON public.quiz_attempts FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Quiz attempts: learners insert own" ON public.quiz_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Quiz attempts: admins manage all" ON public.quiz_attempts FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Certificates: learners view own" ON public.certificates FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Certificates: admins manage all" ON public.certificates FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Discussion posts: enrolled learners can view course posts" ON public.discussion_posts FOR SELECT USING (public.is_admin() OR EXISTS (SELECT 1 FROM public.enrollments e WHERE e.course_id = discussion_posts.course_id AND e.user_id = auth.uid()));
CREATE POLICY "Discussion posts: enrolled learners can post" ON public.discussion_posts FOR INSERT WITH CHECK (auth.uid() = user_id AND (public.is_admin() OR EXISTS (SELECT 1 FROM public.enrollments e WHERE e.course_id = discussion_posts.course_id AND e.user_id = auth.uid())));
CREATE POLICY "Discussion posts: learners edit own posts" ON public.discussion_posts FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Discussion posts: learners delete own posts" ON public.discussion_posts FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Discussion posts: admins manage all" ON public.discussion_posts FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
