import { lessonGroups } from '../data/content'

function LessonSidebar() {
  return (
    <aside className="hidden w-80 shrink-0 border-r border-slate-200 bg-slate-100 xl:flex xl:min-h-[calc(100vh-65px)] xl:flex-col">
      <div className="border-b border-slate-200 px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Module 4 of 12 - 45% Complete</p>
        <div className="mt-3 h-2 rounded-full bg-blue-100">
          <div className="h-full w-[45%] rounded-full bg-cyan-500"></div>
        </div>
      </div>

      <div className="flex-1 space-y-6 px-4 py-5">
        {lessonGroups.map((group) => (
          <div key={group.title}>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">{group.title}</p>
            <div className="space-y-2">
              {group.items.map((item) => (
                <button
                  key={item.id + item.title}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition ${
                    item.active
                      ? 'border border-blue-200 bg-white font-semibold text-blue-800 shadow-sm'
                      : 'text-slate-700 hover:bg-white'
                  }`}
                >
                  <span className="truncate">
                    {item.id}. {item.title}
                  </span>
                  <span className="ml-3 shrink-0 text-xs text-slate-400">{item.duration}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="px-4 pb-4">
        <div className="rounded-xl bg-blue-100 p-4">
          <p className="text-sm font-semibold text-blue-900">Need help?</p>
          <button className="mt-3 w-full rounded-lg bg-blue-800 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-900">
            Contact Mentor
          </button>
        </div>
      </div>
    </aside>
  )
}

export default LessonSidebar
