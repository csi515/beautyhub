import { SupabaseClient } from '@supabase/supabase-js'
import { BaseRepository } from './base.repository'
import type {
  StaffLeaveRequest,
  StaffLeaveRequestCreateInput,
  StaffLeaveRequestUpdateInput,
} from '@/types/entities'

export class StaffLeaveRequestsRepository extends BaseRepository<StaffLeaveRequest> {
  constructor(userId: string, supabase: SupabaseClient) {
    super(userId, 'beautyhub_staff_leave_requests', supabase)
  }

  async findByStaffId(staffId: string): Promise<StaffLeaveRequest[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('owner_id', this.userId)
      .eq('staff_id', staffId)
      .order('start_date', { ascending: false })

    if (error) this.handleSupabaseError(error)
    return (data || []) as StaffLeaveRequest[]
  }

  async findPending(): Promise<StaffLeaveRequest[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('owner_id', this.userId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (error) this.handleSupabaseError(error)
    return (data || []) as StaffLeaveRequest[]
  }

  async createRecord(input: StaffLeaveRequestCreateInput): Promise<StaffLeaveRequest> {
    return this.create({
      ...input,
      type: input.type || 'annual',
      status: 'pending',
    } as Partial<StaffLeaveRequest>)
  }

  async updateStatus(id: string, status: 'approved' | 'rejected'): Promise<StaffLeaveRequest> {
    return this.update(id, { status } as StaffLeaveRequestUpdateInput)
  }
}
