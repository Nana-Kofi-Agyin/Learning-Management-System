'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/admin'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export async function createCourse(formData: FormData) {
  const { supabase, user } = await requireAdmin()

  const title = String(formData.get('title') ?? '').trim()
  const rawSlug = String(formData.get('slug') ?? '').trim()
  const slug = slugify(rawSlug || title)
  const category = String(formData.get('category') ?? 'General').trim() || 'General'
  const level = String(formData.get('level') ?? 'beginner')
  const instructorName =
    String(formData.get('instructor_name') ?? 'MOOC Team').trim() || 'MOOC Team'
  const description = String(formData.get('description') ?? '').trim()
  const requireQuizGate = formData.get('require_quiz_to_unlock_next_module') === 'on'

  if (!title || !slug) return

  const { data, error } = await supabase
    .from('courses')
    .insert({
      title,
      slug,
      category,
      level,
      instructor_name: instructorName,
      description: description || null,
      require_quiz_to_unlock_next_module: requireQuizGate,
      is_published: false,
      created_by: user.id,
    })
    .select('id')
    .single()

  revalidatePath('/admin')
  revalidatePath('/courses')
  revalidatePath('/')

  if (!error && data) {
    redirect(`/admin/courses/${data.id}`)
  }
}

export async function updateCourse(formData: FormData) {
  const { supabase } = await requireAdmin()

  const courseId = String(formData.get('courseId') ?? '')
  const title = String(formData.get('title') ?? '').trim()
  const slug = slugify(String(formData.get('slug') ?? '') || title)
  const category = String(formData.get('category') ?? 'General').trim() || 'General'
  const level = String(formData.get('level') ?? 'beginner')
  const instructorName =
    String(formData.get('instructor_name') ?? 'MOOC Team').trim() || 'MOOC Team'
  const description = String(formData.get('description') ?? '').trim()
  const thumbnailUrl = String(formData.get('thumbnail_url') ?? '').trim()
  const isPublished = formData.get('is_published') === 'on'
  const requireQuizGate = formData.get('require_quiz_to_unlock_next_module') === 'on'

  if (!courseId || !title || !slug) return

  await supabase
    .from('courses')
    .update({
      title,
      slug,
      category,
      level,
      instructor_name: instructorName,
      description: description || null,
      thumbnail_url: thumbnailUrl.startsWith('https://') ? thumbnailUrl : null,
      is_published: isPublished,
      require_quiz_to_unlock_next_module: requireQuizGate,
    })
    .eq('id', courseId)

  revalidatePath('/admin')
  revalidatePath(`/admin/courses/${courseId}`)
  revalidatePath('/courses')
  revalidatePath(`/courses/${slug}`)
  revalidatePath('/')
}

export async function togglePublishCourse(formData: FormData) {
  const { supabase } = await requireAdmin()
  const courseId = String(formData.get('courseId') ?? '')
  const nextPublished = formData.get('nextPublished') === 'true'
  if (!courseId) return

  await supabase
    .from('courses')
    .update({ is_published: nextPublished })
    .eq('id', courseId)

  revalidatePath('/admin')
  revalidatePath('/courses')
  revalidatePath('/')
}

export async function deleteCourse(formData: FormData) {
  const { supabase } = await requireAdmin()
  const courseId = String(formData.get('courseId') ?? '')
  if (!courseId) return

  await supabase.from('courses').delete().eq('id', courseId)
  revalidatePath('/admin')
  revalidatePath('/courses')
  revalidatePath('/')
  redirect('/admin')
}

export async function createModule(formData: FormData) {
  const { supabase } = await requireAdmin()
  const courseId = String(formData.get('courseId') ?? '')
  const title = String(formData.get('title') ?? '').trim()
  const description = String(formData.get('description') ?? '').trim()
  const position = Number.parseInt(String(formData.get('position') ?? '1'), 10) || 1
  const unlockAfterDays = Math.max(
    0,
    Number.parseInt(String(formData.get('unlock_after_days') ?? '0'), 10) || 0
  )

  if (!courseId || !title) return

  await supabase.from('modules').insert({
    course_id: courseId,
    title,
    description: description || null,
    position,
    unlock_after_days: unlockAfterDays,
  })

  revalidatePath(`/admin/courses/${courseId}`)
}

export async function deleteModule(formData: FormData) {
  const { supabase } = await requireAdmin()
  const courseId = String(formData.get('courseId') ?? '')
  const moduleId = String(formData.get('moduleId') ?? '')
  if (!moduleId) return

  await supabase.from('modules').delete().eq('id', moduleId)
  revalidatePath(`/admin/courses/${courseId}`)
}

export async function createLesson(formData: FormData) {
  const { supabase } = await requireAdmin()
  const courseId = String(formData.get('courseId') ?? '')
  const moduleId = String(formData.get('moduleId') ?? '')
  const title = String(formData.get('title') ?? '').trim()
  const youtubeUrl = String(formData.get('youtube_url') ?? '').trim()
  const textContent = String(formData.get('text_content') ?? '').trim()
  const durationMinutes =
    Number.parseInt(String(formData.get('duration_minutes') ?? '5'), 10) || 0
  const position = Number.parseInt(String(formData.get('position') ?? '1'), 10) || 1

  if (!moduleId || !title) return

  await supabase.from('lessons').insert({
    module_id: moduleId,
    title,
    youtube_url: youtubeUrl || null,
    text_content: textContent || null,
    duration_seconds: Math.max(0, durationMinutes * 60),
    position,
  })

  revalidatePath(`/admin/courses/${courseId}`)
}

