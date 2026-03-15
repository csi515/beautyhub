import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getUserIdFromCookies } from '@/lib/auth/user'
import { AppointmentsRepository } from '@/app/lib/repositories/appointments.repository'
import { logger } from '@/app/lib/utils/logger'

/**
 * POST /api/appointments/check-conflict
 * 예약 시간 충돌 검사
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const userId = await getUserIdFromCookies()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { appointment_date, staff_id, duration_minutes, exclude_appointment_id } = body

    if (!appointment_date || !staff_id) {
      return NextResponse.json(
        { error: 'appointment_date and staff_id are required' },
        { status: 400 }
      )
    }

    const repository = new AppointmentsRepository(userId, supabase)
    const result = await repository.checkConflict(
      appointment_date,
      staff_id,
      duration_minutes || 60,
      exclude_appointment_id
    )

    return NextResponse.json(result)
  } catch (error) {
    logger.error('Error checking appointment conflict', error, 'AppointmentCheckConflict')
    return NextResponse.json(
      { error: 'Failed to check appointment conflict' },
      { status: 500 }
    )
  }
}
