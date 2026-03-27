import { navLinks } from '../data/content'
import { Link } from 'react-router-dom'

function CatalogTopbar() {
  return (
    <header className="border-b border-slate-200 bg-slate-50 px-4 py-3 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <p className="text-3xl font-bold tracking-tight text-blue-900">InfiLearn</p>
          <nav className="hidden items-center gap-6 text-sm text-slate-600 md:flex">
            {navLinks.map((item, index) => (
              <Link
                key={item}
                to={item === 'My Courses' ? '/course-player' : item === 'Library' ? '/course-catalog' : '/dashboard'}
                className={index === 1 ? 'font-semibold text-blue-800 underline underline-offset-4' : 'hover:text-slate-900'}
              >
                {item}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex flex-1 items-center justify-end gap-3">
          <div className="hidden min-w-64 max-w-sm flex-1 items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-400 md:flex">
            Search courses...
          </div>
          <button className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-xs font-semibold text-slate-600">
            N
          </button>
          <button className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-blue-300 bg-blue-50 text-xs font-semibold text-blue-700">
            A
          </button>
        </div>
      </div>
    </header>
  )
}

export default CatalogTopbar
