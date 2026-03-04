import { SupabaseClient } from '@supabase/supabase-js'
import { BaseRepository } from './base.repository'
import type { ConsultationNote, ConsultationNoteCreateInput, ConsultationNoteUpdateInput } from '@/types/entities'

export class ConsultationNotesRepository extends BaseRepository<ConsultationNote> {
  constructor(userId: string, supabase: SupabaseClient) {
    super(userId, 'consultation_notes', supabase)
  }

  /**
   * 고객별 상담 일지 조회
   */
  async findByCustomerId(customerId: string, options: { limit?: number; offset?: number; orderBy?: string; ascending?: boolean } = {}): Promise<ConsultationNote[]> {
    const { limit = 50, offset = 0, orderBy = 'note_date', ascending = false } = options

    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('owner_id', this.userId)
      .eq('customer_id', customerId)
      .order(orderBy, { ascending })
      .range(offset, offset + limit - 1)

    if (error) {
      this.handleSupabaseError(error)
    }

    return (data || []) as ConsultationNote[]
  }

  /**
   * 예약별 상담 일지 조회
   */
  async findByAppointmentId(appointmentId: string): Promise<ConsultationNote[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('owner_id', this.userId)
      .eq('appointment_id', appointmentId)
      .order('note_date', { ascending: false })

    if (error) {
      this.handleSupabaseError(error)
    }

    return (data || []) as ConsultationNote[]
  }

  /**
   * 상담 일지 생성
   */
  async createNote(input: ConsultationNoteCreateInput): Promise<ConsultationNote> {
    const content = String(input.content || '').trim()
    if (!content) {
      throw new Error('content required')
    }

    const noteDate: string = input.note_date ?? new Date().toISOString().substring(0, 10)
    const payload: Partial<ConsultationNote> = {
      customer_id: input.customer_id,
      appointment_id: input.appointment_id ?? null,
      note_date: noteDate,
      content,
    }

    return this.create(payload)
  }

  /**
   * 상담 일지 수정
   */
  async updateNote(id: string, input: ConsultationNoteUpdateInput): Promise<ConsultationNote> {
    const payload: Partial<ConsultationNote> = {}

    if (input.content !== undefined) {
      const content = String(input.content).trim()
      if (!content) {
        throw new Error('content cannot be empty')
      }
      payload.content = content
    }

    if (input.note_date !== undefined) {
      payload.note_date = input.note_date
    }

    if (input.appointment_id !== undefined) {
      payload.appointment_id = input.appointment_id || null
    }

    return this.update(id, payload)
  }
}
