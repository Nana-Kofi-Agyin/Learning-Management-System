import { discussion } from '../data/content'

function DiscussionSection() {
  return (
    <section className="mt-10">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-4xl font-bold tracking-tight text-slate-900">Class Discussion</h2>
        <button className="text-sm font-semibold text-blue-700 hover:text-blue-800">Join Conversation</button>
      </div>

      <div className="space-y-4">
        {discussion.map((entry) => (
          <article
            key={entry.author + entry.time}
            className={`rounded-2xl border p-5 ${
              entry.role ? 'border-blue-200 bg-blue-50' : 'border-slate-200 bg-white'
            }`}
          >
            <div className="mb-2 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-cyan-100 text-sm font-semibold text-cyan-800">
                  {entry.author
                    .split(' ')
                    .map((name) => name[0])
                    .join('')
                    .slice(0, 2)}
                </span>
                <div>
                  <p className="text-lg font-semibold text-slate-900">{entry.author}</p>
                  {entry.role ? (
                    <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">{entry.role}</p>
                  ) : null}
                </div>
              </div>
              <span className="text-xs text-slate-400">{entry.time}</span>
            </div>

            <p className="text-lg leading-relaxed text-slate-700">{entry.message}</p>

            {entry.likes !== null ? (
              <div className="mt-3 flex items-center gap-4 text-sm text-slate-500">
                <span>{entry.likes} likes</span>
                <button className="font-medium hover:text-slate-700">Reply</button>
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  )
}

export default DiscussionSection
