import { SupabaseClient } from '@supabase/supabase-js'
/**
 * ?덉빟 Repository
 */

import { BaseRepository } from './base.repository'
import type { Appointment, AppointmentCreateInputExtended, AppointmentUpdateInput } from '@/types/entities'
import type { QueryOptions } from './base.repository'
import { appointmentUpdateSchema } from '../api/schemas'

import { z } from 'zod'

export class AppointmentsRepository extends BaseRepository<Appointment> {
  constructor(userId: string, supabase: SupabaseClient) {
    super(userId, 'appointments', supabase)
  }

  /**
   * ?좎쭨 踰붿쐞濡??덉빟 議고쉶
   */
  override async findAll(options: QueryOptions & { from?: string; to?: string; customer_id?: string } = {}): Promise<Appointment[]> {
    if (this.userId === 'demo-user') {
      const { MOCK_APPOINTMENTS } = await import('@/app/lib/mock-data')
      return MOCK_APPOINTMENTS as unknown as Appointment[]
    }

    const {
      limit = 200,
      offset = 0,
      from,
      to,
      customer_id,
      orderBy = 'appointment_date',
      ascending = true,
    } = options

    let query = this.supabase
      .from(this.tableName)
      .select('*')
      .eq('owner_id', this.userId)
      .order(orderBy, { ascending })

    if (from) {
      query = query.gte('appointment_date', from)
    }
    if (to) {
      query = query.lt('appointment_date', to)
    }
    if (customer_id) {
      query = query.eq('customer_id', customer_id)
    }

    const { data, error } = await query.range(offset, offset + limit - 1)

    if (error) {
      this.handleSupabaseError(error)
    }

    return (data || []) as Appointment[]
  }

  /**
   * ?덉빟 ?앹꽦
   */
  async createAppointment(input: AppointmentCreateInputExtended): Promise<Appointment> {
    const payload: Record<string, unknown> = {
      customer_id: input.customer_id || null,
      appointment_date: input.appointment_date,
      status: input.status || null,
    }

    // staff_id媛 紐낆떆?곸쑝濡??쒓났??寃쎌슦?먮쭔 ?ы븿 (?ㅽ궎留덉뿉 ?놁쓣 ???덉쓬)
    if (input.staff_id !== undefined) {
      payload['staff_id'] = input.staff_id || null
    }

    // service_id媛 紐낆떆?곸쑝濡??쒓났??寃쎌슦?먮쭔 ?ы븿 (?ㅽ궎留덉뿉 ?놁쓣 ???덉쓬)
    if (input.service_id !== undefined) {
      payload['service_id'] = input.service_id || null
    }

    // notes??媛믪씠 ?덉쓣 ?뚮쭔 ?ы븿 (?ㅽ궎留덉뿉 ?놁쓣 ???덉쓬)
    const notesValue = input.notes
    if (notesValue !== undefined && notesValue !== null && notesValue !== '' && String(notesValue).trim() !== '') {
      payload['notes'] = String(notesValue).trim()
    }
    if (payload['notes'] === undefined || payload['notes'] === null || payload['notes'] === '' || String(payload['notes']).trim() === '') {
      delete payload['notes']
    }

    // total_price??媛믪씠 ?덉쓣 ?뚮쭔 ?ы븿 (?ㅽ궎留덉뿉 ?놁쓣 ???덉쓬)
    if (input.total_price !== undefined && input.total_price !== null && !Number.isNaN(Number(input.total_price))) {
      payload['total_price'] = Number(input.total_price)
    }
    if (payload['total_price'] === undefined || payload['total_price'] === null || Number.isNaN(Number(payload['total_price']))) {
      delete payload['total_price']
    }

    // no_show 필드 추가
    if ('no_show' in input && input.no_show !== undefined) {
      payload['no_show'] = Boolean(input.no_show)
    }

    return this.create(payload as unknown as Appointment)
  }

