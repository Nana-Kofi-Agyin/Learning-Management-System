import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import ThemeToggle from '@/components/ThemeToggle'

export default async function Navbar() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  let user: { id: string; email?: string } | null = null
  let profile: { full_name: string | null; role: string } | null = null

  if (supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http')) {
    const supabase = await createClient()
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser()
    user = authUser

    if (user) {
      const { data } = await supabase
        .from('profiles')
        .select('full_name, role')
        .eq('id', user.id)
        .single()
      profile = data
    }
  }

  return (
    <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <nav
        aria-label="Main navigation"
        className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3"
      >
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="py-1.5 text-lg font-bold tracking-tight text-slate-900 dark:text-white"
          >
            MOOC Platform
          </Link>
          <Link
            href="/courses"
            className="rounded-md px-2 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
          >
            Courses
          </Link>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm sm:gap-3">
          <ThemeToggle />

          {user ? (
            <>
              <Link
                href="/dashboard"
                className="rounded-md px-2 py-2 font-medium text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
              >
                Dashboard
              </Link>

              {profile?.role === 'admin' && (
                <Link
                  href="/admin"
                  className="rounded-md bg-amber-100 px-3 py-2 font-medium text-amber-900 hover:bg-amber-200 dark:bg-amber-900/40 dark:text-amber-200"
                >
                  Admin
                </Link>
              )}

              <span className="hidden text-slate-500 dark:text-slate-400 sm:inline">
                {profile?.full_name || user.email}
              </span>

              <form action="/auth/signout" method="post">
                <button
                  type="submit"
                  className="min-h-[40px] rounded-lg border border-slate-300 px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  Log Out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-md px-3 py-2 font-medium text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                className="flex min-h-[40px] items-center rounded-lg bg-slate-900 px-3.5 py-2 font-medium text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}
