import { SupabaseClient } from '@supabase/supabase-js'
import { BaseRepository } from './base.repository'
import type { CustomerPhoto, CustomerPhotoCreateInput, CustomerPhotoUpdateInput } from '@/types/entities'

export class CustomerPhotosRepository extends BaseRepository<CustomerPhoto> {
  constructor(userId: string, supabase: SupabaseClient) {
    super(userId, 'customer_photos', supabase)
  }

  /**
   * 고객별 사진 조회
   */
  async findByCustomerId(customerId: string, options: { photo_type?: 'before' | 'after' | 'general'; limit?: number; offset?: number } = {}): Promise<CustomerPhoto[]> {
    const { photo_type, limit = 100, offset = 0 } = options

    let query = this.supabase
      .from(this.tableName)
      .select('*')
      .eq('owner_id', this.userId)
      .eq('customer_id', customerId)
      .order('taken_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })

    if (photo_type) {
      query = query.eq('photo_type', photo_type)
    }

    const { data, error } = await query.range(offset, offset + limit - 1)

    if (error) {
      this.handleSupabaseError(error)
    }

    return (data || []) as CustomerPhoto[]
  }

  /**
   * 예약별 사진 조회
   */
  async findByAppointmentId(appointmentId: string): Promise<CustomerPhoto[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('owner_id', this.userId)
      .eq('appointment_id', appointmentId)
      .order('photo_type', { ascending: true })
      .order('created_at', { ascending: false })

    if (error) {
      this.handleSupabaseError(error)
    }

    return (data || []) as CustomerPhoto[]
  }

  /**
   * 사진 생성
   */
  async createPhoto(input: CustomerPhotoCreateInput): Promise<CustomerPhoto> {
    const photo_url = String(input.photo_url || '').trim()
    if (!photo_url) {
      throw new Error('photo_url required')
    }

    if (!['before', 'after', 'general'].includes(input.photo_type)) {
      throw new Error('invalid photo_type')
    }

    const payload: Partial<CustomerPhoto> = {
      customer_id: input.customer_id,
      appointment_id: input.appointment_id || null,
      photo_url,
      photo_type: input.photo_type,
      notes: input.notes || null,
      taken_at: input.taken_at || null,
    }

    return this.create(payload)
  }

  /**
   * 사진 수정
   */
  async updatePhoto(id: string, input: CustomerPhotoUpdateInput): Promise<CustomerPhoto> {
    const payload: Partial<CustomerPhoto> = {}

    if (input.photo_url !== undefined) {
      const photo_url = String(input.photo_url).trim()
      if (!photo_url) {
        throw new Error('photo_url cannot be empty')
      }
      payload.photo_url = photo_url
    }

    if (input.photo_type !== undefined) {
      if (!['before', 'after', 'general'].includes(input.photo_type)) {
        throw new Error('invalid photo_type')
      }
      payload.photo_type = input.photo_type
    }

    if (input.notes !== undefined) {
      payload.notes = input.notes || null
    }

    if (input.taken_at !== undefined) {
      payload.taken_at = input.taken_at || null
    }

    if (input.appointment_id !== undefined) {
      payload.appointment_id = input.appointment_id || null
    }

    return this.update(id, payload)
  }
}
