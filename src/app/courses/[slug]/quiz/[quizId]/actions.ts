'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { checkAndIssueCertificate } from '@/lib/certificates'

export type SubmitQuizResult = {
  error?: string
  scorePercent?: number
  passed?: boolean
  correctCount?: number
  totalQuestions?: number
}

export async function submitQuizAttempt(params: {
  slug: string
  quizId: string
  selectedAnswers: Record<string, string>
}): Promise<SubmitQuizResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be logged in to submit a quiz.' }
  }

  const { data: quiz } = await supabase
    .from('quizzes')
    .select(
      `
      id,
      course_id,
      passing_score_percent,
      questions (
        id,
        answers (
          id,
          is_correct
        )
      )
    `
    )
    .eq('id', params.quizId)
    .single()

  if (!quiz) {
    return { error: 'Quiz not found.' }
  }

  const questions =
    (quiz.questions as {
      id: string
      answers: { id: string; is_correct: boolean }[]
    }[] | null) ?? []

  if (questions.length === 0) {
    return { error: 'This quiz has no questions.' }
  }

  let correctCount = 0
  for (const q of questions) {
    const chosenAnswerId = params.selectedAnswers[q.id]
    const correctAnswer = (q.answers ?? []).find((a) => a.is_correct)
    if (correctAnswer && chosenAnswerId === correctAnswer.id) {
      correctCount += 1
    }
  }

  const totalQuestions = questions.length
  const scorePercent = Math.round((correctCount / totalQuestions) * 100)
  const passed = scorePercent >= quiz.passing_score_percent

  const { error: insertError } = await supabase.from('quiz_attempts').insert({
    user_id: user.id,
    quiz_id: quiz.id,
    score_percent: scorePercent,
    passed,
    selected_answers: params.selectedAnswers,
  })

  if (insertError) {
    return { error: insertError.message }
  }

  if (passed) {
    await checkAndIssueCertificate(supabase, user.id, quiz.course_id)
  }

  revalidatePath(`/courses/${params.slug}/quiz/${params.quizId}`)
  revalidatePath(`/courses/${params.slug}/learn`)
  revalidatePath('/dashboard')

  return {
    scorePercent,
    passed,
    correctCount,
    totalQuestions,
  }
}
