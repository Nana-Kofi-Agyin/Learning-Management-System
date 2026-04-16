import Topbar from './sections/Topbar'

const stats = [
  { label: 'Courses in Progress', value: '4' },
  { label: 'Certificates Earned', value: '12' },
  { label: 'Learning Streak', value: '18 days' },
]

function DashboardPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Topbar />
      <main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-bold tracking-tight">Learner Dashboard</h1>
          <p className="mt-2 text-slate-600">Track your progress, resume lessons, and plan your next milestones.</p>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          {stats.map((item) => (
            <article key={item.label} className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-sm text-slate-500">{item.label}</p>
              <p className="mt-3 text-3xl font-bold text-blue-900">{item.value}</p>
            </article>
          ))}
        </section>
      </main>
    </div>
  )
}

export default DashboardPage
