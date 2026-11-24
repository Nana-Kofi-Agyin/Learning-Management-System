export default function GlobalLoading() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10" aria-busy="true" aria-live="polite">
      <div className="h-7 w-48 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
      <div className="mt-3 h-4 w-72 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className="h-56 animate-pulse rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
          />
        ))}
      </div>
    </main>
  )
}
