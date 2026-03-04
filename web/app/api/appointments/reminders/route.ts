import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getUserIdFromCookies } from '@/lib/auth/user'
import { AppointmentRemindersRepository } from '@/app/lib/repositories/appointment-reminders.repository'

/**
 * GET /api/appointments/reminders
 * 예약 리마인더 조회
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const userId = await getUserIdFromCookies()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const upcoming = searchParams.get('upcoming') === 'true'
    const appointmentId = searchParams.get('appointment_id')

    const repository = new AppointmentRemindersRepository(userId, supabase)

    let reminders
    if (appointmentId) {
      reminders = await repository.findByAppointmentId(appointmentId)
    } else if (upcoming) {
      reminders = await repository.findUnsent(true)
    } else {
      reminders = await repository.findUnsent(false)
    }

    return NextResponse.json(reminders)
  } catch (error) {
    console.error('Error fetching appointment reminders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch appointment reminders' },
      { status: 500 }
    )
  }
}
