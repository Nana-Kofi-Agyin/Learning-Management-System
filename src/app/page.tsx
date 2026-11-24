import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import CourseCard from '@/components/CourseCard'

export default async function HomePage() {
  let featuredCourses:
    | {
        id: string
        title: string
        slug: string
        description: string | null
        category: string
        level: string
        instructor_name: string
        thumbnail_url: string | null
      }[]
    | null = null

  if (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    const supabase = await createClient()
    const { data } = await supabase
      .from('courses')
      .select(
        'id, title, slug, description, category, level, instructor_name, thumbnail_url'
      )
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .limit(3)
    featuredCourses = data
  }

  return (
    <main>
      <section className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/50">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:py-16">
          <span className="inline-block rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            100% Free &amp; Self-Paced
          </span>
          <h1 className="mt-4 max-w-2xl text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Learn practical skills at your own pace, from any device.
          </h1>
          <p className="mt-3 max-w-xl text-base text-slate-600 dark:text-slate-300">
            Lightweight, mobile-first courses with clear video lessons, text notes
            for slow connections, quizzes, and free completion certificates.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/courses"
              className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
            >
              Browse Courses
            </Link>
            <Link
              href="/signup"
              className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Create Free Account
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-10">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Featured Courses
          </h2>
          <Link
            href="/courses"
            className="text-sm font-medium text-slate-700 underline hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
          >
            View all
          </Link>
        </div>

        {featuredCourses && featuredCourses.length > 0 ? (
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featuredCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <p className="mt-5 rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
            No courses published yet. Add your Supabase keys in .env.local and
            run the SQL migrations to see sample courses!
          </p>
        )}
      </section>
    </main>
  )
}
