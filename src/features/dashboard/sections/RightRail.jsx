import { deadlines, stats } from '../data/content'

function RightRail() {
  return (
    <aside className="space-y-5">
      <article className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="text-2xl font-semibold text-blue-900">Upcoming Deadlines</h3>
        <div className="mt-5 space-y-4">
          {deadlines.map((deadline, index) => (
            <div key={deadline.title} className="relative pl-4">
              <span className={`absolute left-0 top-1.5 h-2 w-2 rounded-full ${index === 0 ? 'bg-blue-700' : 'bg-slate-300'}`}></span>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{deadline.day}</p>
              <p className="mt-1 text-sm font-semibold text-slate-800">{deadline.title}</p>
              <p className="text-xs text-slate-500">{deadline.subtitle}</p>
            </div>
          ))}
        </div>
        <button className="mt-5 w-full rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-blue-800 transition hover:bg-slate-200">
          Open Calendar
        </button>
      </article>

      <article className="rounded-2xl bg-slate-900 p-5 text-white">
        <h3 className="text-xl font-semibold">Learning Stats</h3>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-xl bg-slate-800 p-3">
              <p className="text-[11px] uppercase tracking-wider text-slate-300">{stat.label}</p>
              <p className="mt-1 text-2xl font-semibold">{stat.value}</p>
            </div>
          ))}
        </div>
      </article>

      <article className="rounded-2xl border border-dashed border-slate-300 bg-white p-5 text-center">
        <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
          C
        </div>
        <h3 className="mt-4 text-xl font-semibold text-blue-900">Join the Discussion</h3>
        <p className="mt-2 text-sm text-slate-500">
          Connect with 150+ fellow students in the UI Systems workspace.
        </p>
        <button className="mt-4 text-sm font-semibold text-blue-700">Go to Community {'->'}</button>
      </article>
    </aside>
  )
}

export default RightRail
