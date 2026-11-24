import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import CourseCard from '@/components/CourseCard'

const COURSES_PER_PAGE = 6

type CoursesPageProps = {
  searchParams: Promise<{
    q?: string
    category?: string
    page?: string
  }>
}

export default async function CoursesCatalogPage({ searchParams }: CoursesPageProps) {
  const params = await searchParams
  const query = (params.q ?? '').trim()
  const selectedCategory = (params.category ?? '').trim()
  const currentPage = Math.max(1, Number.parseInt(params.page ?? '1', 10) || 1)

  const supabase = await createClient()

  const { data: categoryRows } = await supabase
    .from('courses')
    .select('category')
    .eq('is_published', true)

  const categories = Array.from(
    new Set((categoryRows ?? []).map((row) => row.category).filter(Boolean))
  ).sort()

  const from = (currentPage - 1) * COURSES_PER_PAGE
  const to = from + COURSES_PER_PAGE - 1

  let coursesQuery = supabase
    .from('courses')
    .select(
      'id, title, slug, description, category, level, instructor_name, thumbnail_url',
      { count: 'exact' }
    )
    .eq('is_published', true)

  if (selectedCategory) {
    coursesQuery = coursesQuery.eq('category', selectedCategory)
  }

  if (query) {
    const safeQuery = query.replace(/[%_,]/g, '')
    coursesQuery = coursesQuery.or(
      `title.ilike.%${safeQuery}%,description.ilike.%${safeQuery}%`
    )
  }

  const { data: courses, count } = await coursesQuery
    .order('created_at', { ascending: false })
    .range(from, to)

  const totalCourses = count ?? 0
  const totalPages = Math.max(1, Math.ceil(totalCourses / COURSES_PER_PAGE))

  function buildUrl(overrides: { q?: string; category?: string; page?: number }) {
    const sp = new URLSearchParams()
    const nextQ = overrides.q !== undefined ? overrides.q : query
    const nextCat = overrides.category !== undefined ? overrides.category : selectedCategory
    const nextPage = overrides.page ?? 1

    if (nextQ) sp.set('q', nextQ)
    if (nextCat) sp.set('category', nextCat)
    if (nextPage > 1) sp.set('page', String(nextPage))

    const qs = sp.toString()
    return qs ? `/courses?${qs}` : '/courses'
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
        Course Catalog
      </h1>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
        Explore all free, self-paced courses.
      </p>

      <form
        method="GET"
        action="/courses"
        className="mt-5 flex flex-col gap-2 sm:flex-row"
      >
        {selectedCategory && (
          <input type="hidden" name="category" value={selectedCategory} />
        )}
        <input
          type="search"
          name="q"
          defaultValue={query}
          placeholder="Search courses by title or topic..."
          className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
        />
        <button
          type="submit"
          className="rounded-lg bg-slate-900 px-5 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 sm:w-auto"
        >
          Search
        </button>
        {(query || selectedCategory) && (
          <Link
            href="/courses"
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-center text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            Clear
          </Link>
        )}
      </form>

      {categories.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href={buildUrl({ category: '', page: 1 })}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              !selectedCategory
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
            }`}
          >
            All Categories
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat}
              href={buildUrl({ category: cat, page: 1 })}
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
              }`}
            >
              {cat}
            </Link>
          ))}
        </div>
      )}

      <p className="mt-5 text-xs text-slate-500">
        Showing {courses?.length ?? 0} of {totalCourses} course
        {totalCourses === 1 ? '' : 's'}
        {query ? ` for "${query}"` : ''}
        {selectedCategory ? ` in ${selectedCategory}` : ''}
      </p>

      {courses && courses.length > 0 ? (
        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            No courses matched your search.
          </p>
          <Link
            href="/courses"
            className="mt-3 inline-block text-sm font-medium text-slate-900 underline dark:text-white"
          >
            Reset filters
          </Link>
        </div>
      )}

      {totalPages > 1 && (
        <nav
          aria-label="Pagination"
          className="mt-8 flex items-center justify-between border-t border-slate-200 pt-4 text-sm dark:border-slate-800"
        >
          {currentPage > 1 ? (
            <Link
              href={buildUrl({ page: currentPage - 1 })}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              Previous
            </Link>
          ) : (
            <span className="rounded-lg border border-slate-200 px-4 py-2 text-slate-400 dark:border-slate-800">
              Previous
            </span>
          )}

          <span className="text-slate-600 dark:text-slate-400">
            Page {currentPage} of {totalPages}
          </span>

          {currentPage < totalPages ? (
            <Link
              href={buildUrl({ page: currentPage + 1 })}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              Next
            </Link>
          ) : (
            <span className="rounded-lg border border-slate-200 px-4 py-2 text-slate-400 dark:border-slate-800">
              Next
            </span>
          )}
        </nav>
      )}
    </main>
  )
}
