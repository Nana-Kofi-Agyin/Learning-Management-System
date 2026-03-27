import { stats } from '../data/content'

function StatsSection() {
  return (
    <section className="mt-14 grid grid-cols-2 overflow-hidden rounded-xl border border-slate-200 bg-white md:grid-cols-4">
      {stats.map(([value, label]) => (
        <div
          key={label}
          className="border-slate-200 p-5 text-center odd:border-r md:border-r last:border-r-0"
        >
          <div className="text-2xl font-bold tracking-tight text-slate-900">{value}</div>
          <div className="text-xs text-slate-500">{label}</div>
        </div>
      ))}
    </section>
  )
}

export default StatsSection
