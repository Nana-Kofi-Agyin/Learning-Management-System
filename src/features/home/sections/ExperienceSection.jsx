import { features } from '../data/content'

function ExperienceSection() {
  return (
    <section className="mt-16">
      <div className="text-center">
        <h2 className="text-3xl font-semibold tracking-tight">
          The Cognitive Atelier Experience
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Beyond the standard LMS. We focus on the craft of teaching and the art of learning.
        </p>
      </div>
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {features.map((feature) => (
          <article
            key={feature.title}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-lg font-bold text-blue-700">
              {feature.icon}
            </div>
            <h3 className="mt-4 text-base font-semibold">{feature.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{feature.description}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

export default ExperienceSection
