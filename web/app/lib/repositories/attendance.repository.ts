import { SupabaseClient } from '@supabase/supabase-js'
import { BaseRepository } from './base.repository'
import type { StaffAttendance, StaffAttendanceCreateInput, StaffAttendanceUpdateInput } from '@/types/entities'

/**
 * 근태 관리 Repository
 */
export class AttendanceRepository extends BaseRepository<StaffAttendance> {
    constructor(userId: string, supabase: SupabaseClient) {
        super(userId, 'beautyhub_staff_attendance', supabase)
    }

    protected override getSearchFields(): string[] {
        return ['status', 'memo']
    }

    /**
     * 특정 직원의 근태 기록 조회
     */
    async findByStaffId(staffId: string, range?: { start: string; end: string }): Promise<StaffAttendance[]> {
        let query = this.supabase
            .from(this.tableName)
            .select('*')
            .eq('owner_id', this.userId)
            .eq('staff_id', staffId)

        if (range) {
            query = query.gte('start_time', range.start).lt('start_time', range.end)
        }

        const { data, error } = await query.order('start_time', { ascending: true })

        if (error) throw error
        return (data || []) as StaffAttendance[]
    }

    /**
     * 전체 직원의 범위 내 근태 기록 조회
     */
    async findByRange(start: string, end: string): Promise<StaffAttendance[]> {
        const { data, error } = await this.supabase
            .from(this.tableName)
            .select('*')
            .eq('owner_id', this.userId)
            .gte('start_time', start)
            .lt('start_time', end)
            .order('start_time', { ascending: true })

        if (error) throw error
        return (data || []) as StaffAttendance[]
    }

    /**
     * 근태 기록 생성
     */
    async createAttendance(input: StaffAttendanceCreateInput): Promise<StaffAttendance> {
        const payload = {
            owner_id: this.userId,
            ...input
        }
        return this.create(payload as unknown as StaffAttendance)
    }

    /**
     * 근태 기록 업데이트
     */
    async updateAttendance(id: string, input: StaffAttendanceUpdateInput): Promise<StaffAttendance> {
        return this.update(id, input as Partial<StaffAttendance>)
    }

    /**
     * 근태 기록 삭제
     */
    async deleteAttendance(id: string): Promise<void> {
        return this.delete(id)
    }
}
