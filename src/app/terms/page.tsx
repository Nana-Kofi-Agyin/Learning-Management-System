import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Rules and terms for using this free learning platform.',
}

export default function TermsOfServicePage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <article className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 text-sm leading-relaxed text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 sm:p-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Terms of Service
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Last updated: [Month Day, Year]
          </p>
        </div>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            1. Free Access &amp; Accounts
          </h2>
          <p>
            <strong>[Your Platform Name]</strong> provides free, self-paced
            educational courses. You are responsible for keeping your login
            credentials secure and providing an accurate name if you wish to
            receive completion certificates.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            2. Community Conduct
          </h2>
          <p>
            When participating in lesson Q&amp;A discussions, you agree not to
            post spam, harassment, offensive material, or illegal content.
            Admins may remove posts or suspend accounts that violate these rules.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            3. Course Content &amp; Certificates
          </h2>
          <p>
            All course materials are for personal, non-commercial learning.
            Certificates confirm completion of our self-paced course and quizzes
            and do not represent accredited university degrees or professional
            licenses.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            4. Disclaimer
          </h2>
          <p>
            This platform is provided &ldquo;as is&rdquo; without warranties of
            any kind. For questions, contact{' '}
            <strong>[your-email@example.com]</strong>.
          </p>
        </section>
      </article>
    </main>
  )
}
