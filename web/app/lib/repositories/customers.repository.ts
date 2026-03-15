import { SupabaseClient } from '@supabase/supabase-js'
/**
 * 怨좉컼 Repository
 */

import { BaseRepository } from './base.repository'
import type { Customer, CustomerCreateInput, CustomerUpdateInput } from '@/types/entities'

export class CustomersRepository extends BaseRepository<Customer> {
  constructor(userId: string, supabase: SupabaseClient) {
    super(userId, 'customers', supabase)
  }

  protected override getSearchFields(): string[] {
    return ['name', 'email', 'phone']
  }

  /**
   * 怨좉컼 ?앹꽦
   */
  async createCustomer(input: CustomerCreateInput): Promise<Customer> {
    const name = String(input.name || '').trim()
    if (!name) {
      throw new Error('name required')
    }

    const payload: Partial<Customer> = {
      name,
      phone: input.phone || null,
      email: input.email || null,
      address: input.address || null,
    }

    // features??媛믪씠 ?덉쓣 ?뚮쭔 ?ы븿 (?ㅽ궎留덉뿉 ?놁쓣 ???덉쓬)
    const featuresValue = input.features
    if (featuresValue !== undefined) {
      if (featuresValue === null) {
        payload.features = null
      } else {
        const trimmed = String(featuresValue).trim()
        payload.features = trimmed ? trimmed : null
      }
    }

    return this.create(payload)
  }

  /**
   * 怨좉컼 ?낅뜲?댄듃
   */
  /**
   * 장기 미방문 고객 조회
   */
  async findInactiveCustomers(days: number): Promise<Customer[]> {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)
    const cutoff = cutoffDate.toISOString()

    // 최근 방문 고객 ID 조회
    const { data: recentAppts } = await this.supabase
      .from('appointments')
      .select('customer_id')
      .eq('owner_id', this.userId)
      .gte('appointment_date', cutoff)
      .not('customer_id', 'is', null)

    const recentCustomerIds = new Set(
      (recentAppts ?? []).map((a: Record<string, unknown>) => a['customer_id'] as string)
    )

    // 전체 고객 조회 후 최근 방문 고객 제외
    const allCustomers = await this.findAll({ limit: 2000 })
    return allCustomers.filter(c => !recentCustomerIds.has(c.id))
  }

  /**
   * 고객 업데이트
   */
  async updateCustomer(id: string, input: CustomerUpdateInput): Promise<Customer> {
    const payload: Partial<Customer> = {}

    if (input.name !== undefined) {
      const name = String(input.name).trim()
      if (!name) {
        throw new Error('name cannot be empty')
      }
      payload.name = name
    }

    if (input.phone !== undefined) payload.phone = input.phone || null
    if (input.email !== undefined) payload.email = input.email || null
    if (input.address !== undefined) payload.address = input.address || null
    if (input.active !== undefined) payload.active = input.active
    // features??媛믪씠 ?덉쓣 ?뚮쭔 ?낅뜲?댄듃 (?ㅽ궎留덉뿉 ?놁쓣 ???덉쓬)
    const featuresValue = input.features
    if (featuresValue !== undefined) {
      if (featuresValue === null) {
        payload.features = null
      } else {
        const trimmed = String(featuresValue).trim()
        payload.features = trimmed ? trimmed : null
      }
    }

    return this.update(id, payload)
  }
}


