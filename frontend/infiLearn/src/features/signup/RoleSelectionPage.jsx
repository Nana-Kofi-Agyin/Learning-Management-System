import { Link } from 'react-router-dom'
import heroImg from '../../assets/hero.svg'

const roleCards = [
  {
    role: 'Student',
    title: 'Learn as a Student',
    description:
      'Access premium courses, track your progress with interactive analytics, and join a community of lifelong learners focused on cognitive growth.',
    points: ['Personalized Learning Dashboard', 'Exclusive Resource Library', 'Interactive Course Progress'],
    cta: 'Continue as Student',
    to: '/dashboard',
    accent: 'from-blue-700 to-blue-800',
    badge: '🎓',
    imageAlt: 'Student learning setup',
  },
  {
    role: 'Instructor',
    title: 'Teach as an Instructor',
    description:
      'Design immersive educational experiences, manage your student audience, and leverage our advanced studio tools to create high-impact content.',
    points: ['Advanced Course Builder', 'Audience Insight Analytics', 'Revenue & Growth Tools'],
    cta: 'Continue as Instructor',
    to: '/instructor-dashboard',
    accent: 'from-cyan-700 to-sky-800',
    badge: '🧑‍🏫',
    imageAlt: 'Instructor reviewing class materials',
  },
]

function RoleSelectionPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_1px_1px,#d9deec_1px,transparent_0)] bg-[length:16px_16px] bg-slate-50 text-slate-900">
      <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        <header className="mx-auto max-w-3xl text-center">
          <p className="inline-flex items-center rounded-full bg-blue-100 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-blue-800">
            Welcome to InfiLearn
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-blue-900 sm:text-5xl">Choose Your Path</h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600">
            Whether you are here to master new skills or share your expertise with the world, your journey begins with a single choice.
          </p>
        </header>

        <section className="mt-10 grid gap-5 lg:grid-cols-2">
          {roleCards.map((card) => (
            <article key={card.role} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="relative h-44 sm:h-48">
                <img src={heroImg} alt={card.imageAlt} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-slate-950/35"></div>
                <span className="absolute left-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-md border border-white/35 bg-white/20 text-lg text-white backdrop-blur-sm">
                  {card.badge}
                </span>
              </div>

              <div className="space-y-5 p-5 sm:p-6">
                <div>
                  <h2 className="text-3xl font-semibold tracking-tight text-blue-900">{card.title}</h2>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{card.description}</p>
                </div>

                <ul className="space-y-2 text-sm text-slate-700">
                  {card.points.map((point) => (
                    <li key={point} className="flex items-center gap-2">
                      <span className="inline-block h-4 w-4 rounded-full border border-cyan-400 bg-cyan-100"></span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  to={card.to}
                  className={`inline-flex w-full items-center justify-center rounded-lg bg-gradient-to-r px-5 py-3 text-sm font-semibold text-white transition hover:brightness-95 ${card.accent}`}
                >
                  {card.cta}
                </Link>
              </div>
            </article>
          ))}
        </section>

        <footer className="mt-10 flex flex-col gap-2 border-t border-slate-200 pt-6 text-center text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <p>InfiLearn</p>
          <p>© 2026 InfiLearn. All rights reserved.</p>
          <div className="flex items-center justify-center gap-4 sm:justify-end">
            <Link to="/" className="hover:text-slate-700">
              Privacy Policy
            </Link>
            <Link to="/" className="hover:text-slate-700">
              Terms of Service
            </Link>
          </div>
        </footer>
      </main>
    </div>
  )
}

export default RoleSelectionPage