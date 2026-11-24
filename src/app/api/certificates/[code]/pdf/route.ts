import { NextResponse } from 'next/server'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function safePdfText(value: string): string {
  return value.replace(/[^\x20-\xFF]/g, '').trim()
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params
  const supabase = await createClient()

  const { data } = await supabase.rpc('verify_certificate', { p_code: code })
  const cert = Array.isArray(data) ? data[0] : null

  if (!cert) {
    return NextResponse.json({ error: 'Certificate not found' }, { status: 404 })
  }

  const learnerName = safePdfText(cert.learner_name || 'Learner')
  const courseTitle = safePdfText(cert.course_title || 'Course')
  const issuedDate = new Date(cert.issued_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  const { origin } = new URL(request.url)
  const verifyUrl = `${origin}/verify/${cert.verification_code}`

  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([842, 595])
  const { width, height } = page.getSize()

  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica)

  page.drawRectangle({
    x: 28,
    y: 28,
    width: width - 56,
    height: height - 56,
    borderColor: rgb(0.06, 0.09, 0.16),
    borderWidth: 3,
  })
  page.drawRectangle({
    x: 40,
    y: 40,
    width: width - 80,
    height: height - 80,
    borderColor: rgb(0.75, 0.78, 0.84),
    borderWidth: 1,
  })

  const drawCentered = (
    text: string,
    y: number,
    size: number,
    font = fontRegular,
    color = rgb(0.1, 0.12, 0.18)
  ) => {
    const textWidth = font.widthOfTextAtSize(text, size)
    page.drawText(text, {
      x: (width - textWidth) / 2,
      y,
      size,
      font,
      color,
    })
  }

  drawCentered('MOOC LEARNING PLATFORM', height - 105, 13, fontBold, rgb(0.05, 0.48, 0.35))
  drawCentered('CERTIFICATE OF COMPLETION', height - 150, 30, fontBold)
  drawCentered('This certifies that', height - 210, 15, fontRegular, rgb(0.35, 0.38, 0.45))
  drawCentered(learnerName, height - 265, 34, fontBold)
  drawCentered(
    'has successfully completed all lessons and assessments for',
    height - 315,
    15,
    fontRegular,
    rgb(0.35, 0.38, 0.45)
  )
  drawCentered(courseTitle, height - 365, 24, fontBold, rgb(0.06, 0.09, 0.16))
  drawCentered(`Issued on ${issuedDate}`, height - 425, 13, fontRegular, rgb(0.35, 0.38, 0.45))

  drawCentered(
    `Certificate ID: ${cert.verification_code}`,
    92,
    11,
    fontBold,
    rgb(0.25, 0.28, 0.35)
  )
  drawCentered(
    `Verify authenticity at: ${verifyUrl}`,
    72,
    10,
    fontRegular,
    rgb(0.4, 0.44, 0.5)
  )

  const pdfBytes = await pdfDoc.save()

  return new NextResponse(Buffer.from(pdfBytes), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="certificate-${cert.verification_code}.pdf"`,
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
