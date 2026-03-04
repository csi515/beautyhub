/**
 * 예약 템플릿 관련 React Query 훅
 */

import { useAppQuery, useAppMutation, queryKeys } from './useQuery'
import { appointmentTemplatesApi } from '../api/appointment-templates'
import type { AppointmentTemplate, AppointmentTemplateCreateInput, AppointmentTemplateUpdateInput } from '@/types/entities'
import { useQueryClient } from '@tanstack/react-query'

/**
 * 템플릿 목록 조회
 */
export function useAppointmentTemplates(options?: { limit?: number; offset?: number; search?: string }) {
  return useAppQuery<AppointmentTemplate[]>({
    queryKey: queryKeys.appointmentTemplates.list(options),
    queryFn: () => appointmentTemplatesApi.list(options),
  })
}

/**
 * 템플릿 생성
 */
export function useCreateAppointmentTemplate() {
  const queryClient = useQueryClient()

  return useAppMutation<AppointmentTemplate, AppointmentTemplateCreateInput>({
    mutationFn: (input) => appointmentTemplatesApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.appointmentTemplates.lists() })
    },
  })
}

/**
 * 템플릿 수정
 */
export function useUpdateAppointmentTemplate() {
  const queryClient = useQueryClient()

  return useAppMutation<AppointmentTemplate, { id: string; input: AppointmentTemplateUpdateInput }>({
    mutationFn: ({ id, input }) => appointmentTemplatesApi.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.appointmentTemplates.lists() })
    },
  })
}

/**
 * 템플릿 삭제
 */
export function useDeleteAppointmentTemplate() {
  const queryClient = useQueryClient()

  return useAppMutation<{ success: boolean }, string>({
    mutationFn: (id) => appointmentTemplatesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.appointmentTemplates.lists() })
    },
  })
}
