/**
 * 예약 리마인더 관련 API 메서드
 */

import { apiClient } from './client'
import type { AppointmentReminder } from '@/types/entities'

export const appointmentRemindersApi = {
  /**
   * 리마인더 목록 조회
   */
  list: (options?: { upcoming?: boolean; appointment_id?: string }): Promise<AppointmentReminder[]> => {
    const params = new URLSearchParams()
    if (options?.upcoming) params.set('upcoming', String(options.upcoming))
    if (options?.appointment_id) params.set('appointment_id', options.appointment_id)
    const queryString = params.toString()
    return apiClient.get<AppointmentReminder[]>(`/api/appointments/reminders${queryString ? `?${queryString}` : ''}`)
  },

  /**
   * 리마인더 확인 처리
   */
  markAsSent: (reminderId: string): Promise<AppointmentReminder> => {
    return apiClient.patch<AppointmentReminder>(`/api/appointments/reminders/${reminderId}`, {})
  },
}
