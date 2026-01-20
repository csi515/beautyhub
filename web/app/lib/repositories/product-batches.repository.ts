import { SupabaseClient } from '@supabase/supabase-js'
import { BaseRepository } from './base.repository'
import type { ProductBatch, ProductBatchCreateInput, ProductBatchUpdateInput } from '@/types/inventory'
import { format } from 'date-fns'

export class ProductBatchesRepository extends BaseRepository<ProductBatch> {
  constructor(userId: string, supabase: SupabaseClient) {
    super(userId, 'beautyhub_product_batches', supabase)
  }

  /**
   * 배치 생성
   */
  async createBatch(input: ProductBatchCreateInput): Promise<ProductBatch> {
    const payload = {
      owner_id: this.userId,
      product_id: input.product_id,
      batch_number: input.batch_number,
      quantity: input.quantity,
      expiry_date: input.expiry_date,
      purchase_date: input.purchase_date || null,
      notes: input.notes || null,
    }
    return this.create(payload as unknown as ProductBatch)
  }

  /**
   * 제품별 배치 조회
   */
  async findByProductId(productId: string): Promise<ProductBatch[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('owner_id', this.userId)
      .eq('product_id', productId)
      .order('expiry_date', { ascending: true })

    if (error) {
      this.handleSupabaseError(error)
    }

    return (data || []) as ProductBatch[]
  }

  /**
   * 유통기한 임박 배치 조회
   */
  async findExpiringSoon(days: number = 30): Promise<ProductBatch[]> {
    const today = new Date()
    const thresholdDate = new Date(today)
    thresholdDate.setDate(today.getDate() + days)

    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('owner_id', this.userId)
      .gte('expiry_date', format(today, 'yyyy-MM-dd'))
      .lte('expiry_date', format(thresholdDate, 'yyyy-MM-dd'))
      .gt('quantity', 0)
      .order('expiry_date', { ascending: true })

    if (error) {
      this.handleSupabaseError(error)
    }

    return (data || []) as ProductBatch[]
  }

  /**
   * 배치 업데이트
   */
  async updateBatch(id: string, input: ProductBatchUpdateInput): Promise<ProductBatch> {
    return this.update(id, input as Partial<ProductBatch>)
  }
}
