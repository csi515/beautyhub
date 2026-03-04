/**
 * 고객 상담 일지 관련 API 메서드
 */

import { apiClient } from './client'
import type { ConsultationNote, ConsultationNoteCreateInput, ConsultationNoteUpdateInput } from '@/types/entities'

export const consultationNotesApi = {
  /**
   * 고객별 상담 일지 목록 조회
   */
  list: (customerId: string, options?: { limit?: number; offset?: number; orderBy?: string; ascending?: boolean }): Promise<ConsultationNote[]> => {
    const params = new URLSearchParams()
    if (options?.limit) params.set('limit', String(options.limit))
    if (options?.offset) params.set('offset', String(options.offset))
    if (options?.orderBy) params.set('orderBy', options.orderBy)
    if (options?.ascending) params.set('ascending', String(options.ascending))
    const queryString = params.toString()
    return apiClient.get<ConsultationNote[]>(`/api/customers/${customerId}/consultation-notes${queryString ? `?${queryString}` : ''}`)
  },

  /**
   * 상담 일지 생성
   */
  create: (customerId: string, input: ConsultationNoteCreateInput): Promise<ConsultationNote> => {
    return apiClient.post<ConsultationNote>(`/api/customers/${customerId}/consultation-notes`, input)
  },

  /**
   * 상담 일지 수정
   */
  update: (customerId: string, noteId: string, input: ConsultationNoteUpdateInput): Promise<ConsultationNote> => {
    return apiClient.patch<ConsultationNote>(`/api/customers/${customerId}/consultation-notes/${noteId}`, input)
  },

  /**
   * 상담 일지 삭제
   */
  delete: (customerId: string, noteId: string): Promise<{ success: boolean }> => {
    return apiClient.delete<{ success: boolean }>(`/api/customers/${customerId}/consultation-notes/${noteId}`)
  },
}
