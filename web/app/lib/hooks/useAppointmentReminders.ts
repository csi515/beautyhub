/**
 * 예약 리마인더 관련 React Query 훅
 */

import { useAppQuery, useAppMutation, queryKeys } from './useQuery'
import { appointmentRemindersApi } from '../api/appointment-reminders'
import type { AppointmentReminder } from '@/types/entities'
import { useQueryClient } from '@tanstack/react-query'

/**
 * 리마인더 목록 조회
 */
export function useAppointmentReminders(options?: { upcoming?: boolean; appointment_id?: string }) {
  return useAppQuery<AppointmentReminder[]>({
    queryKey: queryKeys.appointmentReminders.list(options),
    queryFn: () => appointmentRemindersApi.list(options),
  })
}

/**
 * 리마인더 확인 처리
 */
export function useMarkReminderAsSent() {
  const queryClient = useQueryClient()

  return useAppMutation<AppointmentReminder, string>({
    mutationFn: (reminderId) => appointmentRemindersApi.markAsSent(reminderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.appointmentReminders.lists() })
    },
  })
}
