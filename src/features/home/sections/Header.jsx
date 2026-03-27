import { navigationLinks } from '../data/content'

function Header() {
  return (
    <header className="mb-10 flex items-center justify-between">
      <div className="text-sm font-semibold tracking-tight">InfiLearn</div>
      <nav className="hidden items-center gap-6 text-xs text-slate-600 md:flex">
        {navigationLinks.map((item) => (
          <a key={item} href="#" className="transition hover:text-slate-900">
            {item}
          </a>
        ))}
      </nav>
      <div className="flex items-center gap-3 text-xs">
        <button className="font-medium text-slate-600 transition hover:text-slate-900">
          Login
        </button>
        <button className="rounded-lg bg-blue-700 px-4 py-2 font-semibold text-white shadow-sm transition hover:bg-blue-800">
          Get Started
        </button>
      </div>
    </header>
  )
}

export default Header
