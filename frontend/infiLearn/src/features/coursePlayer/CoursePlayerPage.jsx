import PlayerTopbar from './sections/PlayerTopbar'

function CoursePlayerPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <PlayerTopbar />
      <main className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
        <section className="grid gap-4 lg:grid-cols-3">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-2">
            <h1 className="text-3xl font-bold tracking-tight">Mastering Generative AI</h1>
            <p className="mt-2 text-slate-600">Lesson 3 of 12: Prompt Architecture for Product Teams</p>
            <div className="mt-6 aspect-video rounded-xl bg-slate-900"></div>
          </article>

          <aside className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-xl font-semibold">Course Outline</h2>
            <ol className="mt-4 space-y-3 text-sm text-slate-600">
              <li>1. Foundations of Generative Models</li>
              <li>2. Interface Patterns for AI Products</li>
              <li className="font-semibold text-blue-800">3. Prompt Architecture for Teams</li>
              <li>4. Evaluating Response Quality</li>
            </ol>
          </aside>
        </section>
      </main>
    </div>
  )
}

export default CoursePlayerPage
