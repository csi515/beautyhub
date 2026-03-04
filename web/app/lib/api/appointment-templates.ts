/**
 * 예약 템플릿 관련 API 메서드
 */

import { apiClient } from './client'
import type { AppointmentTemplate, AppointmentTemplateCreateInput, AppointmentTemplateUpdateInput } from '@/types/entities'

export const appointmentTemplatesApi = {
  /**
   * 템플릿 목록 조회
   */
  list: (options?: { limit?: number; offset?: number; search?: string }): Promise<AppointmentTemplate[]> => {
    const params = new URLSearchParams()
    if (options?.limit) params.set('limit', String(options.limit))
    if (options?.offset) params.set('offset', String(options.offset))
    if (options?.search) params.set('search', options.search)
    const queryString = params.toString()
    return apiClient.get<AppointmentTemplate[]>(`/api/appointment-templates${queryString ? `?${queryString}` : ''}`)
  },

  /**
   * 템플릿 생성
   */
  create: (input: AppointmentTemplateCreateInput): Promise<AppointmentTemplate> => {
    return apiClient.post<AppointmentTemplate>('/api/appointment-templates', input)
  },

  /**
   * 템플릿 수정
   */
  update: (id: string, input: AppointmentTemplateUpdateInput): Promise<AppointmentTemplate> => {
    return apiClient.patch<AppointmentTemplate>(`/api/appointment-templates/${id}`, input)
  },

  /**
   * 템플릿 삭제
   */
  delete: (id: string): Promise<{ success: boolean }> => {
    return apiClient.delete<{ success: boolean }>(`/api/appointment-templates/${id}`)
  },
}
