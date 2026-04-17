function CatalogSidebar() {
  const categories = ['All Courses', 'Design', 'Frontend', 'Data', 'Leadership', 'Career Growth']

  return (
    <aside className="w-full border-b border-slate-200 bg-white p-4 lg:w-64 lg:shrink-0 lg:border-b-0 lg:border-r lg:p-5">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Categories</h2>
      <nav className="mt-4 flex gap-2 overflow-x-auto pb-1 lg:block lg:space-y-1">
        {categories.map((category, index) => (
          <button
            key={category}
            className={`whitespace-nowrap rounded-lg px-3 py-2 text-left text-sm transition lg:w-full ${
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
