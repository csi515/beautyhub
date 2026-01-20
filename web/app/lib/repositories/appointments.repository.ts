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
    super(userId, 'beautyhub_appointments', supabase)
  }

  /**
   * ?좎쭨 踰붿쐞濡??덉빟 議고쉶
   */
  override async findAll(options: QueryOptions & { from?: string; to?: string } = {}): Promise<Appointment[]> {
    if (this.userId === 'demo-user') {
      const { MOCK_APPOINTMENTS } = await import('@/app/lib/mock-data')
      return MOCK_APPOINTMENTS as unknown as Appointment[]
    }

    const {
      limit = 200,
      offset = 0,
      from,
      to,
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

    return this.create(payload as unknown as Appointment)
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

    return this.update(id, payload)
  }
}

