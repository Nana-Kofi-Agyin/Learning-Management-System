function PlayerTopbar() {
  return (
    <header className="border-b border-slate-200 bg-slate-50 px-4 py-3 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <p className="text-3xl font-bold tracking-tight text-blue-900">InfiLearn</p>
          <nav className="hidden items-center gap-6 text-sm text-slate-600 md:flex">
            <a href="#" className="font-semibold text-blue-800 underline underline-offset-4">
              My Courses
            </a>
            <a href="#" className="hover:text-slate-900">
              Library
            </a>
            <a href="#" className="hover:text-slate-900">
              Resources
            </a>
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
