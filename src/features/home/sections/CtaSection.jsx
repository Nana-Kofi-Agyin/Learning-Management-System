function CtaSection() {
  return (
    <section className="mt-20 rounded-3xl bg-blue-800 px-6 py-12 text-center text-white shadow-xl shadow-blue-900/25 sm:px-12">
      <h2 className="text-4xl font-bold tracking-tight">Ready to start your craft?</h2>
      <p className="mx-auto mt-3 max-w-2xl text-sm text-blue-100 sm:text-base">
        Join 10,000+ students already mastering their future on InfiLearn.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-blue-800 transition hover:bg-blue-50">
          Join the Community
        </button>
        <button className="rounded-lg border border-blue-300 bg-blue-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-600">
          View All Courses
        </button>
      </div>
    </section>
  )
}

export default CtaSection
