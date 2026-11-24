import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { formatDuration } from '@/lib/format'
import { getCoursePrerequisites } from '@/lib/learning-rules'
import PrerequisitesBanner from '@/components/PrerequisitesBanner'
import CourseReviews from '@/components/CourseReviews'
import { enrollInCourse } from './actions'

type CourseDetailPageProps = {
  params: Promise<{ slug: string }>
}

type LessonRow = {
  id: string
  title: string
  duration_seconds: number
  position: number
}

type ModuleRow = {
  id: string
  title: string
  description: string | null
  position: number
  lessons: LessonRow[]
}

export async function generateMetadata({
  params,
}: CourseDetailPageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()

  const { data: course } = await supabase
    .from('courses')
    .select('title, description, category, instructor_name, thumbnail_url')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (!course) {
    return { title: 'Course Not Found' }
  }

  const description =
    course.description ||
    `Free self-paced ${course.category} course taught by ${course.instructor_name}.`

  return {
    title: course.title,
    description,
    openGraph: {
      title: course.title,
      description,
      type: 'article',
      ...(course.thumbnail_url ? { images: [{ url: course.thumbnail_url }] } : {}),
    },
  }
}

export default async function CourseLandingPage({ params }: CourseDetailPageProps) {
  const { slug } = await params
  const supabase = await createClient()

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
      modules (
        id,
        title,
        description,
        position,
        lessons (
          id,
          title,
          duration_seconds,
          position
        )
      )
    `
    )
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (!course) {
    notFound()
  }

  const modules: ModuleRow[] = ((course.modules as ModuleRow[] | null) ?? [])
    .slice()
    .sort((a, b) => a.position - b.position)
    .map((mod) => ({
      ...mod,
      lessons: (mod.lessons ?? []).slice().sort((a, b) => a.position - b.position),
    }))

  const allLessons = modules.flatMap((m) => m.lessons)
  const totalLessons = allLessons.length
  const totalSeconds = allLessons.reduce(
    (sum, l) => sum + (l.duration_seconds || 0),
    0
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const prerequisites = await getCoursePrerequisites(
    supabase,
    course.id,
    user?.id ?? null
  )

  let isEnrolled = false
  const completedIds = new Set<string>()

  if (user) {
    const { data: enrollment } = await supabase
      .from('enrollments')
      .select('id')
      .eq('user_id', user.id)
      .eq('course_id', course.id)
      .maybeSingle()

    isEnrolled = Boolean(enrollment)

    if (isEnrolled && allLessons.length > 0) {
      const { data: progressRows } = await supabase
        .from('lesson_progress')
        .select('lesson_id')
        .eq('user_id', user.id)
        .eq('is_completed', true)
        .in(
          'lesson_id',
          allLessons.map((l) => l.id)
        )

      for (const row of progressRows ?? []) {
        completedIds.add(row.lesson_id)
      }
    }
  }

  const completedCount = completedIds.size
  const progressPercent =
    totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0

  const nextLesson =
    allLessons.find((l) => !completedIds.has(l.id)) ?? allLessons[0] ?? null

  const resumeHref = nextLesson
    ? `/courses/${course.slug}/learn?lesson=${nextLesson.id}`
    : `/courses/${course.slug}/learn`

  const resumeLabel =
    completedCount === 0
      ? 'Start Learning'
      : completedCount >= totalLessons
        ? 'Review Course'
        : 'Resume where you left off'

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <Link
        href="/courses"
        className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
      >
        ← Back to Course Catalog
      </Link>

      <section className="mt-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded bg-slate-100 px-2.5 py-1 font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            {course.category}
          </span>
          <span className="rounded bg-slate-100 px-2.5 py-1 capitalize text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            {course.level}
          </span>
          <span className="rounded bg-emerald-50 px-2.5 py-1 font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            Free
          </span>
        </div>

        <h1 className="mt-3 text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
          {course.title}
        </h1>

        {course.description && (
          <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300 sm:text-base">
            {course.description}
          </p>
        )}

        <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 border-t border-slate-100 pt-4 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-300">
          <span>
            <strong className="text-slate-900 dark:text-white">Instructor:</strong>{' '}
            {course.instructor_name}
          </span>
          <span>
            <strong className="text-slate-900 dark:text-white">Modules:</strong>{' '}
            {modules.length}
          </span>
          <span>
            <strong className="text-slate-900 dark:text-white">Lessons:</strong>{' '}
            {totalLessons}
          </span>
          <span>
            <strong className="text-slate-900 dark:text-white">Duration:</strong>{' '}
            {formatDuration(totalSeconds)}
          </span>
        </div>

        <PrerequisitesBanner prerequisites={prerequisites} />

        <div className="mt-6">
          {isEnrolled ? (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-400">
                  <span>
                    {completedCount} of {totalLessons} lessons completed
                  </span>
                  <span>{progressPercent}%</span>
                </div>
                <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-full bg-emerald-600 transition-all"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href={resumeHref}
                  className="rounded-lg bg-emerald-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-800"
                >
                  {resumeLabel}
                </Link>
                {nextLesson && completedCount > 0 && completedCount < totalLessons && (
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Next:{' '}
                    <strong className="text-slate-700 dark:text-slate-200">
                      {nextLesson.title}
                    </strong>
                  </span>
                )}
              </div>
            </div>
          ) : user ? (
            <form action={enrollInCourse}>
              <input type="hidden" name="courseId" value={course.id} />
              <input type="hidden" name="slug" value={course.slug} />
              <button
                type="submit"
                className="rounded-lg bg-slate-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
              >
                Enroll for Free (One Click)
              </button>
            </form>
          ) : (
            <Link
              href={`/login?next=/courses/${course.slug}`}
              className="inline-block rounded-lg bg-slate-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
            >
              Log in to Enroll for Free
            </Link>
          )}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Course Syllabus
        </h2>

        {modules.length === 0 ? (
          <p className="mt-3 rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
            Syllabus lessons will be added soon.
          </p>
        ) : (
          <div className="mt-4 space-y-4">
            {modules.map((mod, modIndex) => (
              <div
                key={mod.id}
                className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="border-b border-slate-100 bg-slate-50 px-5 py-3.5 dark:border-slate-800 dark:bg-slate-800/60">
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                    {modIndex + 1}. {mod.title}
                  </h3>
                  {mod.description && (
                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                      {mod.description}
                    </p>
                  )}
                </div>

                <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                  {mod.lessons.map((lesson, lessonIndex) => {
                    const done = completedIds.has(lesson.id)
                    return (
                      <li
                        key={lesson.id}
                        className="flex items-center justify-between gap-4 px-5 py-3 text-sm"
                      >
                        <div className="flex items-center gap-2">
                          {isEnrolled ? (
                            <Link
                              href={`/courses/${course.slug}/learn?lesson=${lesson.id}`}
                              className="text-slate-800 hover:underline dark:text-slate-200"
                            >
                              <span className="mr-2 font-mono text-xs text-slate-400">
                                {modIndex + 1}.{lessonIndex + 1}
                              </span>
                              {lesson.title}
                            </Link>
                          ) : (
                            <span className="text-slate-800 dark:text-slate-200">
                              <span className="mr-2 font-mono text-xs text-slate-400">
                                {modIndex + 1}.{lessonIndex + 1}
                              </span>
                              {lesson.title}
                            </span>
                          )}
                          {done && (
                            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                              ✓
                            </span>
                          )}
                        </div>
                        <span className="shrink-0 text-xs text-slate-500 dark:text-slate-400">
                          {formatDuration(lesson.duration_seconds)}
                        </span>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>

      <CourseReviews
        courseId={course.id}
        slug={course.slug}
        isEnrolled={isEnrolled}
        currentUserId={user?.id ?? null}
      />
    </main>
  )
}
