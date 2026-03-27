import { testimonials } from '../data/content'

function TestimonialsSection() {
  return (
    <section className="mt-20">
      <div className="text-center">
        <h2 className="text-3xl font-semibold tracking-tight">Learner Voices</h2>
        <p className="mt-2 text-sm text-slate-500">
          Hear from our community about their transformation.
        </p>
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {testimonials.map((testimonial) => (
          <article
            key={testimonial.name}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <p className="mb-3 text-sm text-blue-700">★★★★★</p>
            <p className="text-sm leading-6 text-slate-600">"{testimonial.quote}"</p>
            <div className="mt-4 border-t border-slate-100 pt-3">
              <p className="text-sm font-semibold text-slate-900">{testimonial.name}</p>
              <p className="text-xs text-slate-500">{testimonial.role}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export default TestimonialsSection
