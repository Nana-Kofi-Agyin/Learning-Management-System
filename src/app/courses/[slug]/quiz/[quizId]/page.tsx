import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import QuizRunner, { type QuizQuestionItem } from '@/components/QuizRunner'

type QuizPageProps = {
  params: Promise<{ slug: string; quizId: string }>
}

export default async function QuizPage({ params }: QuizPageProps) {
  const { slug, quizId } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/login?next=/courses/${slug}/quiz/${quizId}`)
  }

  const { data: course } = await supabase
    .from('courses')
    .select('id, title, slug')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (!course) {
    notFound()
  }

  const { data: enrollment } = await supabase
    .from('enrollments')
    .select('id')
    .eq('user_id', user.id)
    .eq('course_id', course.id)
    .maybeSingle()

  if (!enrollment) {
    redirect(`/courses/${slug}`)
  }

  const { data: quiz } = await supabase
    .from('quizzes')
    .select(
      `
      id,
      title,
      description,
      passing_score_percent,
      questions (
        id,
        question_text,
        explanation,
        position,
        answers (
          id,
          answer_text,
          is_correct,
          position
        )
      )
    `
    )
    .eq('id', quizId)
    .eq('course_id', course.id)
    .single()

  if (!quiz) {
    notFound()
  }

  const sortedQuestions: QuizQuestionItem[] = (
    (quiz.questions as QuizQuestionItem[] | null) ?? []
  )
    .slice()
    .sort((a, b) => a.position - b.position)
    .map((q) => ({
      ...q,
      answers: (q.answers ?? []).slice().sort((a, b) => a.position - b.position),
    }))

  const { data: attempts } = await supabase
    .from('quiz_attempts')
    .select('id, score_percent, passed, attempted_at')
    .eq('user_id', user.id)
    .eq('quiz_id', quiz.id)
    .order('attempted_at', { ascending: false })
    .limit(10)

  const hasPassedBefore = (attempts ?? []).some((a) => a.passed)

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <Link
        href={`/courses/${course.slug}/learn`}
        className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400"
      >
        ← Back to {course.title}
      </Link>

      <div className="mt-4">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {quiz.title}
          </h1>
          {hasPassedBefore && (
            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              ✓ Passed
            </span>
          )}
        </div>
        {quiz.description && (
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            {quiz.description}
          </p>
        )}
      </div>

      <div className="mt-6">
        <QuizRunner
          slug={course.slug}
          quizId={quiz.id}
          passingScorePercent={quiz.passing_score_percent}
          questions={sortedQuestions}
        />
      </div>

      <section className="mt-8">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          Attempt History
        </h2>
        {!attempts || attempts.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">
            No attempts yet. Complete the quiz above to record your first score.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
            {attempts.map((attempt, index) => (
              <li
                key={attempt.id}
                className="flex items-center justify-between gap-4 px-4 py-3 text-sm"
              >
                <div>
                  <span className="font-medium text-slate-900 dark:text-white">
                    Attempt #{attempts.length - index}
                  </span>
                  <span className="ml-2 text-xs text-slate-500">
                    {new Date(attempt.attempted_at).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {attempt.score_percent}%
                  </span>
                  <span
                    className={`rounded px-2 py-0.5 text-xs font-semibold ${
                      attempt.passed
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300'
                    }`}
                  >
                    {attempt.passed ? 'Passed' : 'Failed'}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}
