import { Link } from 'react-router-dom'

function PlayerTopbar() {
  return (
    <header className="border-b border-slate-200 bg-slate-50 px-4 py-3 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-[1400px] flex-wrap items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-4 sm:gap-8">
          <Link to="/" className="text-2xl font-bold tracking-tight text-blue-900 sm:text-3xl">
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
          <button className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-blue-300 bg-blue-50 text-xs font-semibold text-blue-700">
            MC
          </button>
        </div>
      </div>
    </header>
  )
}

export default PlayerTopbar
