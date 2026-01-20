/**
 * 재고 관련 타입 정의
 */

/**
 * 제품 배치/유통기한 엔티티
 */
export interface ProductBatch {
  id: string
  owner_id: string
  product_id: string
  batch_number: string
  quantity: number
  expiry_date: string // YYYY-MM-DD
  purchase_date?: string | null // YYYY-MM-DD
  notes?: string | null
  created_at?: string
  updated_at?: string
}

/**
 * 배치 생성/수정 DTO
 */
export interface ProductBatchCreateInput {
  product_id: string
  batch_number: string
  quantity: number
  expiry_date: string
  purchase_date?: string | null
  notes?: string | null
}

export interface ProductBatchUpdateInput {
  quantity?: number
  expiry_date?: string
  purchase_date?: string | null
  notes?: string | null
}
