import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getUserIdFromCookies } from '@/lib/auth/user'
import { StaffLeaveRequestsRepository } from '@/app/lib/repositories/staff-leave-requests.repository'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const userId = await getUserIdFromCookies()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const staffId = request.nextUrl.searchParams.get('staff_id')
    const repo = new StaffLeaveRequestsRepository(userId, supabase)

    const list = staffId
      ? await repo.findByStaffId(staffId)
      : await repo.findAll({ limit: 200, orderBy: 'created_at', ascending: false })
    return NextResponse.json(list)
  } catch (e) {
    console.error('Leave requests GET:', e)
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Failed to fetch' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const userId = await getUserIdFromCookies()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { staff_id, start_date, end_date, type, reason } = body
    if (!staff_id || !start_date || !end_date) {
      return NextResponse.json(
        { error: 'staff_id, start_date, end_date required' },
        { status: 400 }
      )
    }

    const repo = new StaffLeaveRequestsRepository(userId, supabase)
    const created = await repo.createRecord({
      staff_id,
      start_date,
      end_date,
      type: type || 'annual',
      reason: reason || null,
    })
    return NextResponse.json(created)
  } catch (e) {
    console.error('Leave requests POST:', e)
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Failed to create' },
      { status: 500 }
    )
  }
}
