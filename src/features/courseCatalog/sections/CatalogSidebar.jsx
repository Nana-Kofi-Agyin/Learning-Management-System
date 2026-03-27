import { categories, levels } from '../data/content'

function CatalogSidebar() {
  return (
    <aside className="hidden w-72 shrink-0 border-r border-slate-200 bg-slate-100 lg:block">
      <div className="space-y-8 p-5">
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Categories</h2>
          <div className="space-y-2 text-sm">
            {categories.map((category, index) => (
              <button
                key={category}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition ${
                  index === 0
                    ? 'bg-white font-semibold text-blue-800 shadow-sm'
                    : 'text-slate-600 hover:bg-white hover:text-slate-900'
                }`}
              >
                <span>{category}</span>
                {index === 0 ? <span>›</span> : null}
              </button>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Difficulty</h2>
          <div className="space-y-2">
            {levels.map((level) => (
              <label key={level} className="flex items-center gap-2 text-sm text-slate-600">
                <input type="checkbox" className="h-4 w-4 rounded border-slate-300" />
                {level}
              </label>
            ))}
          </div>
        </section>

        <section className="rounded-xl bg-blue-700 p-4 text-white">
          <h3 className="text-xl font-semibold">Upgrade Pro</h3>
          <p className="mt-2 text-xs text-blue-100">Get unlimited access to 500+ premium certificates.</p>
          <button className="mt-4 w-full rounded-lg bg-cyan-300 px-3 py-2 text-sm font-semibold text-cyan-900 hover:bg-cyan-200">
            Upgrade Now
          </button>
        </section>
      </div>
    </aside>
  )
}

export default CatalogSidebar
