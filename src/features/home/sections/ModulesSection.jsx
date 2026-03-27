import { moduleCards, primaryModule } from '../data/content'
import { Link } from 'react-router-dom'

function ModulesSection({ heroImg }) {
  return (
    <section className="mt-16">
      <div className="mb-5 flex items-end justify-between">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight">Popular Modules</h2>
          <p className="mt-1 text-sm text-slate-500">
            Hand-picked courses to accelerate your growth.
          </p>
        </div>
        <Link to="/course-catalog" className="text-sm font-semibold text-blue-700 hover:text-blue-800">
          View All Courses →
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white lg:col-span-2">
          <img src={heroImg} alt="UI design module" className="h-56 w-full object-cover" />
          <div className="p-5">
            <h3 className="text-xl font-semibold">{primaryModule.title}</h3>
            <p className="mt-1 text-sm text-slate-600">{primaryModule.description}</p>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-lg font-bold">{primaryModule.price}</span>
              <Link
                to="/course-player"
                className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800"
              >
                Enroll Now
              </Link>
            </div>
          </div>
        </article>

        <div className="space-y-4">
          {moduleCards.map((module) => (
            <article
              key={module.title}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
            >
              <img src={heroImg} alt={module.title} className="h-28 w-full object-cover" />
              <div className="flex items-center justify-between p-4">
                <div>
                  <h3 className="text-sm font-semibold">{module.title}</h3>
                  <p className="text-xs text-slate-500">{module.price}</p>
                </div>
                <Link to="/course-player" className="text-xs font-semibold text-blue-700 hover:text-blue-800">
                  View Details
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ModulesSection
