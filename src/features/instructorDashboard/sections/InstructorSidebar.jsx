import { sideMenu } from '../data/content'

function InstructorSidebar() {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-slate-50 xl:flex xl:min-h-screen xl:flex-col">
      <div className="border-b border-slate-200 px-6 py-6">
        <p className="text-lg font-bold text-blue-900">InfiLearn</p>
        <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Creative Learning</p>
      </div>

      <nav className="flex-1 space-y-1 px-4 py-5">
        {sideMenu.map((item, index) => (
          <button
            key={item}
            className={`flex w-full items-center rounded-lg px-3 py-2.5 text-sm transition ${
              index === 0
                ? 'bg-blue-100 font-semibold text-blue-800'
                : 'font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <span className="mr-3 inline-flex h-4 w-4 items-center justify-center rounded bg-current/15 text-[10px]">
              {index + 1}
            </span>
            {item}
          </button>
        ))}
      </nav>

      <div className="px-4 pb-6">
        <div className="rounded-xl bg-blue-100 p-4">
          <p className="text-xs font-semibold text-blue-900">Upgrade Pro</p>
          <p className="mt-1 text-[11px] leading-5 text-slate-600">
            Unlock advanced analytics and unlimited course hosting.
          </p>
          <button className="mt-3 w-full rounded-lg bg-blue-800 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-900">
            Upgrade Now
          </button>
        </div>

        <div className="mt-4 space-y-2 text-sm text-slate-500">
          <p>Help Center</p>
          <p>Logout</p>
        </div>
      </div>
    </aside>
  )
}

export default InstructorSidebar
