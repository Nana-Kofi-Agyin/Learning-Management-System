import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

type UnsubscribePageProps = {
  params: Promise<{ token: string }>
}

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export default async function UnsubscribePage({ params }: UnsubscribePageProps) {
  const { token } = await params
  let success = false

  if (UUID_REGEX.test(token)) {
    const supabase = await createClient()
    const { data } = await supabase.rpc('unsubscribe_by_token', { p_token: token })
    success = Boolean(data)
  }

  return (
    <main className="mx-auto max-w-md px-4 py-14 text-center">
      <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {success ? (
          <>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              You&apos;ve been unsubscribed
            </h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              You will no longer receive welcome, reminder, or completion emails
              from us. You can still log in and learn anytime.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Invalid Unsubscribe Link
            </h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              This unsubscribe link is invalid or has expired.
            </p>
          </>
        )}

        <Link
          href="/"
          className="mt-6 inline-block rounded-lg bg-slate-900 px-5 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900"
        >
          Back to Home
        </Link>
      </div>
    </main>
  )
}
