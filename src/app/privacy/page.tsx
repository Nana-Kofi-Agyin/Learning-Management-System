import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How we collect, use, and protect your data.',
}

export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <article className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 text-sm leading-relaxed text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 sm:p-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Privacy Policy
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Last updated: [Month Day, Year]
          </p>
        </div>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            1. Information We Collect
          </h2>
          <p>
            When you create a free account on <strong>[Your Platform Name]</strong>,
            we collect your name, email address, and learning activity (course
            enrollments, completed lessons, quiz scores, certificates, and
            discussion posts).
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            2. How We Use Your Information
          </h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>Save your course progress, quiz attempts, and certificates.</li>
            <li>
              Display your name on certificates and public verification pages
              when someone checks your unique certificate code.
            </li>
            <li>
              Send optional welcome, course completion, and inactivity reminder
              emails (you can unsubscribe with one click at any time).
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            3. Third-Party Services
          </h2>
          <ul className="list-disc space-y-1 pl-5">
            <li><strong>Supabase</strong> (authentication and Postgres database).</li>
            <li><strong>Vercel</strong> (website hosting).</li>
            <li><strong>YouTube (youtube-nocookie.com)</strong> for embedded video lessons.</li>
            <li><strong>Resend</strong> for transactional and reminder emails.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            4. Your Rights &amp; Data Deletion
          </h2>
          <p>
            We never sell your data. You can unsubscribe from emails at any time
            or request account deletion by emailing{' '}
            <strong>[your-email@example.com]</strong>.
          </p>
        </section>
      </article>
    </main>
  )
}
