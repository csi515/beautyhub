import { SupabaseClient } from '@supabase/supabase-js'
import { BaseRepository } from './base.repository'
import type { AppointmentTemplate, AppointmentTemplateCreateInput, AppointmentTemplateUpdateInput } from '@/types/entities'

export class AppointmentTemplatesRepository extends BaseRepository<AppointmentTemplate> {
  constructor(userId: string, supabase: SupabaseClient) {
    super(userId, 'appointment_templates', supabase)
  }

  protected override getSearchFields(): string[] {
    return ['name']
  }

  /**
   * 템플릿 생성
   */
  async createTemplate(input: AppointmentTemplateCreateInput): Promise<AppointmentTemplate> {
    const name = String(input.name || '').trim()
    if (!name) {
      throw new Error('name required')
    }

    const payload: Partial<AppointmentTemplate> = {
      name,
      service_id: input.service_id || null,
      duration_minutes: input.duration_minutes || null,
      default_price: input.default_price || null,
      default_notes: input.default_notes || null,
    }

    return this.create(payload)
  }

  /**
   * 템플릿 수정
   */
  async updateTemplate(id: string, input: AppointmentTemplateUpdateInput): Promise<AppointmentTemplate> {
    const payload: Partial<AppointmentTemplate> = {}

    if (input.name !== undefined) {
      const name = String(input.name).trim()
      if (!name) {
        throw new Error('name cannot be empty')
      }
      payload.name = name
    }

    if (input.service_id !== undefined) {
      payload.service_id = input.service_id || null
    }

    if (input.duration_minutes !== undefined) {
      payload.duration_minutes = input.duration_minutes || null
    }

    if (input.default_price !== undefined) {
      payload.default_price = input.default_price || null
    }

    if (input.default_notes !== undefined) {
      payload.default_notes = input.default_notes || null
    }

    return this.update(id, payload)
  }
}
