import { createClient } from '@/lib/supabase/server'
import {
  deleteCourseReview,
  submitCourseReview,
} from '@/app/courses/[slug]/review-actions'

type CourseReviewsProps = {
  courseId: string
  slug: string
  isEnrolled: boolean
  currentUserId: string | null
}

export default async function CourseReviews({
  courseId,
  slug,
  isEnrolled,
  currentUserId,
}: CourseReviewsProps) {
  const supabase = await createClient()

  const { data: reviews } = await supabase
    .from('course_reviews')
    .select('id, user_id, author_name, rating, comment, created_at')
    .eq('course_id', courseId)
    .order('created_at', { ascending: false })
    .limit(30)

  const list = reviews ?? []
  const avgRating =
    list.length > 0
      ? (list.reduce((sum, r) => sum + r.rating, 0) / list.length).toFixed(1)
      : null

  const myReview = currentUserId
    ? list.find((r) => r.user_id === currentUserId)
    : undefined

  return (
    <section className="mt-10">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Learner Reviews
        </h2>
        {avgRating && (
          <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">
            ★ {avgRating} / 5 ({list.length}{' '}
            {list.length === 1 ? 'review' : 'reviews'})
          </p>
        )}
      </div>

      {isEnrolled && (
        <form
          action={submitCourseReview}
          className="mt-4 space-y-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
        >
          <input type="hidden" name="courseId" value={courseId} />
          <input type="hidden" name="slug" value={slug} />

          <div className="flex flex-wrap items-center gap-3">
            <label
              htmlFor="rating"
              className="text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              {myReview ? 'Update your rating:' : 'Rate this course:'}
            </label>
            <select
              id="rating"
              name="rating"
              defaultValue={myReview?.rating ?? 5}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-800"
            >
              <option value="5">★★★★★ (5 - Excellent)</option>
              <option value="4">★★★★☆ (4 - Good)</option>
              <option value="3">★★★☆☆ (3 - Okay)</option>
              <option value="2">★★☆☆☆ (2 - Needs work)</option>
              <option value="1">★☆☆☆☆ (1 - Poor)</option>
            </select>
          </div>

          <textarea
            name="comment"
            rows={2}
            maxLength={1000}
            defaultValue={myReview?.comment ?? ''}
            placeholder="Share what you liked or what could be improved (optional)..."
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
          />

          <button
            type="submit"
            className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-medium text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900"
          >
            {myReview ? 'Update Review' : 'Submit Review'}
          </button>
        </form>
      )}

      {list.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">
          No reviews yet. Enroll and be the first to leave feedback!
        </p>
      ) : (
        <div className="mt-4 space-y-3">
          {list.map((r) => (
            <div
              key={r.id}
              className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {r.author_name}
                  </span>
                  <span className="text-amber-500">
                    {'★'.repeat(r.rating)}
                    {'☆'.repeat(5 - r.rating)}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-slate-400">
                  <span>{new Date(r.created_at).toLocaleDateString()}</span>
                  {currentUserId === r.user_id && (
                    <form action={deleteCourseReview}>
                      <input type="hidden" name="reviewId" value={r.id} />
                      <input type="hidden" name="slug" value={slug} />
                      <button
                        type="submit"
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </form>
                  )}
                </div>
              </div>
              {r.comment && (
                <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">
                  {r.comment}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
