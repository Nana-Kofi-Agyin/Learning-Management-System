'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

const COOLDOWN_SECONDS = 15
const MAX_POSTS_PER_HOUR = 10
const MIN_BODY_LENGTH = 3
const MAX_BODY_LENGTH = 2000

export type PostActionResult = {
  error?: string
  success?: boolean
}

export async function createDiscussionPost(params: {
  slug: string
  courseId: string
  lessonId: string
  parentId?: string | null
  body: string
}): Promise<PostActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Please log in to post.' }
  }

  const trimmedBody = params.body.trim()
  if (trimmedBody.length < MIN_BODY_LENGTH) {
    return { error: `Post must be at least ${MIN_BODY_LENGTH} characters.` }
  }
  if (trimmedBody.length > MAX_BODY_LENGTH) {
    return { error: `Post cannot exceed ${MAX_BODY_LENGTH} characters.` }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .single()

  const isAdmin = profile?.role === 'admin'

  if (!isAdmin) {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const { data: recentPosts } = await supabase
      .from('discussion_posts')
      .select('body, created_at')
      .eq('user_id', user.id)
      .gte('created_at', oneHourAgo)
      .order('created_at', { ascending: false })

    const postsInLastHour = recentPosts ?? []

    if (postsInLastHour.length >= MAX_POSTS_PER_HOUR) {
      return {
        error: `Rate limit reached: you can post up to ${MAX_POSTS_PER_HOUR} times per hour.`,
      }
    }

    if (postsInLastHour.length > 0) {
      const latest = postsInLastHour[0]
      const secondsSinceLast =
        (Date.now() - new Date(latest.created_at).getTime()) / 1000

      if (secondsSinceLast < COOLDOWN_SECONDS) {
        const waitSeconds = Math.ceil(COOLDOWN_SECONDS - secondsSinceLast)
        return {
          error: `Please wait ${waitSeconds} second${waitSeconds === 1 ? '' : 's'} before posting again.`,
        }
      }

      if (
        secondsSinceLast < 120 &&
        latest.body.trim().toLowerCase() === trimmedBody.toLowerCase()
      ) {
        return { error: 'You already posted that exact message a moment ago.' }
      }
    }
  }

  const authorName =
    profile?.full_name?.trim() || (isAdmin ? 'Instructor' : 'Learner')

  const { error } = await supabase.from('discussion_posts').insert({
    course_id: params.courseId,
    lesson_id: params.lessonId,
    user_id: user.id,
    parent_id: params.parentId ?? null,
    body: trimmedBody,
    author_name: isAdmin ? `${authorName} (Admin)` : authorName,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/courses/${params.slug}/learn`)
  return { success: true }
}

export async function toggleUpvotePost(formData: FormData) {
  const slug = String(formData.get('slug') ?? '')
  const postId = String(formData.get('postId') ?? '')
  const alreadyUpvoted = formData.get('alreadyUpvoted') === 'true'
  if (!postId) return

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  if (alreadyUpvoted) {
    await supabase
      .from('discussion_upvotes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', user.id)
  } else {
    await supabase
      .from('discussion_upvotes')
      .upsert(
        { post_id: postId, user_id: user.id },
        { onConflict: 'post_id,user_id' }
      )
  }

  revalidatePath(`/courses/${slug}/learn`)
}

export async function togglePinPost(formData: FormData) {
  const slug = String(formData.get('slug') ?? '')
  const postId = String(formData.get('postId') ?? '')
  const nextPinned = formData.get('nextPinned') === 'true'
  if (!postId) return

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') return

  await supabase
    .from('discussion_posts')
    .update({ is_pinned: nextPinned })
    .eq('id', postId)

  revalidatePath(`/courses/${slug}/learn`)
}

export async function deleteDiscussionPost(formData: FormData) {
  const slug = String(formData.get('slug') ?? '')
  const postId = String(formData.get('postId') ?? '')
  if (!postId) return

  const supabase = await createClient()
  await supabase.from('discussion_posts').delete().eq('id', postId)
  revalidatePath(`/courses/${slug}/learn`)
}
