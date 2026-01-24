import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getUserIdFromCookies } from '@/lib/auth/user'
import { StaffLeaveRequestsRepository } from '@/app/lib/repositories/staff-leave-requests.repository'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createSupabaseServerClient()
    const userId = await getUserIdFromCookies()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    const body = await request.json()
    const status = body?.status
    if (status !== 'approved' && status !== 'rejected') {
      return NextResponse.json({ error: 'status must be approved or rejected' }, { status: 400 })
    }

    const repo = new StaffLeaveRequestsRepository(userId, supabase)
    const updated = await repo.updateStatus(id, status)
    return NextResponse.json(updated)
  } catch (e) {
    console.error('Leave request PATCH:', e)
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Failed to update' },
      { status: 500 }
    )
  }
}
