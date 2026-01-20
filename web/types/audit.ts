/**
 * 감사 로그 관련 타입 정의
 */

export type AuditActionType = 'create' | 'update' | 'delete' | 'view' | 'export' | 'login' | 'logout' | 'backup' | 'restore'

export type AuditResourceType = 
  | 'customer' 
  | 'appointment' 
  | 'transaction' 
  | 'product' 
  | 'staff' 
  | 'expense'
  | 'inventory'
  | 'payroll'
  | 'settings'
  | 'system'

/**
 * 감사 로그 엔티티
 */
export interface AuditLog {
  id: string
  owner_id: string
  user_id?: string | null
  action_type: AuditActionType
  resource_type: AuditResourceType
  resource_id?: string | null
  old_data?: any | null
  new_data?: any | null
  description?: string | null
  ip_address?: string | null
  user_agent?: string | null
  created_at?: string
}

/**
 * 감사 로그 생성 DTO
 */
export interface AuditLogCreateInput {
  action_type: AuditActionType
  resource_type: AuditResourceType
  resource_id?: string | null
  old_data?: any | null
  new_data?: any | null
  description?: string | null
}
