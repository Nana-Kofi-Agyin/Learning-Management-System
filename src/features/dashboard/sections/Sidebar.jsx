import { sideMenu } from '../data/content'

function Sidebar() {
  return (
    <aside className="hidden border-r border-slate-200 bg-slate-50 xl:flex xl:min-h-screen xl:w-64 xl:flex-col">
      <div className="border-b border-slate-200 px-6 py-6">
        <p className="text-lg font-bold text-blue-900">InfiLearn</p>
        <p className="text-xs text-slate-500">Creative Learning</p>
      </div>

      <nav className="flex-1 space-y-1 px-4 py-5">
        {sideMenu.map((item, index) => (
          <button
            key={item}
            className={`flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-medium transition ${
              index === 0
                ? 'bg-blue-100 text-blue-800'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <span className="mr-3 inline-flex h-4 w-4 items-center justify-center rounded bg-current/15 text-[10px]">
              {index + 1}
            </span>
            {item}
          </button>
        ))}
      </nav>

      <div className="px-5 pb-6">
        <button className="mb-5 w-full rounded-xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white shadow hover:bg-blue-800">
          Upgrade Pro
        </button>
        <div className="space-y-2 text-sm text-slate-500">
          <p>Help Center</p>
          <p>Logout</p>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
