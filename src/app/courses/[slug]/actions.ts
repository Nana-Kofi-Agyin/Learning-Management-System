'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { checkAndIssueCertificate } from '@/lib/certificates'

export async function enrollInCourse(formData: FormData) {
  const courseId = String(formData.get('courseId') ?? '')
  const slug = String(formData.get('slug') ?? '')
  if (!courseId || !slug) return

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/login?next=/courses/${slug}`)
  }

  await supabase.from('enrollments').upsert(
    { user_id: user.id, course_id: courseId },
    { onConflict: 'user_id,course_id' }
  )

  revalidatePath(`/courses/${slug}`)
  revalidatePath('/dashboard')
  redirect(`/courses/${slug}/learn`)
}

export async function toggleLessonComplete(formData: FormData) {
  const courseId = String(formData.get('courseId') ?? '')
  const slug = String(formData.get('slug') ?? '')
  const lessonId = String(formData.get('lessonId') ?? '')
  const nextCompleted = formData.get('nextCompleted') === 'true'
  if (!courseId || !slug || !lessonId) return

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/login?next=/courses/${slug}/learn?lesson=${lessonId}`)
  }

  await supabase.from('lesson_progress').upsert(
    {
      user_id: user.id,
      lesson_id: lessonId,
      is_completed: nextCompleted,
      completed_at: nextCompleted ? new Date().toISOString() : null,
    },
    { onConflict: 'user_id,lesson_id' }
  )

  if (nextCompleted) {
    await checkAndIssueCertificate(supabase, user.id, courseId)
  }

  revalidatePath(`/courses/${slug}`)
  revalidatePath(`/courses/${slug}/learn`)
  revalidatePath('/dashboard')
}
