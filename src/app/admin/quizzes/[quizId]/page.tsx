import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requireAdmin } from '@/lib/admin'
import { addQuizQuestion, deleteQuizQuestion, updateQuiz } from '../../actions'

type AdminQuizEditorProps = {
  params: Promise<{ quizId: string }>
}

type AnswerRow = {
  id: string
  answer_text: string
  is_correct: boolean
  position: number
}

type QuestionRow = {
  id: string
  question_text: string
  explanation: string | null
  position: number
  answers: AnswerRow[]
}

export default async function AdminQuizEditorPage({ params }: AdminQuizEditorProps) {
  const { quizId } = await params
  const { supabase } = await requireAdmin()

  const { data: quiz } = await supabase
    .from('quizzes')
    .select(
      `
      id,
      course_id,
      title,
      description,
      passing_score_percent,
      questions (
        id,
        question_text,
        explanation,
        position,
        answers (
          id,
          answer_text,
          is_correct,
          position
        )
      )
    `
    )
    .eq('id', quizId)
    .single()

  if (!quiz) {
    notFound()
  }

  const questions: QuestionRow[] = ((quiz.questions as QuestionRow[] | null) ?? [])
    .slice()
    .sort((a, b) => a.position - b.position)
    .map((q) => ({
      ...q,
      answers: (q.answers ?? []).slice().sort((a, b) => a.position - b.position),
    }))

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <Link
        href={`/admin/courses/${quiz.course_id}`}
        className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400"
      >
        ← Back to Course Editor
      </Link>

      <section className="mt-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
          Edit Quiz
        </h1>
        <form action={updateQuiz} className="mt-4 space-y-3">
          <input type="hidden" name="quizId" value={quiz.id} />

          <div className="grid gap-3 sm:grid-cols-[1fr_140px]">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                Quiz Title *
              </label>
              <input
                name="title"
                required
                defaultValue={quiz.title}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                Passing Score (%)
              </label>
              <input
                name="passing_score_percent"
                type="number"
                min={0}
                max={100}
                defaultValue={quiz.passing_score_percent}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              Description (optional)
            </label>
            <input
              name="description"
              defaultValue={quiz.description ?? ''}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
            />
          </div>

          <button
            type="submit"
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900"
          >
            Save Quiz Settings
          </button>
        </form>
      </section>

      <section className="mt-8 space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          Questions ({questions.length})
        </h2>

        {questions.map((q, idx) => (
          <div
            key={q.id}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                {idx + 1}. {q.question_text}
              </p>
              <form action={deleteQuizQuestion}>
                <input type="hidden" name="quizId" value={quiz.id} />
                <input type="hidden" name="questionId" value={q.id} />
                <button
                  type="submit"
                  className="rounded border border-red-200 px-2.5 py-1 text-xs font-medium text-red-700 hover:bg-red-50 dark:border-red-900 dark:text-red-400"
                >
                  Delete
                </button>
              </form>
            </div>

            <ul className="mt-3 space-y-1 text-sm">
              {q.answers.map((ans) => (
                <li
                  key={ans.id}
                  className={
                    ans.is_correct
                      ? 'font-medium text-emerald-700 dark:text-emerald-400'
                      : 'text-slate-600 dark:text-slate-400'
                  }
                >
                  {ans.is_correct ? '✓ ' : '○ '}
                  {ans.answer_text}
                </li>
              ))}
            </ul>

            {q.explanation && (
              <p className="mt-3 rounded bg-slate-50 p-2.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                <strong>Explanation:</strong> {q.explanation}
              </p>
            )}
          </div>
        ))}
      </section>

      <section className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          Add New Question
        </h2>
        <form action={addQuizQuestion} className="mt-4 space-y-4">
          <input type="hidden" name="quizId" value={quiz.id} />
          <input type="hidden" name="position" value={questions.length + 1} />

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              Question Text *
            </label>
            <input
              name="question_text"
              required
              placeholder="e.g. Which CSS property controls text size?"
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
            />
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Answer Choices (select the radio button next to the correct answer)
            </p>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="correct_index"
                  value={i}
                  defaultChecked={i === 0}
                  className="h-4 w-4"
                  aria-label={`Mark option ${i + 1} as correct`}
                />
                <input
                  name={`option_${i}`}
                  required={i < 2}
                  placeholder={`Option ${i + 1}${i < 2 ? ' *' : ' (optional)'}`}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-800"
                />
              </div>
            ))}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              Explanation (shown after learner answers)
            </label>
            <textarea
              name="explanation"
              rows={2}
              placeholder="Explain why the correct answer is right..."
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
            />
          </div>

          <button
            type="submit"
            className="rounded-lg bg-slate-900 px-5 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900"
          >
            Add Question
          </button>
        </form>
      </section>
    </main>
  )
}
