import Link from 'next/link'
import type { PrerequisiteStatus } from '@/lib/learning-rules'

export default function PrerequisitesBanner({
  prerequisites,
}: {
  prerequisites: PrerequisiteStatus[]
}) {
  if (prerequisites.length === 0) return null

  const allMet = prerequisites.every((p) => p.isCompleted)

  return (
    <div
      className={`mt-5 rounded-lg border p-4 text-sm ${
        allMet
          ? 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200'
          : 'border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200'
      }`}
    >
      <p className="font-semibold">
        {allMet ? '✓ Prerequisites completed' : 'Recommended Prerequisites'}
      </p>
      <ul className="mt-2 space-y-1">
        {prerequisites.map((p) => (
          <li key={p.id} className="flex items-center gap-2">
            <span>{p.isCompleted ? '✓' : '○'}</span>
            <Link href={`/courses/${p.slug}`} className="underline">
              {p.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
