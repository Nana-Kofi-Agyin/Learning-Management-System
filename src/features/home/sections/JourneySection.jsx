import { journeySteps } from '../data/content'

function JourneySection({ heroImg }) {
  return (
    <section className="mt-20 grid items-center gap-8 lg:grid-cols-2">
      <div>
        <h2 className="text-4xl font-bold leading-tight tracking-tight">
          Your path to mastery is simple
        </h2>
        <ol className="mt-7 space-y-6">
          {journeySteps.map((step, index) => (
            <li key={step.title} className="flex gap-4">
              <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-700 text-xs font-bold text-white">
                {index + 1}
              </span>
              <div>
                <h3 className="text-base font-semibold">{step.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="relative rounded-2xl border border-slate-200 bg-white p-5 shadow-lg">
        <img src={heroImg} alt="Learner dashboard" className="h-64 w-full rounded-xl object-cover" />
        <div className="mt-4 space-y-2">
          <div className="h-2.5 w-1/2 rounded-full bg-slate-200"></div>
          <div className="h-2.5 w-3/4 rounded-full bg-slate-200"></div>
          <div className="h-2.5 w-2/3 rounded-full bg-slate-200"></div>
        </div>
        <blockquote className="absolute -bottom-5 right-4 max-w-[220px] rounded-xl bg-cyan-900 p-4 text-xs font-medium leading-relaxed text-cyan-50 shadow-xl">
          "The best investment I made this year was learning platform I've ever used."
        </blockquote>
      </div>
    </section>
  )
}

export default JourneySection
