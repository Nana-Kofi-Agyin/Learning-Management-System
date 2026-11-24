'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createDiscussionPost } from '@/app/courses/[slug]/learn/discussion-actions'

type DiscussionPostFormProps = {
  slug: string
  courseId: string
  lessonId: string
  parentId?: string | null
  placeholder?: string
  buttonLabel?: string
}

export default function DiscussionPostForm({
  slug,
  courseId,
  lessonId,
  parentId = null,
  placeholder = 'Ask a question or share a tip about this lesson...',
  buttonLabel = 'Post Question',
}: DiscussionPostFormProps) {
  const router = useRouter()
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    const res = await createDiscussionPost({
      slug,
      courseId,
      lessonId,
      parentId,
      body,
    })

    setSubmitting(false)

    if (res.error) {
      setError(res.error)
      return
    }

    setBody('')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2.5">
      <textarea
        rows={parentId ? 2 : 3}
        required
        minLength={3}
        maxLength={2000}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
      />
      {error && (
        <p className="rounded bg-red-50 px-3 py-2 text-xs text-red-700 dark:bg-red-950/60 dark:text-red-300">
          {error}
        </p>
      )}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={submitting || body.trim().length < 3}
          className="rounded-lg bg-slate-900 px-4 py-1.5 text-xs font-medium text-white hover:bg-slate-800 disabled:opacity-40 dark:bg-white dark:text-slate-900"
        >
          {submitting ? 'Posting...' : buttonLabel}
        </button>
      </div>
    </form>
  )
}
