function HeroSection({ heroImg }) {
  return (
    <section className="grid items-center gap-8 lg:grid-cols-2">
      <div>
        <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-700">
          Transform Your Career
        </span>
        <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
          Empower Your Future with <span className="text-blue-700">InfiLearn</span>
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
          Experience a curated editorial learning journey. Master new skills through personalized pathways designed by industry pioneers in our Cognitive Atelier.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <button className="rounded-lg bg-blue-700 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-blue-700/30 transition hover:-translate-y-0.5 hover:bg-blue-800">
            Explore Courses
          </button>
          <button className="rounded-lg bg-cyan-300 px-5 py-3 text-sm font-semibold text-cyan-900 transition hover:-translate-y-0.5 hover:bg-cyan-200">
            Get Started for Free
          </button>
        </div>
      </div>

      <div className="rounded-2xl bg-gradient-to-br from-slate-950 via-blue-950 to-blue-900 p-4 shadow-2xl shadow-slate-800/30">
        <div className="overflow-hidden rounded-xl border border-blue-400/20">
          <img
            src={heroImg}
            alt="Learning dashboard interface"
            className="h-[340px] w-full object-cover"
          />
        </div>
      </div>
    </section>
  )
}

export default HeroSection
