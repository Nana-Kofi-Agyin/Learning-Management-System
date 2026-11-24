import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requireAdmin } from '@/lib/admin'
import AdminLessonList, { type AdminLessonItem } from '@/components/AdminLessonList'
import {
  createLesson,
  createModule,
  createQuiz,
  deleteCourse,
  deleteModule,
  updateCourse,
} from '../../actions'

type AdminCourseEditorProps = {
  params: Promise<{ courseId: string }>
}

type ModuleRow = {
  id: string
  title: string
  description: string | null
  position: number
  unlock_after_days: number
  lessons: AdminLessonItem[]
}

type QuizRow = {
  id: string
  module_id: string | null
  title: string
  passing_score_percent: number
}

export default async function AdminCourseEditorPage({
  params,
}: AdminCourseEditorProps) {
  const { courseId } = await params
  const { supabase } = await requireAdmin()

  const { data: course } = await supabase
    .from('courses')
    .select(
      `
      id,
      title,
      slug,
      description,
      category,
      level,
      instructor_name,
      thumbnail_url,
      is_published,
      require_quiz_to_unlock_next_module,
      enrollments(count),
      modules (
        id,
        title,
        description,
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
    .eq('id', courseId)
    .single()

  if (!course) {
    notFound()
  }

  const modules: ModuleRow[] = ((course.modules as ModuleRow[] | null) ?? [])
    .slice()
    .sort((a, b) => a.position - b.position)
    .map((m) => ({
      ...m,
      lessons: (m.lessons ?? []).slice().sort((a, b) => a.position - b.position),
    }))

  const quizzes = (course.quizzes as QuizRow[] | null) ?? []
  const quizByModuleId = new Map<string, QuizRow>()
  for (const q of quizzes) {
    if (q.module_id) quizByModuleId.set(q.module_id, q)
  }

  const enrollmentCount =
    (course.enrollments as unknown as { count: number }[] | null)?.[0]?.count ?? 0

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/admin"
          className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400"
        >
          ← Back to Admin Dashboard
        </Link>

        <div className="flex items-center gap-3 text-xs">
          <span className="rounded bg-slate-100 px-2.5 py-1 font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            {enrollmentCount} enrolled
          </span>
          {course.is_published && (
            <Link
              href={`/courses/${course.slug}`}
              className="font-medium text-emerald-700 underline dark:text-emerald-400"
            >
              View Live Course ↗
            </Link>
          )}
        </div>
      </div>

      <section className="mt-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
          Edit Course Details
        </h1>

        <form action={updateCourse} className="mt-4 grid gap-4 sm:grid-cols-2">
          <input type="hidden" name="courseId" value={course.id} />

          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              Title *
            </label>
            <input
              name="title"
              required
              defaultValue={course.title}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              Slug *
            </label>
            <input
              name="slug"
              required
              defaultValue={course.slug}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              Category
            </label>
            <input
              name="category"
              defaultValue={course.category}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              Instructor Name
            </label>
            <input
              name="instructor_name"
              defaultValue={course.instructor_name}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              Level
            </label>
            <select
              name="level"
              defaultValue={course.level}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              Thumbnail Image URL (https://...)
            </label>
            <input
              name="thumbnail_url"
              defaultValue={course.thumbnail_url ?? ''}
              placeholder="https://..."
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              Description
            </label>
            <textarea
              name="description"
              rows={3}
              defaultValue={course.description ?? ''}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 sm:col-span-2">
            <input
              type="checkbox"
              name="is_published"
              defaultChecked={course.is_published}
              className="h-4 w-4 rounded border-slate-300"
            />
            Published (visible in the public Course Catalog)
          </label>

          <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 sm:col-span-2">
            <input
              type="checkbox"
              name="require_quiz_to_unlock_next_module"
              defaultChecked={course.require_quiz_to_unlock_next_module}
              className="h-4 w-4 rounded border-slate-300"
            />
            Lock next module until current module&apos;s quiz is passed
          </label>

          <div className="sm:col-span-2">
            <button
              type="submit"
              className="rounded-lg bg-slate-900 px-5 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900"
            >
              Save Course Settings
            </button>
          </div>
        </form>

        <form action={deleteCourse} className="mt-4 border-t border-slate-100 pt-4 dark:border-slate-800">
          <input type="hidden" name="courseId" value={course.id} />
          <button
            type="submit"
            className="text-xs font-medium text-red-700 underline hover:text-red-900 dark:text-red-400"
          >
            Delete this course permanently
          </button>
        </form>
      </section>

      <section className="mt-8 space-y-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Modules, Lessons &amp; Quizzes
        </h2>

        {modules.map((mod, modIndex) => {
          const modQuiz = quizByModuleId.get(mod.id)

          return (
            <div
              key={mod.id}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Module {modIndex + 1}: {mod.title}
                  </h3>
                  {mod.description && (
                    <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">
                      {mod.description}
                    </p>
                  )}
                  {mod.unlock_after_days > 0 && (
                    <p className="mt-1 text-xs font-medium text-amber-700 dark:text-amber-400">
                      🕒 Drip release: unlocks {mod.unlock_after_days} days after enrollment
                    </p>
                  )}
                </div>

                <form action={deleteModule}>
                  <input type="hidden" name="courseId" value={course.id} />
                  <input type="hidden" name="moduleId" value={mod.id} />
                  <button
                    type="submit"
                    className="rounded border border-red-200 px-2.5 py-1 text-xs font-medium text-red-700 hover:bg-red-50 dark:border-red-900 dark:text-red-400"
                  >
                    Delete Module
                  </button>
                </form>
              </div>

              <div className="mt-4">
                <AdminLessonList
                  key={mod.lessons.map((l) => `${l.id}:${l.position}:${l.title}`).join(',')}
                  courseId={course.id}
                  initialLessons={mod.lessons}
                />
              </div>

              <details className="mt-4 rounded-lg border border-dashed border-slate-300 p-3 dark:border-slate-700">
                <summary className="cursor-pointer text-xs font-semibold text-slate-800 dark:text-slate-200">
                  + Add Lesson to Module {modIndex + 1}
                </summary>
                <form action={createLesson} className="mt-3 space-y-3">
                  <input type="hidden" name="courseId" value={course.id} />
                  <input type="hidden" name="moduleId" value={mod.id} />
                  <input type="hidden" name="position" value={mod.lessons.length + 1} />

                  <div className="grid gap-3 sm:grid-cols-2">
                    <input
                      name="title"
                      required
                      placeholder="Lesson title *"
                      className="rounded border border-slate-300 bg-white px-3 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-800"
                    />
                    <input
                      name="duration_minutes"
                      type="number"
                      min={0}
                      defaultValue={5}
                      placeholder="Duration (minutes)"
                      className="rounded border border-slate-300 bg-white px-3 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-800"
                    />
                  </div>

                  <input
                    name="youtube_url"
                    placeholder="Unlisted YouTube URL (e.g. https://youtu.be/...)"
                    className="w-full rounded border border-slate-300 bg-white px-3 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-800"
                  />

                  <textarea
                    name="text_content"
                    rows={3}
                    placeholder="Lesson notes / reading content (low-bandwidth friendly)"
                    className="w-full rounded border border-slate-300 bg-white px-3 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-800"
                  />

                  <button
                    type="submit"
                    className="rounded-lg bg-slate-900 px-4 py-1.5 text-xs font-medium text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900"
                  >
                    Add Lesson
                  </button>
                </form>
              </details>

              <div className="mt-4 border-t border-slate-100 pt-4 dark:border-slate-800">
                {modQuiz ? (
                  <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-50 px-4 py-3 dark:bg-slate-800/60">
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        📝 {modQuiz.title}
                      </p>
                      <p className="text-xs text-slate-500">
                        Passing score: {modQuiz.passing_score_percent}%
                      </p>
                    </div>
                    <Link
                      href={`/admin/quizzes/${modQuiz.id}`}
                      className="rounded-lg bg-slate-900 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900"
                    >
                      Edit Quiz Questions
                    </Link>
                  </div>
                ) : (
                  <form action={createQuiz} className="flex flex-wrap items-center gap-2">
                    <input type="hidden" name="courseId" value={course.id} />
                    <input type="hidden" name="moduleId" value={mod.id} />
                    <input
                      name="title"
                      required
                      defaultValue={`Module ${modIndex + 1} Quiz`}
                      className="flex-1 rounded border border-slate-300 bg-white px-3 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800"
                    />
                    <input
                      name="passing_score_percent"
                      type="number"
                      min={0}
                      max={100}
                      defaultValue={70}
                      className="w-20 rounded border border-slate-300 bg-white px-2 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800"
                      title="Passing score %"
                    />
                    <button
                      type="submit"
                      className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                    >
                      + Create Module Quiz
                    </button>
                  </form>
                )}
              </div>
            </div>
          )
        })}

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Add New Module
          </h3>
          <form action={createModule} className="mt-3 space-y-3">
            <input type="hidden" name="courseId" value={course.id} />
            <input type="hidden" name="position" value={modules.length + 1} />

            <input
              name="title"
              required
              placeholder="Module title (e.g. Module 3: JavaScript Basics)"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
            />
            <div className="grid gap-3 sm:grid-cols-[1fr_180px]">
              <input
                name="description"
                placeholder="Short module description (optional)"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
              />
              <input
                name="unlock_after_days"
                type="number"
                min={0}
                defaultValue={0}
                placeholder="Drip days (0 = immediate)"
                title="Drip release: days after enrollment before unlocking (0 = immediate)"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
              />
            </div>
            <button
              type="submit"
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900"
            >
              Add Module
            </button>
          </form>
        </div>
      </section>
    </main>
  )
}
