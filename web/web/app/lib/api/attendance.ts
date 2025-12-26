import { AttendanceListQuery } from '@/types/api'
import { StaffAttendance, StaffAttendanceCreateInput, StaffAttendanceUpdateInput } from '@/types/entities'

/**
 * 근태 관리 클라이언트 API
 */
export const attendanceApi = {
    /**
     * 근태 목록 조회
     */
    list: async (query: AttendanceListQuery): Promise<StaffAttendance[]> => {
        const params = new URLSearchParams()
        if (query.staff_id) params.append('staff_id', query.staff_id)
        if (query.start) params.append('start', query.start)
        if (query.end) params.append('end', query.end)

        const response = await fetch(`/api/attendance?${params.toString()}`)
        if (!response.ok) throw new Error('근태 목록을 불러오지 못했습니다.')
        return response.json()
    },

    /**
     * 근태 기록 등록
     */
    create: async (data: StaffAttendanceCreateInput): Promise<StaffAttendance> => {
        const response = await fetch('/api/attendance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        })
        if (!response.ok) throw new Error('근태 기록을 저장하지 못했습니다.')
        return response.json()
    },

    /**
     * 근태 기록 수정
     */
    update: async (id: string, data: StaffAttendanceUpdateInput): Promise<StaffAttendance> => {
        const response = await fetch(`/api/attendance/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        })
        if (!response.ok) throw new Error('근태 기록을 수정하지 못했습니다.')
        return response.json()
    },

    /**
     * 근태 기록 삭제
     */
    delete: async (id: string): Promise<void> => {
        const response = await fetch(`/api/attendance/${id}`, {
            method: 'DELETE',
        })
        if (!response.ok) throw new Error('근태 기록을 삭제하지 못했습니다.')
    }
}
