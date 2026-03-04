import { SupabaseClient } from '@supabase/supabase-js'
import { BaseRepository } from './base.repository'
import type { AppointmentReminder } from '@/types/entities'

export class AppointmentRemindersRepository extends BaseRepository<AppointmentReminder> {
  constructor(userId: string, supabase: SupabaseClient) {
    super(userId, 'appointment_reminders', supabase)
  }

  /**
   * 예약별 리마인더 조회
   */
  async findByAppointmentId(appointmentId: string): Promise<AppointmentReminder[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('owner_id', this.userId)
      .eq('appointment_id', appointmentId)
      .order('reminder_type', { ascending: true })

    if (error) {
      this.handleSupabaseError(error)
    }

    return (data || []) as AppointmentReminder[]
  }

  /**
   * 미전송 리마인더 조회
   */
  async findUnsent(upcoming: boolean = false): Promise<AppointmentReminder[]> {
    let query = this.supabase
      .from(this.tableName)
      .select('*')
      .eq('owner_id', this.userId)
      .is('sent_at', null)

    if (upcoming) {
      // 예약일이 미래인 경우만
      const now = new Date().toISOString()
      query = query
        .select(`
          *,
          appointments!appointment_reminders_appointment_id_fkey (
            appointment_date
          )
        `)
        .gt('appointments.appointment_date', now)
    }

    const { data, error } = await query.order('created_at', { ascending: true })

    if (error) {
      this.handleSupabaseError(error)
    }

    return (data || []) as AppointmentReminder[]
  }

  /**
   * 리마인더 생성
   */
  async createReminder(appointmentId: string, reminderType: '1_day_before' | '3_hours_before' | 'on_day'): Promise<AppointmentReminder> {
    const payload: Partial<AppointmentReminder> = {
      appointment_id: appointmentId,
      reminder_type: reminderType,
      sent_at: null,
    }

    return this.create(payload)
  }

  /**
   * 리마인더 전송 처리
   */
  async markAsSent(id: string): Promise<AppointmentReminder> {
    return this.update(id, { sent_at: new Date().toISOString() })
  }

  /**
   * 예약에 대한 모든 리마인더 생성
   */
  async createRemindersForAppointment(appointmentId: string): Promise<AppointmentReminder[]> {
    const reminders: AppointmentReminder[] = []
    const types: Array<'1_day_before' | '3_hours_before' | 'on_day'> = ['1_day_before', '3_hours_before', 'on_day']

    for (const type of types) {
      const reminder = await this.createReminder(appointmentId, type)
      reminders.push(reminder)
    }

    return reminders
  }
}
