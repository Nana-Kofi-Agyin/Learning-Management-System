import type { SupabaseClient } from '@supabase/supabase-js'

export type PrerequisiteStatus = {
  id: string
  title: string
  slug: string
  isCompleted: boolean
}

export async function getCoursePrerequisites(
  supabase: SupabaseClient,
  courseId: string,
  userId: string | null
): Promise<PrerequisiteStatus[]> {
  const { data: rows } = await supabase
    .from('course_prerequisites')
    .select(
      'prerequisite:courses!course_prerequisites_prerequisite_course_id_fkey(id, title, slug)'
    )
    .eq('course_id', courseId)

  const prereqs = (rows ?? [])
    .map(
      (r) =>
        r.prerequisite as unknown as {
          id: string
          title: string
          slug: string
        } | null
    )
    .filter((p): p is { id: string; title: string; slug: string } => Boolean(p))

  if (prereqs.length === 0) return []

  const completedIds = new Set<string>()
  if (userId) {
    const { data: completedEnrollments } = await supabase
      .from('enrollments')
      .select('course_id')
      .eq('user_id', userId)
      .not('completed_at', 'is', null)
      .in(
        'course_id',
        prereqs.map((p) => p.id)
      )

    for (const row of completedEnrollments ?? []) {
      completedIds.add(row.course_id)
    }
  }

  return prereqs.map((p) => ({
    ...p,
    isCompleted: completedIds.has(p.id),
  }))
}

export function getModuleDripStatus(
  enrolledAtIso: string,
  unlockAfterDays: number
): { isUnlocked: boolean; unlockDate: Date; daysRemaining: number } {
  const enrolledDate = new Date(enrolledAtIso)
  const unlockDate = new Date(
    enrolledDate.getTime() + Math.max(0, unlockAfterDays) * 24 * 60 * 60 * 1000
  )
  const msRemaining = unlockDate.getTime() - Date.now()
  const isUnlocked = unlockAfterDays <= 0 || msRemaining <= 0
  const daysRemaining = isUnlocked
    ? 0
    : Math.ceil(msRemaining / (24 * 60 * 60 * 1000))

  return { isUnlocked, unlockDate, daysRemaining }
}
