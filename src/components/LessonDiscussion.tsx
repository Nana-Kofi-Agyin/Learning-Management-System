import DiscussionPostForm from '@/components/DiscussionPostForm'
import {
  deleteDiscussionPost,
  togglePinPost,
  toggleUpvotePost,
} from '@/app/courses/[slug]/learn/discussion-actions'

export type DiscussionPostItem = {
  id: string
  user_id: string
  parent_id: string | null
  author_name: string
  body: string
  is_pinned: boolean
  created_at: string
  upvoteCount: number
  userHasUpvoted: boolean
}

type LessonDiscussionProps = {
  slug: string
  courseId: string
  lessonId: string
  currentUserId: string
  isAdmin: boolean
  posts: DiscussionPostItem[]
}

export default function LessonDiscussion({
  slug,
  courseId,
  lessonId,
  currentUserId,
  isAdmin,
  posts,
}: LessonDiscussionProps) {
  const questions = posts
    .filter((p) => !p.parent_id)
    .sort((a, b) => {
      if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1
      if (a.upvoteCount !== b.upvoteCount) return b.upvoteCount - a.upvoteCount
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

  const repliesByParent = new Map<string, DiscussionPostItem[]>()
  for (const post of posts) {
    if (!post.parent_id) continue
    const list = repliesByParent.get(post.parent_id) ?? []
    list.push(post)
    repliesByParent.set(post.parent_id, list)
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h3 className="text-lg font-bold text-slate-900 dark:text-white">
        Lesson Q&amp;A ({questions.length})
      </h3>
      <p className="mt-1 text-xs text-slate-500">
        Stuck on something? Ask a question or help fellow learners below.
      </p>

      <div className="mt-4">
        <DiscussionPostForm
          slug={slug}
          courseId={courseId}
          lessonId={lessonId}
        />
      </div>

      {questions.length === 0 ? (
        <p className="mt-6 border-t border-slate-100 pt-5 text-sm text-slate-500 dark:border-slate-800">
          No questions for this lesson yet. Be the first to start a discussion!
        </p>
      ) : (
        <div className="mt-6 space-y-4 border-t border-slate-100 pt-5 dark:border-slate-800">
          {questions.map((q) => {
            const replies = (repliesByParent.get(q.id) ?? []).sort(
              (a, b) =>
                new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            )
            const canDelete = isAdmin || q.user_id === currentUserId

            return (
              <article
                key={q.id}
                className={`rounded-lg border p-4 ${
                  q.is_pinned
                    ? 'border-amber-200 bg-amber-50/40 dark:border-amber-900 dark:bg-amber-950/30'
                    : 'border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-800/40'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex flex-wrap items-center gap-2">
                    {q.is_pinned && (
                      <span className="rounded bg-amber-100 px-2 py-0.5 font-semibold text-amber-900 dark:bg-amber-900/60 dark:text-amber-200">
                        📌 Pinned
                      </span>
                    )}
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {q.author_name}
                    </span>
                    <span className="text-slate-400">
                      {new Date(q.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {isAdmin && (
                      <form action={togglePinPost}>
                        <input type="hidden" name="slug" value={slug} />
                        <input type="hidden" name="postId" value={q.id} />
                        <input
                          type="hidden"
                          name="nextPinned"
                          value={q.is_pinned ? 'false' : 'true'}
                        />
                        <button
                          type="submit"
                          className="font-medium text-amber-800 hover:underline dark:text-amber-300"
                        >
                          {q.is_pinned ? 'Unpin' : 'Pin'}
                        </button>
                      </form>
                    )}

                    {canDelete && (
                      <form action={deleteDiscussionPost}>
                        <input type="hidden" name="slug" value={slug} />
                        <input type="hidden" name="postId" value={q.id} />
                        <button
                          type="submit"
                          className="font-medium text-red-700 hover:underline dark:text-red-400"
                        >
                          Delete
                        </button>
                      </form>
                    )}
                  </div>
                </div>

                <p className="mt-2 whitespace-pre-wrap text-sm text-slate-800 dark:text-slate-200">
                  {q.body}
                </p>

                <div className="mt-3 flex items-center gap-4 text-xs">
                  <form action={toggleUpvotePost}>
                    <input type="hidden" name="slug" value={slug} />
                    <input type="hidden" name="postId" value={q.id} />
                    <input
                      type="hidden"
                      name="alreadyUpvoted"
                      value={q.userHasUpvoted ? 'true' : 'false'}
                    />
                    <button
                      type="submit"
                      className={`rounded-md border px-2.5 py-1 font-medium transition ${
                        q.userHasUpvoted
                          ? 'border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900'
                          : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200'
                      }`}
                    >
                      ▲ {q.upvoteCount}
                    </button>
                  </form>

                  <span className="text-slate-500">
                    {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
                  </span>
                </div>

                {replies.length > 0 && (
                  <div className="mt-4 space-y-2.5 border-l-2 border-slate-200 pl-4 dark:border-slate-700">
                    {replies.map((reply) => {
                      const canDeleteReply =
                        isAdmin || reply.user_id === currentUserId
                      return (
                        <div
                          key={reply.id}
                          className="rounded-lg bg-white p-3 text-sm shadow-xs dark:bg-slate-900"
                        >
                          <div className="flex items-center justify-between gap-2 text-xs">
                            <div>
                              <span className="font-semibold text-slate-900 dark:text-white">
                                {reply.author_name}
                              </span>
                              <span className="ml-2 text-slate-400">
                                {new Date(reply.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <form action={toggleUpvotePost}>
                                <input type="hidden" name="slug" value={slug} />
                                <input type="hidden" name="postId" value={reply.id} />
                                <input
                                  type="hidden"
                                  name="alreadyUpvoted"
                                  value={reply.userHasUpvoted ? 'true' : 'false'}
                                />
                                <button
                                  type="submit"
                                  className={`font-medium ${
                                    reply.userHasUpvoted
                                      ? 'text-slate-900 dark:text-white'
                                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                                  }`}
                                >
                                  ▲ {reply.upvoteCount}
                                </button>
                              </form>
                              {canDeleteReply && (
                                <form action={deleteDiscussionPost}>
                                  <input type="hidden" name="slug" value={slug} />
                                  <input type="hidden" name="postId" value={reply.id} />
                                  <button
                                    type="submit"
                                    className="text-red-700 hover:underline dark:text-red-400"
                                  >
                                    Delete
                                  </button>
                                </form>
                              )}
                            </div>
                          </div>
                          <p className="mt-1.5 whitespace-pre-wrap text-slate-700 dark:text-slate-300">
                            {reply.body}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                )}

                <details className="mt-3">
                  <summary className="cursor-pointer text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                    Reply to this question
                  </summary>
                  <div className="mt-2">
                    <DiscussionPostForm
                      slug={slug}
                      courseId={courseId}
                      lessonId={lessonId}
                      parentId={q.id}
                      placeholder="Write a helpful reply..."
                      buttonLabel="Post Reply"
                    />
                  </div>
                </details>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}
