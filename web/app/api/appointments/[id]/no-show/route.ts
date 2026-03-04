import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getUserIdFromCookies } from '@/lib/auth/user'
import { AppointmentsRepository } from '@/app/lib/repositories/appointments.repository'

/**
 * PATCH /api/appointments/[id]/no-show
 * 노쇼 처리
 */
export async function PATCH(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createSupabaseServerClient()
    const userId = await getUserIdFromCookies()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const appointmentId = params.id
    const repository = new AppointmentsRepository(userId, supabase)
    const appointment = await repository.markAsNoShow(appointmentId)

    return NextResponse.json(appointment)
  } catch (error) {
    console.error('Error marking appointment as no-show:', error)
    return NextResponse.json(
      { error: 'Failed to mark appointment as no-show' },
      { status: 500 }
    )
  }
}
