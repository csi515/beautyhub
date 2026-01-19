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


