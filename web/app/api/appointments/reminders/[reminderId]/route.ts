import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getUserIdFromCookies } from '@/lib/auth/user'
import { AppointmentRemindersRepository } from '@/app/lib/repositories/appointment-reminders.repository'

/**
 * PATCH /api/appointments/reminders/[reminderId]
 * 리마인더 확인 처리
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { reminderId: string } }
) {
  try {
    const supabase = await createSupabaseServerClient()
    const userId = await getUserIdFromCookies()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const reminderId = params.reminderId
    const repository = new AppointmentRemindersRepository(userId, supabase)
    const reminder = await repository.markAsSent(reminderId)

    return NextResponse.json(reminder)
  } catch (error) {
    console.error('Error updating appointment reminder:', error)
    return NextResponse.json(
      { error: 'Failed to update appointment reminder' },
      { status: 500 }
    )
  }
}
