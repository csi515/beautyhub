import { SupabaseClient } from '@supabase/supabase-js'
import { BaseRepository } from './base.repository'
import type { AuditLog, AuditLogCreateInput } from '@/types/audit'

export class AuditLogsRepository extends BaseRepository<AuditLog> {
  constructor(userId: string, supabase: SupabaseClient) {
    super(userId, 'beautyhub_audit_logs', supabase)
  }

  /**
   * 감사 로그 생성
   */
  async createLog(input: AuditLogCreateInput, userId?: string | null): Promise<AuditLog> {
    // 클라이언트 정보 수집
    const ipAddress = typeof window !== 'undefined' ? await this.getClientIP() : null
    const userAgent = typeof window !== 'undefined' ? navigator.userAgent : null

    const payload: Partial<AuditLog> = {
      owner_id: this.userId,
      user_id: userId || this.userId,
      action_type: input.action_type,
      resource_type: input.resource_type,
      resource_id: input.resource_id || null,
      old_data: input.old_data || null,
      new_data: input.new_data || null,
      description: input.description || null,
      ip_address: ipAddress,
      user_agent: userAgent,
    }

    return this.create(payload as AuditLog)
  }

  /**
   * 클라이언트 IP 주소 가져오기 (간단한 방법)
   */
  private async getClientIP(): Promise<string | null> {
    try {
      // 실제로는 서버에서 처리해야 하지만, 클라이언트 측에서는 제한적
      return 'client-side'
    } catch {
      return null
    }
  }

  /**
   * 필터링된 로그 조회
   */
  override async findAll(query?: {
    action_type?: string
    resource_type?: string
    resource_id?: string
    user_id?: string
    from?: string
    to?: string
    limit?: number
    offset?: number
  }): Promise<AuditLog[]> {
    let queryBuilder = this.supabase
      .from(this.tableName)
      .select('*')
      .eq('owner_id', this.userId)

    if (query?.action_type) {
      queryBuilder = queryBuilder.eq('action_type', query.action_type)
    }
    if (query?.resource_type) {
      queryBuilder = queryBuilder.eq('resource_type', query.resource_type)
    }
    if (query?.resource_id) {
      queryBuilder = queryBuilder.eq('resource_id', query.resource_id)
    }
    if (query?.user_id) {
      queryBuilder = queryBuilder.eq('user_id', query.user_id)
    }
    if (query?.from) {
      queryBuilder = queryBuilder.gte('created_at', query.from)
    }
    if (query?.to) {
      queryBuilder = queryBuilder.lte('created_at', query.to)
    }

    queryBuilder = queryBuilder.order('created_at', { ascending: false })

    if (query?.limit) {
      queryBuilder = queryBuilder.limit(query.limit)
    }
    if (query?.offset) {
      queryBuilder = queryBuilder.range(query.offset, query.offset + (query.limit || 100) - 1)
    }

    const { data, error } = await queryBuilder

    if (error) {
      this.handleSupabaseError(error)
    }

    return (data || []) as AuditLog[]
  }
}
