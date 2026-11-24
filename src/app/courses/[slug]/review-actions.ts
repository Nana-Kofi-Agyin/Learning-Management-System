'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function submitCourseReview(formData: FormData) {
  const courseId = String(formData.get('courseId') ?? '')
  const slug = String(formData.get('slug') ?? '')
  const rating = Number.parseInt(String(formData.get('rating') ?? '5'), 10)
  const comment = String(formData.get('comment') ?? '').trim().slice(0, 1000)

  if (!courseId || !slug || rating < 1 || rating > 5) return

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  await supabase.from('course_reviews').upsert(
    {
      course_id: courseId,
      user_id: user.id,
      author_name: profile?.full_name?.trim() || 'Learner',
      rating,
      comment: comment || null,
    },
    { onConflict: 'course_id,user_id' }
  )

  revalidatePath(`/courses/${slug}`)
}

export async function deleteCourseReview(formData: FormData) {
  const reviewId = String(formData.get('reviewId') ?? '')
  const slug = String(formData.get('slug') ?? '')
  if (!reviewId) return

  const supabase = await createClient()
  await supabase.from('course_reviews').delete().eq('id', reviewId)
  revalidatePath(`/courses/${slug}`)
}
