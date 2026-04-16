function CatalogSidebar() {
  const categories = ['All Courses', 'Design', 'Frontend', 'Data', 'Leadership', 'Career Growth']

  return (
    <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white p-5 lg:block">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Categories</h2>
      <nav className="mt-4 space-y-1">
        {categories.map((category, index) => (
          <button
            key={category}
            className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
              index === 0 ? 'bg-blue-50 font-semibold text-blue-800' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            {category}
          </button>
        ))}
      </nav>
    </aside>
  )
}

export default CatalogSidebar
