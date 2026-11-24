import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { calculateLearningStreak } from '@/lib/streak'

type LessonRow = { id: string; title: string; position: number }
type ModuleRow = { id: string; position: number; lessons: LessonRow[] }
type CourseRow = {
  id: string
  title: string
  slug: string
  category: string
  level: string
  instructor_name: string
  modules: ModuleRow[]
}
type EnrollmentRow = {
  id: string
  enrolled_at: string
  completed_at: string | null
  courses: CourseRow | null
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?next=/dashboard')
  }

  const [
    { data: profile },
    { data: enrollmentsRaw },
    { data: progressRows },
    { data: certRows },
  ] = await Promise.all([
    supabase.from('profiles').select('full_name, role').eq('id', user.id).single(),
    supabase
      .from('enrollments')
      .select(
        `
        id,
        enrolled_at,
        completed_at,
        courses (
          id,
          title,
          slug,
          category,
          level,
          instructor_name,
          modules (
            id,
            position,
            lessons (
              id,
              title,
              position
            )
          )
        )
      `
      )
      .eq('user_id', user.id)
      .order('enrolled_at', { ascending: false }),
    supabase
      .from('lesson_progress')
      .select('lesson_id, completed_at')
      .eq('user_id', user.id)
      .eq('is_completed', true),
    supabase
      .from('certificates')
      .select('course_id, verification_code')
      .eq('user_id', user.id),
  ])

  const enrollments = (enrollmentsRaw as unknown as EnrollmentRow[] | null) ?? []
  const completedIds = new Set((progressRows ?? []).map((r) => r.lesson_id))
  const certCodeByCourseId = new Map<string, string>()
  for (const c of certRows ?? []) {
    certCodeByCourseId.set(c.course_id, c.verification_code)
  }

  const totalCompletedLessons = completedIds.size
  const { currentStreak, learnedToday } = calculateLearningStreak(
    (progressRows ?? []).map((r) => r.completed_at)
  )

  const enrolledCourses = enrollments
    .filter((e) => e.courses !== null)
    .map((enrollment) => {
      const course = enrollment.courses!
      const sortedLessons = (course.modules ?? [])
        .slice()
        .sort((a, b) => a.position - b.position)
        .flatMap((mod) =>
          (mod.lessons ?? []).slice().sort((a, b) => a.position - b.position)
        )

      const totalLessons = sortedLessons.length
      const completedLessonsCount = sortedLessons.filter((l) =>
        completedIds.has(l.id)
      ).length
      const progressPercent =
        totalLessons > 0
          ? Math.round((completedLessonsCount / totalLessons) * 100)
          : 0

      const nextLesson =
        sortedLessons.find((l) => !completedIds.has(l.id)) ??
        sortedLessons[0] ??
        null

      const continueHref = nextLesson
        ? `/courses/${course.slug}/learn?lesson=${nextLesson.id}`
        : `/courses/${course.slug}/learn`

      const certificateCode = certCodeByCourseId.get(course.id) ?? null
      const isCompleted =
        Boolean(certificateCode) ||
        (totalLessons > 0 && completedLessonsCount >= totalLessons)

      return {
        enrollmentId: enrollment.id,
        course,
        totalLessons,
        completedLessonsCount,
        progressPercent,
        nextLesson,
        continueHref,
        isCompleted,
        certificateCode,
      }
    })

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Welcome back, {profile?.full_name || user.email}
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Track your progress and pick up right where you left off.
          </p>
        </div>

        <Link
          href="/courses"
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        >
          Browse More Courses
        </Link>
      </div>

      <section className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Enrolled Courses
          </p>
          <p className="mt-2 text-3xl font-bold">{enrolledCourses.length}</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Completed Lessons
          </p>
          <p className="mt-2 text-3xl font-bold">{totalCompletedLessons}</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Learning Streak
          </p>
          <p className="mt-2 text-3xl font-bold text-amber-600 dark:text-amber-400">
            {currentStreak} {currentStreak === 1 ? 'day' : 'days'}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {learnedToday
              ? 'Great job — you learned today!'
              : currentStreak > 0
                ? 'Complete a lesson today to keep your streak alive.'
                : 'Complete a lesson to start your streak.'}
          </p>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Your Courses
        </h2>

        {enrolledCourses.length === 0 ? (
          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              You haven&apos;t enrolled in any courses yet.
            </p>
            <Link
              href="/courses"
              className="mt-4 inline-block rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900"
            >
              Explore Free Courses
            </Link>
          </div>
        ) : (
          <div className="mt-4 grid gap-5 sm:grid-cols-2">
            {enrolledCourses.map((item) => (
              <div
                key={item.enrollmentId}
                className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="rounded bg-slate-100 px-2 py-0.5 font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    {item.course.category}
                  </span>
                  {item.isCompleted ? (
                    <span className="rounded bg-emerald-50 px-2 py-0.5 font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                      ✓ Completed
                    </span>
                  ) : (
                    <span className="capitalize text-slate-500">
                      {item.course.level}
                    </span>
                  )}
                </div>

                <Link
                  href={`/courses/${item.course.slug}`}
                  className="mt-2.5 text-lg font-semibold text-slate-900 hover:underline dark:text-white"
                >
                  {item.course.title}
                </Link>

                <p className="mt-1 text-xs text-slate-500">
                  By {item.course.instructor_name}
                </p>

                <div className="mt-4">
                  <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-400">
                    <span>
                      {item.completedLessonsCount} / {item.totalLessons} lessons
                      completed
                    </span>
                    <span>{item.progressPercent}%</span>
                  </div>
                  <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className="h-full bg-emerald-600 transition-all"
                      style={{ width: `${item.progressPercent}%` }}
                    />
                  </div>
                </div>

                {item.nextLesson && !item.isCompleted && (
                  <p className="mt-3 text-xs text-slate-500">
                    Up next:{' '}
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {item.nextLesson.title}
                    </span>
                  </p>
                )}

                <div className="mt-auto flex flex-wrap items-center gap-3 pt-5">
                  <Link
                    href={item.continueHref}
                    className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900"
                  >
                    {item.isCompleted
                      ? 'Review Course'
                      : item.completedLessonsCount === 0
                        ? 'Start Learning'
                        : 'Continue Learning'}
                  </Link>

                  {item.certificateCode && (
                    <>
                      <Link
                        href={`/verify/${item.certificateCode}`}
                        className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                      >
                        View Certificate
                      </Link>
                      <a
                        href={`/api/certificates/${item.certificateCode}/pdf`}
                        className="text-xs font-medium text-slate-700 underline hover:text-slate-900 dark:text-slate-300"
                      >
                        Download PDF
                      </a>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
