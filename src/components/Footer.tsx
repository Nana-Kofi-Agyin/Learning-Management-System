import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-6 text-xs text-slate-500 dark:text-slate-400">
        <p>© {new Date().getFullYear()} MOOC Learning Platform — 100% Free &amp; Self-Paced</p>
        <div className="flex flex-wrap items-center gap-4">
          <Link href="/courses" className="hover:text-slate-900 dark:hover:text-white">
            Courses
          </Link>
          <Link href="/privacy" className="hover:text-slate-900 dark:hover:text-white">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-slate-900 dark:hover:text-white">
            Terms
          </Link>
        </div>
      </div>
    </footer>
  )
}
