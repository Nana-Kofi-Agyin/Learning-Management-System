export default function CoursesLoading() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8" aria-busy="true">
      <div className="h-7 w-44 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
      <div className="mt-5 h-10 w-full animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <div
            key={n}
            className="h-64 animate-pulse rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
          />
        ))}
      </div>
    </main>
  )
}
