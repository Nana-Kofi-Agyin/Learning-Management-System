import { navLinks } from '../data/content'
import { Link } from 'react-router-dom'

function CatalogTopbar() {
  return (
    <header className="border-b border-slate-200 bg-slate-50 px-4 py-3 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-3 sm:gap-4">
        <div className="flex min-w-0 items-center gap-4 sm:gap-8">
          <p className="text-xl font-bold tracking-tight text-blue-900 sm:text-3xl">InfiLearn</p>
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

        <div className="flex min-w-0 flex-1 items-center justify-end gap-3">
          <div className="hidden flex-1 items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-400 md:flex md:min-w-40 md:max-w-xs lg:min-w-64 lg:max-w-sm">
            Search courses...
          </div>
          <button className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-xs font-semibold text-slate-600">
            N
          </button>
          <button className="hidden h-9 w-9 items-center justify-center rounded-full border border-blue-300 bg-blue-50 text-xs font-semibold text-blue-700 sm:inline-flex">
            A
          </button>
        </div>

        <nav className="flex w-full items-center gap-2 overflow-x-auto pb-1 text-xs text-slate-600 md:hidden">
          {navLinks.map((item, index) => (
            <Link
              key={`mobile-${item}`}
              to={item === 'My Courses' ? '/course-player' : item === 'Library' ? '/course-catalog' : '/dashboard'}
              className={
                index === 1
                  ? 'rounded-full bg-blue-100 px-3 py-1.5 font-semibold text-blue-800'
                  : 'rounded-full border border-slate-200 bg-white px-3 py-1.5'
              }
            >
              {item}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}

export default CatalogTopbar
