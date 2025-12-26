import { NextRequest } from 'next/server'
import { withAuth } from '@/app/lib/api/middleware'
import { parseQueryParams, createSuccessResponse } from '@/app/lib/api/handlers'
import { AttendanceRepository } from '@/app/lib/repositories/attendance.repository'

/**
 * 근태 목록 조회 API
 * staff_id, start, end 파라미터를 통한 필터링 지원
 */
export const GET = withAuth(async (req: NextRequest, { userId, supabase }) => {
    const params = parseQueryParams(req) as any
    const repo = new AttendanceRepository(userId, supabase)

    const staffId = params['staff_id'] as string | undefined
    const start = params['start'] as string | undefined
    const end = params['end'] as string | undefined

    let data
    if (staffId) {
        data = await repo.findByStaffId(staffId, start && end ? { start, end } : undefined)
    } else if (start && end) {
        data = await repo.findByRange(start, end)
    } else {
        data = await repo.findAll()
    }

    return createSuccessResponse(data)
})

/**
 * 근태 기록 생성 API
 */
export const POST = withAuth(async (req: NextRequest, { userId, supabase }) => {
    const body = await req.json()
    const repo = new AttendanceRepository(userId, supabase)

    const data = await repo.createAttendance(body)
    return createSuccessResponse(data, 201)
})
