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
    <header className="mb-10 flex items-center justify-between">
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
      <div className="flex items-center gap-3 text-xs">
        <Link to="/dashboard" className="font-medium text-slate-600 transition hover:text-slate-900">
          Login
        </Link>
        <Link
          to="/course-catalog"
          className="rounded-lg bg-blue-700 px-4 py-2 font-semibold text-white shadow-sm transition hover:bg-blue-800"
        >
          Get Started
        </Link>
      </div>
    </header>
  )
}

export default Header
