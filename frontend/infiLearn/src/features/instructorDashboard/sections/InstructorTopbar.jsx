import { Link } from 'react-router-dom'

function InstructorTopbar() {
  return (
    <header className="border-b border-slate-200 bg-slate-50 px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 sm:gap-4">
        <Link to="/" className="text-2xl font-bold tracking-tight text-blue-900">
          InfiLearn
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-slate-600 md:flex">
          <Link to="/instructor-dashboard" className="font-semibold text-blue-800">
            My Courses
          </Link>
          <Link to="/course-catalog" className="hover:text-slate-900">
            Library
          </Link>
          <Link to="/course-player" className="hover:text-slate-900">
            Resources
          </Link>
        </nav>

        <div className="flex min-w-0 flex-1 items-center justify-end gap-3">
          <div className="hidden flex-1 items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-400 md:flex md:min-w-40 md:max-w-xs lg:min-w-64 lg:max-w-sm">
            Search analytics...
          </div>
          <button className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-xs font-semibold text-slate-600">
            N
          </button>
          <button className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-blue-300 bg-blue-50 text-xs font-semibold text-blue-700">
            JR
          </button>
        </div>
      </div>
    </header>
  )
}

export default InstructorTopbar
