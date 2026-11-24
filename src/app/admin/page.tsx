import Link from 'next/link'
import { requireAdmin } from '@/lib/admin'
import { createCourse, togglePublishCourse } from './actions'

type AdminCourseRow = {
  id: string
  title: string
  slug: string
  category: string
  level: string
  instructor_name: string
  is_published: boolean
  enrollments: { count: number }[]
}

export default async function AdminDashboardPage() {
  const { supabase } = await requireAdmin()

  const { data: coursesRaw } = await supabase
    .from('courses')
    .select(
      'id, title, slug, category, level, instructor_name, is_published, enrollments(count)'
    )
    .order('created_at', { ascending: false })

  const courses = (coursesRaw as unknown as AdminCourseRow[] | null) ?? []

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Admin Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Create courses, manage lessons &amp; quizzes, publish content, and view
            enrollments.
          </p>
        </div>

        <Link
          href="/admin/analytics"
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        >
          📊 View Drop-Off Analytics
        </Link>
      </div>

      <section className="mt-6">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          All Courses ({courses.length})
        </h2>

        {courses.length === 0 ? (
          <p className="mt-3 rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
            No courses yet. Create your first course below!
          </p>
        ) : (
          <div className="mt-3 space-y-3">
            {courses.map((course) => {
              const enrollmentCount = course.enrollments?.[0]?.count ?? 0

              return (
                <div
                  key={course.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                        {course.title}
                      </h3>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          course.is_published
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {course.is_published ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      {course.category} • {course.level} • By{' '}
                      {course.instructor_name} •{' '}
                      <strong className="text-slate-700 dark:text-slate-300">
                        {enrollmentCount} enrolled
                      </strong>
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <form action={togglePublishCourse}>
                      <input type="hidden" name="courseId" value={course.id} />
                      <input
                        type="hidden"
                        name="nextPublished"
                        value={course.is_published ? 'false' : 'true'}
                      />
                      <button
                        type="submit"
                        className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                      >
                        {course.is_published ? 'Unpublish' : 'Publish'}
                      </button>
                    </form>

                    <Link
                      href={`/admin/courses/${course.id}`}
                      className="rounded-lg bg-slate-900 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900"
                    >
                      Edit Course &amp; Lessons
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      <section className="mt-10 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          Create New Course
        </h2>
        <form action={createCourse} className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              Course Title *
            </label>
            <input
              name="title"
              required
              placeholder="e.g. Introduction to Python"
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              URL Slug (optional — auto-generated from title)
            </label>
            <input
              name="slug"
              placeholder="intro-to-python"
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              Category
            </label>
            <input
              name="category"
              defaultValue="Programming"
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              Instructor Name
            </label>
            <input
              name="instructor_name"
              defaultValue="MOOC Team"
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              Level
            </label>
            <select
              name="level"
              defaultValue="beginner"
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              Description
            </label>
            <textarea
              name="description"
              rows={3}
              placeholder="What will learners build or master?"
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 sm:col-span-2">
            <input
              type="checkbox"
              name="require_quiz_to_unlock_next_module"
              className="h-4 w-4 rounded border-slate-300"
            />
            Lock next module until current module&apos;s quiz is passed
          </label>

          <div className="sm:col-span-2">
            <button
              type="submit"
              className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900"
            >
              Create Draft Course
            </button>
          </div>
        </form>
      </section>
    </main>
  )
}
