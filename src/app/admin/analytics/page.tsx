import Link from 'next/link'
import { requireAdmin } from '@/lib/admin'

type LessonRow = { id: string; title: string; position: number }
type ModuleRow = { id: string; title: string; position: number; lessons: LessonRow[] }
type CourseRow = {
  id: string
  title: string
  slug: string
  is_published: boolean
  modules: ModuleRow[]
}

export default async function AdminAnalyticsPage() {
  const { supabase } = await requireAdmin()

  const [{ data: coursesRaw }, { data: enrollments }, { data: progressRows }] =
    await Promise.all([
      supabase
        .from('courses')
        .select('id, title, slug, is_published, modules(id, title, position, lessons(id, title, position))')
        .order('created_at', { ascending: false }),
      supabase.from('enrollments').select('course_id, user_id, completed_at'),
      supabase
        .from('lesson_progress')
        .select('lesson_id, user_id')
        .eq('is_completed', true),
    ])

  const courses = (coursesRaw as unknown as CourseRow[] | null) ?? []

  const completionsByLesson = new Map<string, number>()
  for (const row of progressRows ?? []) {
    completionsByLesson.set(
      row.lesson_id,
      (completionsByLesson.get(row.lesson_id) ?? 0) + 1
    )
  }

  const enrollmentsByCourse = new Map<string, { total: number; completed: number }>()
  for (const e of enrollments ?? []) {
    const current = enrollmentsByCourse.get(e.course_id) ?? { total: 0, completed: 0 }
    current.total += 1
    if (e.completed_at) current.completed += 1
    enrollmentsByCourse.set(e.course_id, current)
  }

  const totalEnrollments = (enrollments ?? []).length
  const totalCompletedCourses = (enrollments ?? []).filter((e) => Boolean(e.completed_at)).length

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <Link
        href="/admin"
        className="text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400"
      >
        ← Back to Admin Dashboard
      </Link>
      <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
        Learner Drop-Off Analytics
      </h1>

      <section className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-medium uppercase text-slate-500">Courses</p>
          <p className="mt-2 text-3xl font-bold">{courses.length}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-medium uppercase text-slate-500">Total Enrollments</p>
          <p className="mt-2 text-3xl font-bold">{totalEnrollments}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-medium uppercase text-slate-500">Course Completion Rate</p>
          <p className="mt-2 text-3xl font-bold text-emerald-700 dark:text-emerald-400">
            {totalEnrollments > 0
              ? `${Math.round((totalCompletedCourses / totalEnrollments) * 100)}%`
              : '0%'}
          </p>
        </div>
      </section>

      <section className="mt-8 space-y-6">
        {courses.map((course) => {
          const stats = enrollmentsByCourse.get(course.id) ?? { total: 0, completed: 0 }
          const orderedLessons = (course.modules ?? [])
            .slice()
            .sort((a, b) => a.position - b.position)
            .flatMap((m) =>
              (m.lessons ?? []).slice().sort((a, b) => a.position - b.position)
            )

          let biggestDropLessonId: string | null = null
          let biggestDropAmount = 0
          for (let i = 1; i < orderedLessons.length; i++) {
            const prevCount = completionsByLesson.get(orderedLessons[i - 1].id) ?? 0
            const currCount = completionsByLesson.get(orderedLessons[i].id) ?? 0
            const drop = prevCount - currCount
            if (drop > biggestDropAmount) {
              biggestDropAmount = drop
              biggestDropLessonId = orderedLessons[i].id
            }
          }

          return (
            <div
              key={course.id}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  {course.title}
                </h2>
                <span className="text-xs text-slate-500">
                  {stats.total} enrolled • {stats.completed} finished
                </span>
              </div>

              {orderedLessons.length === 0 ? (
                <p className="mt-3 text-xs text-slate-500">No lessons yet.</p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {orderedLessons.map((lesson, idx) => {
                    const count = completionsByLesson.get(lesson.id) ?? 0
                    const pct =
                      stats.total > 0
                        ? Math.min(100, Math.round((count / stats.total) * 100))
                        : 0
                    const isBiggestDrop =
                      biggestDropLessonId === lesson.id && biggestDropAmount > 0

                    return (
                      <li key={lesson.id} className="text-xs">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium text-slate-800 dark:text-slate-200">
                            {idx + 1}. {lesson.title}
                            {isBiggestDrop && (
                              <span className="ml-2 rounded bg-red-100 px-1.5 py-0.5 text-[11px] font-semibold text-red-800">
                                Biggest drop-off (-{biggestDropAmount})
                              </span>
                            )}
                          </span>
                          <span className="shrink-0 text-slate-500">
                            {count}/{stats.total} ({pct}%)
                          </span>
                        </div>
                        <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                          <div
                            className={`h-full ${isBiggestDrop ? 'bg-red-500' : 'bg-emerald-600'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          )
        })}
      </section>
    </main>
  )
}
