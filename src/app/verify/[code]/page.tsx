import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

type VerifyPageProps = {
  params: Promise<{ code: string }>
}

type VerifiedCertificate = {
  verification_code: string
  learner_name: string | null
  course_title: string
  issued_at: string
}

export default async function VerifyCertificatePage({ params }: VerifyPageProps) {
  const { code } = await params
  const supabase = await createClient()

  const { data } = await supabase.rpc('verify_certificate', { p_code: code })
  const cert: VerifiedCertificate | null =
    Array.isArray(data) && data.length > 0 ? data[0] : null

  if (!cert) {
    return (
      <main className="mx-auto max-w-xl px-4 py-14 text-center">
        <div className="rounded-xl border border-red-200 bg-white p-8 shadow-sm dark:border-red-900 dark:bg-slate-900">
          <p className="text-xs font-semibold uppercase tracking-wide text-red-700 dark:text-red-400">
            Invalid Certificate
          </p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            Certificate Not Found
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            We could not find an issued certificate matching code{' '}
            <span className="font-mono font-semibold text-slate-900 dark:text-white">
              {code}
            </span>
            .
          </p>
          <Link
            href="/courses"
            className="mt-6 inline-block rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900"
          >
            Browse Courses
          </Link>
        </div>
      </main>
    )
  }

  const formattedDate = new Date(cert.issued_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-3.5 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200">
        <span className="font-semibold">✓ Verified Authentic Certificate</span>
        <span className="font-mono text-xs">{cert.verification_code}</span>
      </div>

      <section className="rounded-xl border-4 border-double border-slate-900 bg-white p-8 text-center shadow-sm dark:border-slate-300 dark:bg-slate-900 sm:p-10">
        <p className="text-xs font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
          MOOC Learning Platform
        </p>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          Certificate of Completion
        </h1>

        <p className="mt-6 text-sm text-slate-500">This certifies that</p>
        <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
          {cert.learner_name || 'Learner'}
        </p>

        <p className="mt-6 text-sm text-slate-500">
          has successfully completed all lessons and assessments for
        </p>
        <p className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">
          {cert.course_title}
        </p>

        <div className="mt-8 border-t border-slate-200 pt-5 text-xs text-slate-500 dark:border-slate-800">
          <p>Issued on {formattedDate}</p>
          <p className="mt-1 font-mono text-slate-700 dark:text-slate-300">
            Verification ID: {cert.verification_code}
          </p>
        </div>
      </section>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <a
          href={`/api/certificates/${cert.verification_code}/pdf`}
          className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900"
        >
          Download PDF Certificate
        </a>
        <Link
          href="/courses"
          className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        >
          Explore Courses
        </Link>
      </div>
    </main>
  )
}
