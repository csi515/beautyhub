/**
 * 고객 관련 타입 정의
 */

export interface CustomerFilters {
  statusFilter: 'all' | 'active' | 'inactive'
  vipFilter: 'all' | 'vip' | 'regular'
  minPoints: string
  maxPoints: string
}

/**
 * 고객 페이지 상태 타입
 */
export interface CustomerPageState {
  loading: boolean
  error: string
  selectedCustomerIds: string[]
  pointsByCustomer: Record<string, number>
}

/**
 * 고객 세그먼트
 */
export type CustomerSegment = 'VIP' | '우수' | '일반' | '휴면' | '잠재VIP' | '이탈위험'

/**
 * RFM 분석 결과
 */
export interface RFMAnalysis {
  customer_id: string
  customer_name: string
  customer_phone?: string | null
  customer_email?: string | null
  recency: number
  frequency: number
  monetary: number
  r_score: number
  f_score: number
  m_score: number
  segment: CustomerSegment
  transaction_count: number
  visit_count: number
  last_transaction_date: number | null
}
