import { engagementBars, overviewCards, recentCourses } from '../data/content'
import { Link } from 'react-router-dom'

function InstructorMain({ heroImg }) {
  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <section className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">Instructor Dashboard</h1>
          <p className="mt-2 max-w-2xl text-slate-600">
            Welcome back, Dr. Julian. Your students have been particularly active this week.
          </p>
        </div>
        <button className="rounded-lg bg-blue-700 px-5 py-3 text-sm font-semibold text-white shadow hover:bg-blue-800">
          + Create New Course
        </button>
      </section>

      <section className="grid gap-4 lg:grid-cols-12">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">{overviewCards[0].title}</p>
          <p className="mt-1 text-5xl font-bold tracking-tight text-slate-900">{overviewCards[0].value}</p>
          <p className="mt-2 inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
            +12.4% vs last month
          </p>
          <div className="mt-6 flex items-end gap-2">
            {[20, 28, 24, 36, 44, 32, 38].map((height, index) => (
              <div
                key={`rev-${index}`}
                className={`w-10 rounded-sm ${index === 4 ? 'bg-blue-700' : 'bg-slate-200'}`}
                style={{ height: `${height}px` }}
              ></div>
            ))}
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{overviewCards[1].title}</p>
          <p className="mt-3 text-5xl font-bold tracking-tight text-slate-900">{overviewCards[1].value}</p>
          <p className="mt-6 text-xs text-slate-500">{overviewCards[1].subText}</p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{overviewCards[2].title}</p>
          <p className="mt-3 text-5xl font-bold tracking-tight text-slate-900">{overviewCards[2].value}</p>
          <div className="mt-8 h-2 rounded-full bg-slate-200">
            <div className="h-full w-[86%] rounded-full bg-cyan-500"></div>
          </div>
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-12">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-8">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-semibold text-slate-900">Student Engagement</h2>
              <p className="text-sm text-slate-500">Daily active minutes per user</p>
            </div>
            <button className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
              Last 7 Days
            </button>
          </div>

          <div className="mt-6 flex items-end justify-between gap-3">
            {engagementBars.map((bar) => (
              <div key={bar.day} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className={`w-full rounded-md ${bar.active ? 'border border-blue-400 bg-blue-100' : 'bg-slate-200'} ${bar.height}`}
                ></div>
                <span className={`text-xs ${bar.active ? 'font-semibold text-blue-900' : 'text-slate-500'}`}>
                  {bar.day}
                </span>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-4">
          <h2 className="text-2xl font-semibold text-slate-900">Recent Courses</h2>
          <div className="mt-4 space-y-4">
            {recentCourses.map((course) => (
              <div key={course.title} className="flex items-center gap-3 rounded-xl border border-slate-200 p-3">
                <img src={heroImg} alt={course.title} className="h-14 w-14 rounded-lg object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">{course.title}</p>
                  <p className="text-xs text-slate-500">Published {course.published}</p>
                  <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-500">
                    <span className="rounded bg-blue-50 px-1.5 py-0.5 text-blue-700">{course.tag}</span>
                    <span>{course.students}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Link to="/course-catalog" className="mt-5 inline-block text-sm font-semibold text-blue-700">
            View All Courses
          </Link>
        </article>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-slate-100 p-6">
        <p className="inline-block rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-700">
          Action Required
        </p>
        <h2 className="mt-3 text-4xl font-bold tracking-tight text-slate-900">Pending Course Reviews</h2>
        <p className="mt-2 max-w-3xl text-slate-600">
          You have 12 new assignments to grade and 4 students waiting for feedback on the Python for Finance module.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/course-player"
            className="rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Go to Assessments
          </Link>
          <button className="rounded-lg bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            Dismiss Notice
          </button>
        </div>
      </section>
    </main>
  )
}

export default InstructorMain
