import { navigationLinks } from '../data/content'
import { Link } from 'react-router-dom'

function Header() {
  const navRouteMap = {
    Courses: '/course-catalog',
    Instructors: '/instructor-dashboard',
    Enterprise: '/dashboard',
    Pricing: '/course-catalog',
  }

  return (
    <header className="mb-10 flex flex-wrap items-center justify-between gap-3">
      <Link to="/" className="text-sm font-semibold tracking-tight">
        InfiLearn
      </Link>
      <nav className="hidden items-center gap-6 text-xs text-slate-600 md:flex">
        {navigationLinks.map((item) => (
          <Link key={item} to={navRouteMap[item] || '/'} className="transition hover:text-slate-900">
            {item}
          </Link>
        ))}
      </nav>
      <div className="flex items-center gap-2 text-xs sm:gap-3">
        <Link to="/dashboard" className="font-medium text-slate-600 transition hover:text-slate-900">
          Login
        </Link>
        <Link
          to="/signup"
          className="rounded-lg bg-blue-700 px-4 py-2 font-semibold text-white shadow-sm transition hover:bg-blue-800"
        >
          Get Started
        </Link>
      </div>

      <nav className="flex w-full flex-wrap gap-2 text-xs text-slate-600 md:hidden">
        {navigationLinks.map((item) => (
          <Link
            key={`mobile-${item}`}
            to={navRouteMap[item] || '/'}
            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 transition hover:text-slate-900"
          >
            {item}
          </Link>
        ))}
      </nav>
    </header>
  )
}

export default Header
