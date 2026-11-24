import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const MAX_EMAILS_PER_RUN = 80

type EmailPayload = {
  to: string
  subject: string
  html: string
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

async function sendWithResend(
  apiKey: string,
  from: string,
  payload: EmailPayload
): Promise<boolean> {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [payload.to],
      subject: payload.subject,
      html: payload.html,
    }),
  })

  if (!res.ok) {
    console.error('Resend error:', res.status, await res.text())
    return false
  }
  return true
}

function wrapEmailHtml(bodyHtml: string, unsubscribeUrl: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #0f172a; line-height: 1.6;">
      ${bodyHtml}
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 28px 0 14px;" />
      <p style="font-size: 12px; color: #64748b;">
        You received this email because you have a free account on MOOC Learning Platform.
        <a href="${unsubscribeUrl}" style="color: #475569;">Unsubscribe from all emails</a>.
      </p>
    </div>
  `
}

Deno.serve(async (req) => {
  const expectedSecret = Deno.env.get('CRON_SECRET')
  const providedSecret = req.headers.get('x-cron-secret')
  if (!expectedSecret || providedSecret !== expectedSecret) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const resendApiKey = Deno.env.get('RESEND_API_KEY')!
  const fromEmail =
    Deno.env.get('RESEND_FROM_EMAIL') ?? 'MOOC Platform <onboarding@resend.dev>'
  const appUrl = (Deno.env.get('APP_URL') ?? 'http://localhost:3000').replace(/\/$/, '')

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  let sentCount = 0
  const stats = { welcome: 0, completion: 0, reminder: 0 }

  // 1. Welcome Emails
  if (sentCount < MAX_EMAILS_PER_RUN) {
    const { data: newUsers } = await supabase
      .from('profiles')
      .select('id, email, full_name, unsubscribe_token')
      .eq('email_opt_out', false)
      .is('welcome_email_sent_at', null)
      .not('email', 'is', null)
      .limit(MAX_EMAILS_PER_RUN - sentCount)

    for (const user of newUsers ?? []) {
      const name = escapeHtml(user.full_name?.trim() || 'there')
      const unsubUrl = `${appUrl}/unsubscribe/${user.unsubscribe_token}`
      const ok = await sendWithResend(resendApiKey, fromEmail, {
        to: user.email,
        subject: 'Welcome to MOOC Learning Platform!',
        html: wrapEmailHtml(
          `
          <h2>Welcome, ${name}!</h2>
          <p>Thanks for joining our free, self-paced learning platform.</p>
          <p>Browse our courses, learn at your own speed, and earn free verifiable certificates.</p>
          <p><a href="${appUrl}/courses" style="display:inline-block;padding:10px 18px;background:#0f172a;color:#fff;text-decoration:none;border-radius:6px;">Browse Free Courses</a></p>
          `,
          unsubUrl
        ),
      })

      if (ok) {
        await supabase
          .from('profiles')
          .update({ welcome_email_sent_at: new Date().toISOString() })
          .eq('id', user.id)
        sentCount += 1
        stats.welcome += 1
      }
    }
  }

  // 2. Completion Congratulations Emails
  if (sentCount < MAX_EMAILS_PER_RUN) {
    const { data: newCerts } = await supabase
      .from('certificates')
      .select(
        `
        id,
        verification_code,
        courses ( title ),
        profiles ( email, full_name, email_opt_out, unsubscribe_token )
      `
      )
      .is('completion_email_sent_at', null)
      .limit(MAX_EMAILS_PER_RUN - sentCount)

    for (const cert of newCerts ?? []) {
      const profile = cert.profiles as unknown as {
        email: string | null
        full_name: string | null
        email_opt_out: boolean
        unsubscribe_token: string
      } | null
      const course = cert.courses as unknown as { title: string } | null

      if (!profile?.email || profile.email_opt_out || !course) continue

      const name = escapeHtml(profile.full_name?.trim() || 'Learner')
      const courseTitle = escapeHtml(course.title)
      const verifyUrl = `${appUrl}/verify/${cert.verification_code}`
      const pdfUrl = `${appUrl}/api/certificates/${cert.verification_code}/pdf`
      const unsubUrl = `${appUrl}/unsubscribe/${profile.unsubscribe_token}`

      const ok = await sendWithResend(resendApiKey, fromEmail, {
        to: profile.email,
        subject: `Congratulations! You completed ${course.title}`,
        html: wrapEmailHtml(
          `
          <h2>Congratulations, ${name}!</h2>
          <p>You completed all lessons and quizzes for <strong>${courseTitle}</strong>.</p>
          <p>Your official certificate is ready (ID: <strong>${cert.verification_code}</strong>):</p>
          <p>
            <a href="${verifyUrl}" style="display:inline-block;padding:10px 18px;background:#047857;color:#fff;text-decoration:none;border-radius:6px;margin-right:8px;">View Certificate</a>
            <a href="${pdfUrl}" style="display:inline-block;padding:10px 18px;background:#0f172a;color:#fff;text-decoration:none;border-radius:6px;">Download PDF</a>
          </p>
          `,
          unsubUrl
        ),
      })

      if (ok) {
        await supabase
          .from('certificates')
          .update({ completion_email_sent_at: new Date().toISOString() })
          .eq('id', cert.id)
        sentCount += 1
        stats.completion += 1
      }
    }
  }

  // 3. 3-Day Inactivity Reminders
  if (sentCount < MAX_EMAILS_PER_RUN) {
    const { data: inactiveUsers } = await supabase.rpc('get_inactive_learners', {
      p_limit: MAX_EMAILS_PER_RUN - sentCount,
    })

    for (const learner of inactiveUsers ?? []) {
      const name = escapeHtml(learner.full_name?.trim() || 'there')
      const courseTitle = escapeHtml(learner.course_title)
      const unsubUrl = `${appUrl}/unsubscribe/${learner.unsubscribe_token}`
      const continueUrl = `${appUrl}/courses/${learner.course_slug}/learn`

      const ok = await sendWithResend(resendApiKey, fromEmail, {
        to: learner.email,
        subject: `Keep going with ${learner.course_title}!`,
        html: wrapEmailHtml(
          `
          <h2>Hi ${name}, ready for your next lesson?</h2>
          <p>It's been a few days since your last lesson in <strong>${courseTitle}</strong>. Even 5 minutes today keeps your momentum going!</p>
          <p><a href="${continueUrl}" style="display:inline-block;padding:10px 18px;background:#0f172a;color:#fff;text-decoration:none;border-radius:6px;">Resume Where You Left Off</a></p>
          `,
          unsubUrl
        ),
      })

      if (ok) {
        await supabase
          .from('profiles')
          .update({ last_reminder_sent_at: new Date().toISOString() })
          .eq('id', learner.user_id)
        sentCount += 1
        stats.reminder += 1
      }
    }
  }

  return new Response(JSON.stringify({ ok: true, sentCount, stats }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
})
