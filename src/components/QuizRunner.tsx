'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  submitQuizAttempt,
  type SubmitQuizResult,
} from '@/app/courses/[slug]/quiz/[quizId]/actions'

export type QuizAnswerOption = {
  id: string
  answer_text: string
  is_correct: boolean
  position: number
}

export type QuizQuestionItem = {
  id: string
  question_text: string
  explanation: string | null
  position: number
  answers: QuizAnswerOption[]
}

type QuizRunnerProps = {
  slug: string
  quizId: string
  passingScorePercent: number
  questions: QuizQuestionItem[]
}

export default function QuizRunner({
  slug,
  quizId,
  passingScorePercent,
  questions,
}: QuizRunnerProps) {
  const router = useRouter()

  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({})
  const [checkedCurrent, setCheckedCurrent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<SubmitQuizResult | null>(null)

  if (questions.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
        No questions have been added to this quiz yet.
      </div>
    )
  }

  const currentQuestion = questions[currentIndex]
  const chosenAnswerId = selectedAnswers[currentQuestion.id] ?? ''
  const correctAnswer = currentQuestion.answers.find((a) => a.is_correct)
  const isCurrentCorrect = Boolean(
    chosenAnswerId && correctAnswer && chosenAnswerId === correctAnswer.id
  )
  const isLastQuestion = currentIndex === questions.length - 1

  function handleSelectOption(answerId: string) {
    if (checkedCurrent) return
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: answerId,
    }))
  }

  function handleCheckAnswer() {
    if (!chosenAnswerId) return
    setCheckedCurrent(true)
  }

  async function handleNextOrFinish() {
    if (!isLastQuestion) {
      setCurrentIndex((i) => i + 1)
      setCheckedCurrent(false)
      return
    }

    setSubmitting(true)
    const res = await submitQuizAttempt({
      slug,
      quizId,
      selectedAnswers,
    })
    setSubmitting(false)
    setResult(res)
    router.refresh()
  }

  function handleRetake() {
    setCurrentIndex(0)
    setSelectedAnswers({})
    setCheckedCurrent(false)
    setResult(null)
  }

  if (result) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {result.error ? (
          <p className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
            {result.error}
          </p>
        ) : (
          <>
            <div
              className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                result.passed
                  ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-300'
              }`}
            >
              {result.passed ? '✓ Passed' : 'Not Passed Yet'}
            </div>

            <h2 className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">
              Your Score: {result.scorePercent}%
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              You answered {result.correctCount} out of {result.totalQuestions}{' '}
              questions correctly. Passing score is {passingScorePercent}%.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleRetake}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                Retake Quiz
              </button>
              <Link
                href={`/courses/${slug}/learn`}
                className="rounded-lg bg-slate-900 px-5 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900"
              >
                Continue Learning →
              </Link>
            </div>
          </>
        )}
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between text-xs font-medium text-slate-500">
        <span>
          Question {currentIndex + 1} of {questions.length}
        </span>
        <span>Passing score: {passingScorePercent}%</span>
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div
          className="h-full bg-slate-900 transition-all dark:bg-white"
          style={{
            width: `${Math.round(((currentIndex + 1) / questions.length) * 100)}%`,
          }}
        />
      </div>

      <h2 className="mt-5 text-lg font-semibold text-slate-900 dark:text-white">
        {currentQuestion.question_text}
      </h2>

      <div className="mt-4 space-y-2.5">
        {currentQuestion.answers.map((answer) => {
          const isSelected = chosenAnswerId === answer.id
          let optionClasses =
            'border-slate-200 bg-white text-slate-800 hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200'

          if (checkedCurrent) {
            if (answer.is_correct) {
              optionClasses =
                'border-emerald-500 bg-emerald-50 text-emerald-900 font-medium dark:bg-emerald-950/60 dark:text-emerald-200'
            } else if (isSelected && !answer.is_correct) {
              optionClasses =
                'border-red-400 bg-red-50 text-red-900 dark:bg-red-950/60 dark:text-red-200'
            } else {
              optionClasses =
                'border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-950'
            }
          } else if (isSelected) {
            optionClasses =
              'border-slate-900 bg-slate-50 text-slate-900 font-medium dark:border-white dark:bg-slate-800 dark:text-white'
          }

          return (
            <button
              key={answer.id}
              type="button"
              disabled={checkedCurrent}
              onClick={() => handleSelectOption(answer.id)}
              className={`flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left text-sm transition ${optionClasses}`}
            >
              <span>{answer.answer_text}</span>
              {checkedCurrent && answer.is_correct && (
                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  ✓ Correct
                </span>
              )}
              {checkedCurrent && isSelected && !answer.is_correct && (
                <span className="text-xs font-semibold text-red-700 dark:text-red-400">
                  ✗ Incorrect
                </span>
              )}
            </button>
          )
        })}
      </div>

      {checkedCurrent && (
        <div
          className={`mt-5 rounded-lg border p-4 text-sm ${
            isCurrentCorrect
              ? 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200'
              : 'border-red-200 bg-red-50 text-red-900 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200'
          }`}
        >
          <p className="font-semibold">
            {isCurrentCorrect ? 'Correct!' : 'Not quite right.'}
          </p>
          {currentQuestion.explanation && (
            <p className="mt-1 opacity-90">{currentQuestion.explanation}</p>
          )}
        </div>
      )}

      <div className="mt-6 flex justify-end">
        {!checkedCurrent ? (
          <button
            type="button"
            disabled={!chosenAnswerId}
            onClick={handleCheckAnswer}
            className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-40 dark:bg-white dark:text-slate-900"
          >
            Check Answer
          </button>
        ) : (
          <button
            type="button"
            disabled={submitting}
            onClick={handleNextOrFinish}
            className="rounded-lg bg-emerald-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-50"
          >
            {submitting
              ? 'Saving Score...'
              : isLastQuestion
                ? 'Finish & Save Score'
                : 'Next Question →'}
          </button>
        )}
      </div>
    </div>
  )
}