export async function updateLesson(formData: FormData) {
  const { supabase } = await requireAdmin()
  const courseId = String(formData.get('courseId') ?? '')
  const lessonId = String(formData.get('lessonId') ?? '')
  const title = String(formData.get('title') ?? '').trim()
  const youtubeUrl = String(formData.get('youtube_url') ?? '').trim()
  const textContent = String(formData.get('text_content') ?? '').trim()
  const durationMinutes =
    Number.parseInt(String(formData.get('duration_minutes') ?? '0'), 10) || 0

  if (!lessonId || !title) return

  await supabase
    .from('lessons')
    .update({
      title,
      youtube_url: youtubeUrl || null,
      text_content: textContent || null,
      duration_seconds: Math.max(0, durationMinutes * 60),
    })
    .eq('id', lessonId)

  revalidatePath(`/admin/courses/${courseId}`)
}

export async function deleteLesson(formData: FormData) {
  const { supabase } = await requireAdmin()
  const courseId = String(formData.get('courseId') ?? '')
  const lessonId = String(formData.get('lessonId') ?? '')
  if (!lessonId) return

  await supabase.from('lessons').delete().eq('id', lessonId)
  revalidatePath(`/admin/courses/${courseId}`)
}

export async function reorderLessons(courseId: string, orderedLessonIds: string[]) {
  const { supabase } = await requireAdmin()

  await Promise.all(
    orderedLessonIds.map((lessonId, index) =>
      supabase.from('lessons').update({ position: index + 1 }).eq('id', lessonId)
    )
  )

  revalidatePath(`/admin/courses/${courseId}`)
}

export async function createQuiz(formData: FormData) {
  const { supabase } = await requireAdmin()
  const courseId = String(formData.get('courseId') ?? '')
  const moduleId = String(formData.get('moduleId') ?? '')
  const title = String(formData.get('title') ?? '').trim()
  const passingScore =
    Number.parseInt(String(formData.get('passing_score_percent') ?? '70'), 10) || 70

  if (!courseId || !moduleId || !title) return

  const { data } = await supabase
    .from('quizzes')
    .insert({
      course_id: courseId,
      module_id: moduleId,
      title,
      passing_score_percent: Math.min(100, Math.max(0, passingScore)),
    })
    .select('id')
    .single()

  revalidatePath(`/admin/courses/${courseId}`)
  if (data) {
    redirect(`/admin/quizzes/${data.id}`)
  }
}

export async function updateQuiz(formData: FormData) {
  const { supabase } = await requireAdmin()
  const quizId = String(formData.get('quizId') ?? '')
  const title = String(formData.get('title') ?? '').trim()
  const description = String(formData.get('description') ?? '').trim()
  const passingScore =
    Number.parseInt(String(formData.get('passing_score_percent') ?? '70'), 10) || 70

  if (!quizId || !title) return

  await supabase
    .from('quizzes')
    .update({
      title,
      description: description || null,
      passing_score_percent: Math.min(100, Math.max(0, passingScore)),
    })
    .eq('id', quizId)

  revalidatePath(`/admin/quizzes/${quizId}`)
}

export async function addQuizQuestion(formData: FormData) {
  const { supabase } = await requireAdmin()
  const quizId = String(formData.get('quizId') ?? '')
  const questionText = String(formData.get('question_text') ?? '').trim()
  const explanation = String(formData.get('explanation') ?? '').trim()
  const position = Number.parseInt(String(formData.get('position') ?? '1'), 10) || 1
  const correctIndex = Number.parseInt(String(formData.get('correct_index') ?? '0'), 10)

  const optionTexts = [0, 1, 2, 3].map((i) =>
    String(formData.get(`option_${i}`) ?? '').trim()
  )

  if (!quizId || !questionText) return

  const validOptions = optionTexts
    .map((text, idx) => ({ text, isCorrect: idx === correctIndex }))
    .filter((o) => o.text.length > 0)

  if (validOptions.length < 2) return
  if (!validOptions.some((o) => o.isCorrect)) validOptions[0].isCorrect = true

  const { data: question } = await supabase
    .from('questions')
    .insert({
      quiz_id: quizId,
      question_text: questionText,
      explanation: explanation || null,
      position,
    })
    .select('id')
    .single()

  if (question) {
    await supabase.from('answers').insert(
      validOptions.map((opt, idx) => ({
        question_id: question.id,
        answer_text: opt.text,
        is_correct: opt.isCorrect,
        position: idx + 1,
      }))
    )
  }

  revalidatePath(`/admin/quizzes/${quizId}`)
}

export async function deleteQuizQuestion(formData: FormData) {
  const { supabase } = await requireAdmin()
  const quizId = String(formData.get('quizId') ?? '')
  const questionId = String(formData.get('questionId') ?? '')
  if (!questionId) return

  await supabase.from('questions').delete().eq('id', questionId)
  revalidatePath(`/admin/quizzes/${quizId}`)
}
