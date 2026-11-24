import Image from 'next/image'
import Link from 'next/link'

export type CourseCardData = {
  id: string
  title: string
  slug: string
  description: string | null
  category: string
  level: string
  instructor_name: string
  thumbnail_url: string | null
}

export default function CourseCard({ course }: { course: CourseCardData }) {
  return (
    <Link
      href={`/courses/${course.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:border-slate-300 hover:shadow dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
    >
      {course.thumbnail_url ? (
        <div className="relative aspect-video w-full bg-slate-100 dark:bg-slate-800">
          <Image
            src={course.thumbnail_url}
            alt={course.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
          />
        </div>
      ) : (
        <div className="flex aspect-video w-full items-center justify-center bg-slate-100 px-4 text-center dark:bg-slate-800">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {course.category}
          </span>
        </div>
      )}

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center gap-2 text-xs">
          <span className="rounded bg-slate-100 px-2 py-0.5 font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            {course.category}
          </span>
          <span className="capitalize text-slate-500 dark:text-slate-400">
            {course.level}
          </span>
        </div>

        <h3 className="mt-2 text-base font-semibold text-slate-900 group-hover:underline dark:text-white">
          {course.title}
        </h3>

        {course.description && (
          <p className="mt-1.5 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">
            {course.description}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between pt-4 text-xs text-slate-500 dark:text-slate-400">
          <span>By {course.instructor_name}</span>
          <span className="font-semibold text-emerald-700 dark:text-emerald-400">
            Free
          </span>
        </div>
      </div>
    </Link>
  )
}
