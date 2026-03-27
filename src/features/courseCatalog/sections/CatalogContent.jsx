import { courses } from '../data/content'
import { Link } from 'react-router-dom'

function CatalogContent({ heroImg }) {
  return (
    <main className="flex-1 p-5 sm:p-6 lg:p-8">
      <section className="overflow-hidden rounded-2xl bg-gradient-to-r from-blue-900 via-blue-800 to-cyan-700 text-white">
        <div className="grid items-stretch md:grid-cols-2">
          <div className="p-6 sm:p-8">
            <p className="inline-block rounded-full bg-cyan-300 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-900">
              Featured Course
            </p>
            <h1 className="mt-4 text-4xl font-bold leading-tight">
              Mastering Generative AI for Digital Product Design
            </h1>
            <p className="mt-3 max-w-lg text-sm text-blue-100">
              Join Professor Elena Vance to explore the intersection of artificial intelligence and creative UI workflows.
            </p>
            <Link
              to="/course-player"
              className="mt-6 inline-block rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-blue-900 hover:bg-slate-100"
            >
              Start Learning
            </Link>
          </div>
          <div className="hidden h-full md:block">
            <img src={heroImg} alt="Featured course" className="h-full w-full object-cover opacity-70" />
          </div>
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="text-4xl font-bold tracking-tight text-slate-900">Available Courses</h2>
            <p className="mt-1 text-sm text-slate-500">Explore our curated library of professional learning tracks.</p>
          </div>
          <div className="hidden items-center gap-2 sm:flex">
            <button className="rounded-lg border border-slate-300 bg-white p-2 text-slate-700">▦</button>
            <button className="rounded-lg border border-slate-300 bg-slate-100 p-2 text-slate-500">☰</button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {courses.map((course) => (
            <Link
              key={course.id}
              to="/course-player"
              className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition hover:border-blue-200 hover:bg-blue-50/20"
            >
              <div className="relative overflow-hidden rounded-xl">
                <img src={heroImg} alt={course.title} className="h-36 w-full object-cover" />
                <span className="absolute left-2 top-2 rounded bg-white px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-700">
                  {course.tag}
                </span>
              </div>

              <h3 className="mt-3 text-xl font-semibold leading-snug text-slate-900">{course.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{course.instructor}</p>

              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-slate-500">★ {course.rating} ({course.learners})</span>
                <span className="text-lg font-bold text-blue-900">{course.price}</span>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 flex items-center justify-center gap-3 text-sm text-slate-600">
          <button className="h-9 w-9 rounded-full border border-slate-300 bg-white">←</button>
          <button className="h-9 w-9 rounded-full bg-blue-800 font-semibold text-white">1</button>
          <button className="h-9 w-9 rounded-full border border-slate-300 bg-white">2</button>
          <button className="h-9 w-9 rounded-full border border-slate-300 bg-white">3</button>
          <button className="h-9 w-9 rounded-full border border-slate-300 bg-white">→</button>
        </div>
      </section>
    </main>
  )
}

export default CatalogContent
