/**
 * 고객 Repository
 */

import { BaseRepository } from './base.repository'
import type { Customer, CustomerCreateInput, CustomerUpdateInput } from '@/types/entities'

export class CustomersRepository extends BaseRepository<Customer> {
  constructor(userId: string, supabase: any) {
    super(userId, 'customers', supabase)
  }

  protected override getSearchFields(): string[] {
    return ['name', 'email', 'phone']
  }

  /**
   * 고객 생성
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

    // features는 값이 있을 때만 포함 (스키마에 없을 수 있음)
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
    // features는 값이 있을 때만 업데이트 (스키마에 없을 수 있음)
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