  /**
   * 예약 중복 검사 (같은 직원, 겹치는 시간대)
   */
  async checkConflict(
    appointmentDate: string,
    staffId: string | null | undefined,
    durationMinutes: number = 60,
    excludeAppointmentId?: string
  ): Promise<{ hasConflict: boolean; conflictingAppointments: Appointment[] }> {
    if (!staffId) {
      return { hasConflict: false, conflictingAppointments: [] }
    }

    const appointmentStart = new Date(appointmentDate)
    const appointmentEnd = new Date(appointmentStart.getTime() + durationMinutes * 60000)

    let query = this.supabase
      .from(this.tableName)
      .select('*')
      .eq('owner_id', this.userId)
      .eq('staff_id', staffId)
      .in('status', ['scheduled', 'pending'])

    if (excludeAppointmentId) {
      query = query.neq('id', excludeAppointmentId)
    }

    const { data, error } = await query

    if (error) {
      this.handleSupabaseError(error)
    }

    const appointments = (data || []) as Appointment[]
    const conflicting: Appointment[] = []

    // 각 예약의 서비스 정보와 소요 시간 조회
    for (const appointment of appointments) {
      let existingDuration = 60
      if (appointment.service_id) {
        const { data: product } = await this.supabase
          .from('products')
          .select('duration_minutes')
          .eq('id', appointment.service_id)
          .single()
        if (product && product.duration_minutes) {
          existingDuration = product.duration_minutes
        }
      }

      const existingStart = new Date(appointment.appointment_date)
      const existingEnd = new Date(existingStart.getTime() + existingDuration * 60000)

      // 시간대가 겹치는지 확인
      if (
        (appointmentStart >= existingStart && appointmentStart < existingEnd) ||
        (appointmentEnd > existingStart && appointmentEnd <= existingEnd) ||
        (appointmentStart <= existingStart && appointmentEnd >= existingEnd)
      ) {
        conflicting.push(appointment)
      }
    }

    return {
      hasConflict: conflicting.length > 0,
      conflictingAppointments: conflicting,
    }
  }

  /**
   * ?덉빟 ?낅뜲?댄듃
   */
  async updateAppointment(id: string, input: AppointmentUpdateInput | z.infer<typeof appointmentUpdateSchema>): Promise<Appointment> {
    const payload: Record<string, unknown> = {}

    if (input.customer_id !== undefined) {
      payload['customer_id'] = input.customer_id ?? null
    }
    if (input.staff_id !== undefined) {
      payload['staff_id'] = input.staff_id ?? null
    }
    if (input.appointment_date !== undefined) {
      payload['appointment_date'] = input.appointment_date
    }
    if (input.status !== undefined && input.status !== null) {
      payload['status'] = input.status
    }

    // service_id媛 紐낆떆?곸쑝濡??쒓났??寃쎌슦?먮쭔 ?낅뜲?댄듃 (?ㅽ궎留덉뿉 ?놁쓣 ???덉쓬)
    if ('service_id' in input && input.service_id !== undefined) {
      payload['service_id'] = input.service_id || null
    }

    // notes??媛믪씠 ?덉쓣 ?뚮쭔 ?낅뜲?댄듃 (?ㅽ궎留덉뿉 ?놁쓣 ???덉쓬)
    if ('notes' in input) {
      const notesValue = input.notes
      if (notesValue !== undefined && notesValue !== null && notesValue !== '' && String(notesValue).trim() !== '') {
        payload['notes'] = String(notesValue).trim()
      }
    }

    // total_price??媛믪씠 ?덉쓣 ?뚮쭔 ?낅뜲?댄듃 (?ㅽ궎留덉뿉 ?놁쓣 ???덉쓬)
    if ('total_price' in input && input.total_price !== undefined && input.total_price !== null && !Number.isNaN(Number(input.total_price))) {
      payload['total_price'] = Number(input.total_price)
    }

    // no_show 필드 업데이트
    if ('no_show' in input && input.no_show !== undefined) {
      payload['no_show'] = Boolean(input.no_show)
    }

    return this.update(id, payload)
  }

  /**
   * 노쇼 처리
   */
  async markAsNoShow(id: string): Promise<Appointment> {
    return this.update(id, { no_show: true } as Partial<Appointment>)
  }
}

