import { resources, takeaways } from '../data/content'

function LessonHeader() {
  return (
    <section className="grid gap-5 xl:grid-cols-[minmax(0,2fr)_300px]">
      <article className="rounded-2xl bg-transparent p-1">
        <h1 className="text-5xl font-bold tracking-tight text-slate-900">High Fidelity Prototyping in Figma</h1>
        <p className="mt-4 text-lg text-slate-600">
          Instructor: Marcus Chen <span className="mx-2 text-slate-400">•</span> Beginner-Intermediate
        </p>
        <p className="mt-5 max-w-4xl text-2xl leading-relaxed text-slate-700">
          In this lesson, we transition from wireframes to high-fidelity interactions. We'll explore the Cognitive Atelier principle using depth, motion, and tonal shifts to create intuitive user journeys without the clutter of traditional UI patterns.
        </p>

        <div className="mt-7 rounded-2xl border border-slate-200 bg-slate-100 p-6">
          <h2 className="text-3xl font-semibold text-slate-900">Key Takeaways</h2>
          <ul className="mt-4 space-y-3 text-lg text-slate-700">
            {takeaways.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="mt-1 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-700 text-xs font-bold text-white">
                  ✓
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </article>

      <aside className="space-y-4">
        {resources.map((resource) => (
          <article key={resource.title} className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-2xl font-semibold text-slate-900">{resource.title}</h3>
              {resource.badge ? (
                <span className="rounded-full bg-cyan-100 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-800">
                  {resource.badge}
                </span>
              ) : null}
            </div>
            <p className="text-sm text-slate-600">{resource.description}</p>
            {resource.title === 'Course Assets' ? (
              <button className="mt-4 w-full rounded-lg bg-blue-100 px-4 py-2.5 text-sm font-semibold text-blue-800 hover:bg-blue-200">
                {resource.action}
              </button>
            ) : (
              <button className="mt-4 text-sm font-semibold text-blue-700 hover:text-blue-800">
                {resource.action}
              </button>
            )}
          </article>
        ))}
      </aside>
    </section>
  )
}

export default LessonHeader
