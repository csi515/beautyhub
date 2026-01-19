import { NextRequest } from 'next/server'
import { withAuth } from '@/app/lib/api/middleware'
import { createSuccessResponse } from '@/app/lib/api/handlers'
import { AttendanceRepository } from '@/app/lib/repositories/attendance.repository'

/**
 * 근태 상세 수정 API
 */
export const PATCH = withAuth(async (req: NextRequest, { userId, supabase, params }) => {
    const id = params?.['id'] as string
    const body = await req.json()
    const repo = new AttendanceRepository(userId, supabase)

    const data = await repo.updateAttendance(id, body)
    return createSuccessResponse(data)
})

/**
 * 근태 기록 삭제 API
 */
export const DELETE = withAuth(async (_, { userId, supabase, params }) => {
    const id = params?.['id'] as string
    const repo = new AttendanceRepository(userId, supabase)

    await repo.deleteAttendance(id)
    return createSuccessResponse({ success: true })
})
