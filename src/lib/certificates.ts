import type { SupabaseClient } from '@supabase/supabase-js'

export async function checkAndIssueCertificate(
  supabase: SupabaseClient,
  _userId: string,
  courseId: string
): Promise<{ issued: boolean; verificationCode: string | null }> {
  const { data: code, error } = await supabase.rpc(
    'issue_certificate_if_eligible',
    { p_course_id: courseId }
  )

  if (error || !code) {
    return { issued: false, verificationCode: null }
  }

  return {
    issued: true,
    verificationCode: String(code),
  }
}
