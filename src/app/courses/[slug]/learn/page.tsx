import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { formatDuration } from '@/lib/format'
import { getModuleDripStatus } from '@/lib/learning-rules'
import YouTubePlayer from '@/components/YouTubePlayer'
import LessonDiscussion, {
  type DiscussionPostItem,
} from '@/components/LessonDiscussion'
import { toggleLessonComplete } from '../actions'

type LearnPageProps = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ lesson?: string }>
}

type LessonRow = {
  id: string
  title: string
  youtube_url: string | null
  text_content: string | null
  duration_seconds: number
  position: number
}

type ModuleRow = {
  id: string
  title: string
  position: number
  unlock_after_days: number
  lessons: LessonRow[]
}

type QuizSummary = {
  id: string
  module_id: string | null
  title: string
  passing_score_percent: number
}

export default async function CourseLearnPage({
  params,
  searchParams,
}: LearnPageProps) {
  const { slug } = await params
  const { lesson: requestedLessonId } = await searchParams
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/login?next=/courses/${slug}/learn`)
  }

  const { data: course } = await supabase
    .from('courses')
    .select(
      `
      id,
      title,
      slug,
      require_quiz_to_unlock_next_module,
      modules (
        id,
        title,
        position,
        unlock_after_days,
        lessons (
          id,
          title,
          youtube_url,
          text_content,
          duration_seconds,
          position
        )
      ),
      quizzes (
        id,
        module_id,
        title,
        passing_score_percent
      )
    `
    )
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (!course) {
    notFound()
  }

  const [{ data: enrollment }, { data: profile }] = await Promise.all([
    supabase
      .from('enrollments')
      .select('id, enrolled_at')
      .eq('user_id', user.id)
      .eq('course_id', course.id)
      .maybeSingle(),
    supabase.from('profiles').select('role').eq('id', user.id).single(),
  ])

  const isAdmin = profile?.role === 'admin'
  if (!enrollment && !isAdmin) {
    redirect(`/courses/${slug}`)
  }

  const modules: ModuleRow[] = ((course.modules as ModuleRow[] | null) ?? [])
    .slice()
    .sort((a, b) => a.position - b.position)
    .map((mod) => ({
      ...mod,
      lessons: (mod.lessons ?? []).slice().sort((a, b) => a.position - b.position),
    }))

  const courseQuizzes = (course.quizzes as QuizSummary[] | null) ?? []
  const quizByModuleId = new Map<string, QuizSummary>()
  for (const q of courseQuizzes) {
    if (q.module_id) quizByModuleId.set(q.module_id, q)
  }

  const allLessons = modules.flatMap((m) =>
    m.lessons.map((l) => ({ ...l, moduleId: m.id }))
  )

  if (allLessons.length === 0) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <Link
          href={`/courses/${course.slug}`}
          className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400"
        >
          ← Back to {course.title}
        </Link>
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <h1 className="text-xl font-bold">{course.title}</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            This course does not have any lessons yet. Check back soon!
          </p>
        </div>
      </main>
    )
  }

  const quizIds = courseQuizzes.map((q) => q.id)
  const [{ data: progressRows }, { data: passedAttempts }] = await Promise.all([
    supabase
      .from('lesson_progress')
      .select('lesson_id')
      .eq('user_id', user.id)
      .eq('is_completed', true)
      .in(
        'lesson_id',
        allLessons.map((l) => l.id)
      ),
    quizIds.length > 0
      ? supabase
          .from('quiz_attempts')
          .select('quiz_id')
          .eq('user_id', user.id)
          .eq('passed', true)
          .in('quiz_id', quizIds)
      : Promise.resolve({ data: [] as { quiz_id: string }[] }),
  ])

  const completedIds = new Set((progressRows ?? []).map((r) => r.lesson_id))
  const passedQuizIds = new Set((passedAttempts ?? []).map((r) => r.quiz_id))

  // Check both quiz locks and drip-release locks (admins bypass locks)
  const blockingQuizByModuleId = new Map<string, QuizSummary | null>()
  const dripLockByModuleId = new Map<string, { daysRemaining: number; unlockDate: Date } | null>()
  let firstUnpassedQuizSoFar: QuizSummary | null = null

  for (const mod of modules) {
    if (!isAdmin && course.require_quiz_to_unlock_next_module && firstUnpassedQuizSoFar) {
      blockingQuizByModuleId.set(mod.id, firstUnpassedQuizSoFar)
    } else {
      blockingQuizByModuleId.set(mod.id, null)
    }

    if (!isAdmin && enrollment && (mod.unlock_after_days ?? 0) > 0) {
      const drip = getModuleDripStatus(enrollment.enrolled_at, mod.unlock_after_days)
      dripLockByModuleId.set(
        mod.id,
        drip.isUnlocked ? null : { daysRemaining: drip.daysRemaining, unlockDate: drip.unlockDate }
      )
    } else {
      dripLockByModuleId.set(mod.id, null)
    }

    const modQuiz = quizByModuleId.get(mod.id)
    if (modQuiz && !passedQuizIds.has(modQuiz.id) && !firstUnpassedQuizSoFar) {
      firstUnpassedQuizSoFar = modQuiz
    }
  }

  const isModuleLocked = (moduleId: string) =>
    Boolean(blockingQuizByModuleId.get(moduleId)) ||
    Boolean(dripLockByModuleId.get(moduleId))

  const unlockedLessons = allLessons.filter((l) => !isModuleLocked(l.moduleId))
  const requestedLesson = requestedLessonId
    ? allLessons.find((l) => l.id === requestedLessonId)
    : undefined

  const activeLesson =
    requestedLesson ??
    unlockedLessons.find((l) => !completedIds.has(l.id)) ??
    unlockedLessons[0] ??
    allLessons[0]

  const blockingQuiz = blockingQuizByModuleId.get(activeLesson.moduleId) ?? null
  const dripLock = dripLockByModuleId.get(activeLesson.moduleId) ?? null
  const currentModuleQuiz = quizByModuleId.get(activeLesson.moduleId) ?? null

  const currentIndex = allLessons.findIndex((l) => l.id === activeLesson.id)
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null
  const nextLesson =
    currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null

  const isNextLessonQuizLocked = Boolean(
    nextLesson && blockingQuizByModuleId.get(nextLesson.moduleId)
  )
  const isCurrentCompleted = completedIds.has(activeLesson.id)
  const progressPercent = Math.round((completedIds.size / allLessons.length) * 100)

  let discussionPosts: DiscussionPostItem[] = []
  if (!blockingQuiz && !dripLock) {
    const { data: rawPosts } = await supabase
      .from('discussion_posts')
      .select(
        'id, user_id, parent_id, author_name, body, is_pinned, created_at, discussion_upvotes(user_id)'
      )
      .eq('lesson_id', activeLesson.id)
      .order('created_at', { ascending: false })

    discussionPosts = (rawPosts ?? []).map((p) => {
      const upvotes =
        (p.discussion_upvotes as { user_id: string }[] | null) ?? []
      return {
        id: p.id,
        user_id: p.user_id,
        parent_id: p.parent_id,
        author_name: p.author_name,
        body: p.body,
        is_pinned: p.is_pinned,
        created_at: p.created_at,
        upvoteCount: upvotes.length,
        userHasUpvoted: upvotes.some((u) => u.user_id === user.id),
      }
    })
  }

  const syllabusList = (
    <div className="space-y-4">
      {modules.map((mod, modIdx) => {
        const locked = isModuleLocked(mod.id)
        const modDrip = dripLockByModuleId.get(mod.id)
        const modQuiz = quizByModuleId.get(mod.id)
        const isModQuizPassed = modQuiz ? passedQuizIds.has(modQuiz.id) : false

        return (
          <div key={mod.id}>
            <p className="flex items-center justify-between px-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <span>
                {modIdx + 1}. {mod.title}
              </span>
              {locked && (
                <span title={modDrip ? `Unlocks in ${modDrip.daysRemaining}d` : 'Locked'}>
                  🔒{modDrip ? ` ${modDrip.daysRemaining}d` : ''}
                </span>
              )}
            </p>

            <ul className="mt-1.5 space-y-1">
              {mod.lessons.map((lesson) => {
                const isActive = lesson.id === activeLesson.id
                const isDone = completedIds.has(lesson.id)

                if (locked) {
                  return (
                    <li
                      key={lesson.id}
                      className="flex items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-sm text-slate-400"
                    >
                      <span>🔒 {lesson.title}</span>
                    </li>
                  )
                }

                return (
                  <li key={lesson.id}>
                    <Link
                      href={`/courses/${course.slug}/learn?lesson=${lesson.id}`}
                      className={`flex items-start justify-between gap-2 rounded-lg px-2.5 py-2 text-sm transition ${
                        isActive
                          ? 'bg-slate-900 font-medium text-white dark:bg-white dark:text-slate-900'
                          : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span className="flex items-start gap-2">
                        <span
                          className={`mt-0.5 text-xs ${
                            isDone
                              ? isActive
                                ? 'text-emerald-300 dark:text-emerald-700'
                                : 'text-emerald-600'
                              : 'opacity-40'
                          }`}
                        >
                          {isDone ? '✓' : '○'}
                        </span>
                        <span>{lesson.title}</span>
                      </span>
                      <span
                        className={`shrink-0 text-xs ${
                          isActive ? 'opacity-80' : 'text-slate-400'
                        }`}
                      >
                        {formatDuration(lesson.duration_seconds)}
                      </span>
                    </Link>
                  </li>
                )
              })}

              {modQuiz && !locked && (
                <li>
                  <Link
                    href={`/courses/${course.slug}/quiz/${modQuiz.id}`}
                    className="flex items-center justify-between gap-2 rounded-lg border border-dashed border-slate-300 px-2.5 py-2 text-xs font-medium text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    <span>📝 {modQuiz.title}</span>
                    <span
                      className={
                        isModQuizPassed
                          ? 'text-emerald-700 dark:text-emerald-400'
                          : 'text-amber-700 dark:text-amber-400'
                      }
                    >
                      {isModQuizPassed ? '✓ Passed' : 'Take Quiz'}
                    </span>
                  </Link>
                </li>
              )}
            </ul>
          </div>
        )
      })}
    </div>
  )

  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href={`/courses/${course.slug}`}
            className="text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400"
          >
            ← Back to Course Overview
          </Link>
          <h1 className="mt-1 text-lg font-bold text-slate-900 dark:text-white sm:text-xl">
            {course.title}
          </h1>
        </div>

        <div className="w-full sm:w-56">
          <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-400">
            <span>
              {completedIds.size}/{allLessons.length} completed
            </span>
            <span>{progressPercent}%</span>
          </div>
          <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
            <div
              className="h-full bg-emerald-600 transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      <details className="mb-5 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 lg:hidden">
        <summary className="cursor-pointer text-sm font-semibold text-slate-900 dark:text-white">
          Course Lessons &amp; Quizzes ({currentIndex + 1} of {allLessons.length})
        </summary>
        <div className="mt-4 border-t border-slate-100 pt-3 dark:border-slate-800">
          {syllabusList}
        </div>
      </details>

      <div className="grid gap-6 lg:grid-cols-[290px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-4 max-h-[calc(100vh-100px)] overflow-y-auto rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-3 text-sm font-bold text-slate-900 dark:text-white">
              Course Content
            </h2>
            {syllabusList}
          </div>
        </aside>

        <section className="space-y-5">
          {dripLock ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 dark:border-amber-900 dark:bg-amber-950/40">
              <h2 className="text-lg font-bold text-amber-950 dark:text-amber-200">
                🕒 This module unlocks in {dripLock.daysRemaining}{' '}
                {dripLock.daysRemaining === 1 ? 'day' : 'days'}
              </h2>
              <p className="mt-2 text-sm text-amber-900 dark:text-amber-300">
                Scheduled unlock date:{' '}
                <strong>{dripLock.unlockDate.toLocaleDateString()}</strong>.
              </p>
            </div>
          ) : blockingQuiz ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 dark:border-amber-900 dark:bg-amber-950/40">
              <h2 className="text-lg font-bold text-amber-950 dark:text-amber-200">
                🔒 This module is locked
              </h2>
              <p className="mt-2 text-sm text-amber-900 dark:text-amber-300">
                Please pass <strong>{blockingQuiz.title}</strong> (at least{' '}
                {blockingQuiz.passing_score_percent}%) to unlock this module.
              </p>
              <Link
                href={`/courses/${course.slug}/quiz/${blockingQuiz.id}`}
                className="mt-4 inline-block rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900"
              >
                Take Required Quiz →
              </Link>
            </div>
          ) : (
            <>
              <YouTubePlayer
                youtubeUrl={activeLesson.youtube_url}
                title={activeLesson.title}
              />

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-medium text-slate-500">
                      Lesson {currentIndex + 1} of {allLessons.length} •{' '}
                      {formatDuration(activeLesson.duration_seconds)}
                    </p>
                    <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
                      {activeLesson.title}
                    </h2>
                  </div>

                  <form action={toggleLessonComplete}>
                    <input type="hidden" name="courseId" value={course.id} />
                    <input type="hidden" name="slug" value={course.slug} />
                    <input type="hidden" name="lessonId" value={activeLesson.id} />
                    <input
                      type="hidden"
                      name="nextCompleted"
                      value={isCurrentCompleted ? 'false' : 'true'}
                    />
                    <button
                      type="submit"
                      className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                        isCurrentCompleted
                          ? 'border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-emerald-700 text-white hover:bg-emerald-800'
                      }`}
                    >
                      {isCurrentCompleted
                        ? '✓ Completed (Undo)'
                        : 'Mark as Complete'}
                    </button>
                  </form>
                </div>

                {activeLesson.text_content && (
                  <div className="mt-5 whitespace-pre-wrap border-t border-slate-100 pt-5 text-sm leading-relaxed text-slate-700 dark:border-slate-800 dark:text-slate-300">
                    {activeLesson.text_content}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between gap-3">
                {prevLesson ? (
                  <Link
                    href={`/courses/${course.slug}/learn?lesson=${prevLesson.id}`}
                    className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                  >
                    ← Previous
                  </Link>
                ) : (
                  <span />
                )}

                {isNextLessonQuizLocked && currentModuleQuiz ? (
                  <Link
                    href={`/courses/${course.slug}/quiz/${currentModuleQuiz.id}`}
                    className="rounded-lg bg-amber-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-amber-700"
                  >
                    Take Module Quiz to Unlock Next →
                  </Link>
                ) : nextLesson ? (
                  <Link
                    href={`/courses/${course.slug}/learn?lesson=${nextLesson.id}`}
                    className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900"
                  >
                    Next Lesson →
                  </Link>
                ) : (
                  <Link
                    href={`/courses/${course.slug}`}
                    className="rounded-lg bg-emerald-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-800"
                  >
                    Finish &amp; Return to Course
                  </Link>
                )}
              </div>

              <LessonDiscussion
                slug={course.slug}
                courseId={course.id}
                lessonId={activeLesson.id}
                currentUserId={user.id}
                isAdmin={isAdmin}
                posts={discussionPosts}
              />
            </>
          )}
        </section>
      </div>
    </main>
  )
}
