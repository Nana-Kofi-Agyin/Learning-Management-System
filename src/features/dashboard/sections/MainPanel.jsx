import { courseProgress, focusCards } from '../data/content'

function MainPanel({ heroImg }) {
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-blue-900">Welcome back, Alex!</h1>
        <p className="mt-1 text-slate-600">
          You've completed 75% of your weekly learning goal. Keep the momentum going!
        </p>
      </div>

      <article className="rounded-2xl bg-blue-800 p-6 text-white shadow-lg shadow-blue-900/20">
        <p className="inline-block rounded-full bg-blue-700 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide">
          Last viewed 2 hours ago
        </p>
        <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="max-w-lg text-3xl font-semibold leading-tight">
              Advanced UI Architecture and Design Systems
            </h2>
            <p className="mt-2 text-sm text-blue-100">
              Module 4: Establishing Design Tokens and Semantic Color Logic
            </p>
            <div className="mt-5 flex items-center gap-4">
              <button className="rounded-lg bg-cyan-300 px-4 py-2 text-sm font-semibold text-cyan-900 transition hover:bg-cyan-200">
                Resume Learning
              </button>
              <span className="text-sm text-blue-200">42 mins remaining</span>
            </div>
          </div>
          <img
            src={heroImg}
            alt="Current lesson preview"
            className="h-28 w-44 rounded-xl border border-blue-300/30 object-cover"
          />
        </div>
      </article>

      <div className="grid gap-4 md:grid-cols-2">
        {focusCards.map((card) => (
          <article key={card.title} className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{card.label}</p>
            <h3 className="mt-1 text-2xl font-semibold text-blue-900">{card.title}</h3>
            <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
              <span>{card.progressLabel}</span>
              <span className="font-semibold text-blue-900">{card.progress}%</span>
            </div>
            <div className="mt-3 h-2 rounded-full bg-slate-200">
              <div className="h-full rounded-full bg-blue-500" style={{ width: `${card.progress}%` }}></div>
            </div>
            <div className="mt-4 flex justify-between text-xs text-slate-500">
              <span>{card.footerLeft}</span>
              <span>{card.footerRight}</span>
            </div>
          </article>
        ))}
      </div>

      <article className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-2xl font-semibold text-blue-900">Enrolled Courses</h3>
          <button className="text-sm font-semibold text-blue-700">View All</button>
        </div>
        <div className="space-y-3">
          {courseProgress.map((course) => (
            <div key={course.title} className="flex items-center gap-4 rounded-xl border border-slate-200 px-4 py-3">
              <img src={heroImg} alt={course.title} className="h-14 w-14 rounded-lg object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-base font-semibold text-slate-900">{course.title}</p>
                <p className="text-sm text-slate-500">
                  Instructor: {course.instructor} • {course.lessons} Lessons
                </p>
              </div>
              <div className="text-right">
                <p className="text-base font-semibold text-blue-800">{course.progress}%</p>
                <p className="text-[11px] uppercase tracking-wider text-slate-400">{course.status}</p>
              </div>
            </div>
          ))}
        </div>
      </article>
    </section>
  )
}

export default MainPanel
