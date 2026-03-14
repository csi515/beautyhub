import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerAdmin } from '@/lib/supabase/server-admin'

export const dynamic = 'force-dynamic'

type ReminderType = '1_day_before' | '3_hours_before' | 'on_day'

/**
 * 예약일 기준 리마인더 발송 시점 계산
 * - 1_day_before: 예약 24시간 전 ~ 23시간 전 구간
 * - 3_hours_before: 예약 3시간 전 ~ 2시간 전 구간
 * - on_day: 예약 당일 자정 ~ 오전 9시 구간
 */
function isDue(appointmentDate: string, reminderType: ReminderType): boolean {
  const now = new Date()
  const appt = new Date(appointmentDate)
  const diffMs = appt.getTime() - now.getTime()
  const diffHours = diffMs / (1000 * 60 * 60)

  if (reminderType === '1_day_before') {
    return diffHours >= 23 && diffHours < 25
  }
  if (reminderType === '3_hours_before') {
    return diffHours >= 2 && diffHours < 4
  }
  if (reminderType === 'on_day') {
    const isSameDay =
      appt.getFullYear() === now.getFullYear() &&
      appt.getMonth() === now.getMonth() &&
      appt.getDate() === now.getDate()
    return isSameDay && now.getHours() < 9
  }
  return false
}

/**
 * GET /api/cron/reminders
 * Vercel Cron이 매시간 호출하는 리마인더 자동 처리 엔드포인트.
 * CRON_SECRET 환경변수로 보호됩니다.
 *
 * 향후 SMS/이메일 발송 연동 시 isDue() 체크 후 아래 주석 위치에 추가하세요.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env['CRON_SECRET']

  if (!cronSecret) {
    return NextResponse.json({ error: 'CRON_SECRET is not configured' }, { status: 503 })
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createSupabaseServerAdmin()

  try {
    // 미전송 리마인더 조회 (admin 클라이언트로 직접 접근)
    const { data: reminders, error } = await admin
      .from('appointment_reminders')
      .select('id, reminder_type, owner_id, appointment_id, sent_at')
      .is('sent_at', null)

    if (error) {
      console.error('[cron/reminders] 리마인더 조회 오류:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!reminders || reminders.length === 0) {
      return NextResponse.json({ ok: true, processed: 0 })
    }

    // 관련 예약 날짜 일괄 조회
    const appointmentIds = [...new Set(reminders.map((r: any) => r.appointment_id))]
    const { data: appointments, error: apptError } = await admin
      .from('appointments')
      .select('id, appointment_date')
      .in('id', appointmentIds)

    if (apptError) {
      console.error('[cron/reminders] 예약 조회 오류:', apptError)
      return NextResponse.json({ error: apptError.message }, { status: 500 })
    }

    const apptDateMap: Record<string, string> = {}
    for (const a of (appointments || [])) {
      apptDateMap[(a as any).id] = (a as any).appointment_date
    }

    let processedCount = 0
    const errors: string[] = []

    for (const reminder of reminders) {
      const apptDate = apptDateMap[(reminder as any).appointment_id]
      if (!apptDate) continue

      const reminderType = (reminder as any).reminder_type as ReminderType
      if (!isDue(apptDate, reminderType)) continue

      // 향후 SMS/이메일 발송 로직 위치
      // await sendSms(customerPhone, message)

      const { error: updateError } = await admin
        .from('appointment_reminders')
        .update({ sent_at: new Date().toISOString() })
        .eq('id', (reminder as any).id)

      if (updateError) {
        errors.push(`${(reminder as any).id}: ${updateError.message}`)
      } else {
        console.log(`[cron/reminders] 처리됨: ${(reminder as any).id} (${reminderType}, 예약일: ${apptDate})`)
        processedCount++
      }
    }

    return NextResponse.json({
      ok: true,
      processed: processedCount,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'unknown error'
    console.error('[cron/reminders] 오류:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
