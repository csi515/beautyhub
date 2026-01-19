import { SupabaseClient } from '@supabase/supabase-js'
/**
 * 직원 Repository
 */

import { BaseRepository } from './base.repository'
import type { Staff, StaffCreateInput, StaffUpdateInput } from '@/types/entities'

export class StaffRepository extends BaseRepository<Staff> {
  constructor(userId: string, supabase: SupabaseClient) {
    super(userId, 'staff', supabase)
  }

  protected override getSearchFields(): string[] {
    return ['name', 'email', 'phone', 'role']
  }

  /**
   * 직원 생성
   */
  async createStaff(input: StaffCreateInput): Promise<Staff> {
    const name = String(input.name || '').trim()
    if (!name) {
      throw new Error('name required')
    }

    const payload: Record<string, unknown> = {
      name,
      phone: input.phone || null,
      email: input.email || null,
      role: input.role || null,
      active: input.active !== false,
      status: input.status || 'office',
      skills: input.skills || null,
      profile_image_url: input.profile_image_url || null,
    }

    // notes 필드 활성화
    const notesValue = input.notes
    if (notesValue !== undefined && notesValue !== null && notesValue !== '' && String(notesValue).trim() !== '') {
      payload['notes'] = String(notesValue).trim()
    }

    return this.create(payload as unknown as Staff)
  }

  /**
   * 직원 업데이트
   */
  async updateStaff(id: string, input: StaffUpdateInput): Promise<Staff> {
    const payload: Partial<Staff> = {}

    if (input.name !== undefined) {
      const name = String(input.name).trim()
      if (!name) {
        throw new Error('name cannot be empty')
      }
      payload.name = name
    }

    if (input.phone !== undefined) payload.phone = input.phone || null
    if (input.email !== undefined) payload.email = input.email || null
    if (input.role !== undefined) payload.role = input.role || null
    if (input.status !== undefined) payload.status = input.status || 'office'
    if (input.skills !== undefined) payload.skills = input.skills || null
    if (input.profile_image_url !== undefined) payload.profile_image_url = input.profile_image_url || null

    // notes 필드 활성화
    const notesValue = input.notes
    if (notesValue !== undefined) {
      payload.notes = notesValue ? String(notesValue).trim() : null
    }

    if (input.active !== undefined) payload.active = input.active

    return this.update(id, payload)
  }
}
