import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getUserIdFromCookies } from '@/lib/auth/user'
import { z } from 'zod'
import { addWeeks, addDays, format, parseISO, startOfWeek } from 'date-fns'

const recurringAppointmentSchema = z.object({
  customer_id: z.string().uuid().nullable().optional(),
  staff_id: z.string().uuid().nullable().optional(),
  service_id: z.string().uuid().nullable().optional(),
  start_date: z.string(), // YYYY-MM-DD
  start_time: z.string(), // HH:mm
  repeat_weeks: z.number().min(1).max(12),
  days: z.array(z.number().min(0).max(6)), // 0: 일요일, 1: 월요일, ..., 6: 토요일
  status: z.string().default('scheduled'),
  notes: z.string().nullable().optional(),
})

/**
 * POST /api/appointments/recurring
 * 반복 예약 생성
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const userId = await getUserIdFromCookies()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const json = await req.json()
    const body = recurringAppointmentSchema.parse(json)

    // 반복 예약을 위한 ID 생성 (모든 반복 예약이 같은 recurring_id를 가짐)
    const recurringId = crypto.randomUUID()

    const startDate = parseISO(body.start_date)
    const baseDate = startOfWeek(startDate, { weekStartsOn: 1 }) // 월요일 기준

    const appointmentsToCreate = []

    // 지정된 주 수만큼 반복
    for (let week = 0; week < body.repeat_weeks; week++) {
      const weekBaseDate = addWeeks(baseDate, week)

      // 지정된 요일들에 대해 예약 생성
      for (const dayOfWeek of body.days) {
        // 일요일(0)을 7로 변환하여 월요일(1) 기준으로 계산
        const day = dayOfWeek === 0 ? 7 : dayOfWeek
        const targetDate = addDays(weekBaseDate, day - 1)

        // 시작 날짜 이후의 날짜만 생성
        if (targetDate >= startDate) {
          const dateStr = format(targetDate, 'yyyy-MM-dd')
          const appointmentDate = `${dateStr}T${body.start_time}:00`

          appointmentsToCreate.push({
            owner_id: userId,
            customer_id: body.customer_id ?? null,
            staff_id: body.staff_id ?? null,
            service_id: body.service_id ?? null,
            appointment_date: new Date(appointmentDate).toISOString(),
            status: body.status,
            notes: body.notes ?? null,
            recurring_id: recurringId,
          })
        }
      }
    }

    if (appointmentsToCreate.length === 0) {
      return NextResponse.json({ error: '생성할 예약이 없습니다.' }, { status: 400 })
    }

    // 배치로 예약 생성
    const createdAppointments = []
    const batchSize = 50 // 한 번에 최대 50개씩 생성

    for (let i = 0; i < appointmentsToCreate.length; i += batchSize) {
      const batch = appointmentsToCreate.slice(i, i + batchSize)
      const { data, error } = await supabase
        .from('beautyhub_appointments')
        .insert(batch)
        .select()

      if (error) {
        throw error
      }

      if (data) {
        createdAppointments.push(...data)
      }
    }

    return NextResponse.json({
      success: true,
      count: createdAppointments.length,
      recurring_id: recurringId,
      appointments: createdAppointments,
    })
  } catch (error) {
    console.error('반복 예약 생성 실패:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data', details: error.errors }, { status: 400 })
    }
    return NextResponse.json(
      { error: 'Failed to create recurring appointments', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
