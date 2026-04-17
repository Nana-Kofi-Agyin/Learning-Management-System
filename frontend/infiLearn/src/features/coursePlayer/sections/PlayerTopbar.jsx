import { Link } from 'react-router-dom'

function PlayerTopbar() {
  return (
    <header className="border-b border-slate-200 bg-slate-50 px-4 py-3 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-[1400px] flex-wrap items-center justify-between gap-3 sm:gap-4">
        <div className="flex min-w-0 items-center gap-4 sm:gap-8">
          <Link to="/" className="text-xl font-bold tracking-tight text-blue-900 sm:text-3xl">
            InfiLearn
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-slate-600 md:flex">
            <Link to="/course-player" className="font-semibold text-blue-800 underline underline-offset-4">
              My Courses
            </Link>
            <Link to="/course-catalog" className="hover:text-slate-900">
              Library
            </Link>
            <Link to="/dashboard" className="hover:text-slate-900">
              Resources
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <button className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-xs font-semibold text-slate-600">
            N
          </button>
          <button className="hidden h-9 w-9 items-center justify-center rounded-full border border-blue-300 bg-blue-50 text-xs font-semibold text-blue-700 sm:inline-flex">
            MC
          </button>
        </div>

        <nav className="flex w-full items-center gap-2 overflow-x-auto pb-1 text-xs text-slate-600 md:hidden">
          <Link to="/course-player" className="rounded-full bg-blue-100 px-3 py-1.5 font-semibold text-blue-800">
            My Courses
          </Link>
          <Link to="/course-catalog" className="rounded-full border border-slate-200 bg-white px-3 py-1.5">
            Library
          </Link>
          <Link to="/dashboard" className="rounded-full border border-slate-200 bg-white px-3 py-1.5">
            Resources
          </Link>
        </nav>
      </div>
    </header>
  )
}

export default PlayerTopbar
