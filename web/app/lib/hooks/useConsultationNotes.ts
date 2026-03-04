/**
 * 고객 상담 일지 관련 React Query 훅
 */

import { useAppQuery, useAppMutation, queryKeys } from './useQuery'
import { consultationNotesApi } from '../api/consultation-notes'
import type { ConsultationNote, ConsultationNoteCreateInput, ConsultationNoteUpdateInput } from '@/types/entities'
import { useQueryClient } from '@tanstack/react-query'

/**
 * 고객별 상담 일지 목록 조회
 */
export function useConsultationNotes(customerId: string | null, options?: { limit?: number; offset?: number; orderBy?: string; ascending?: boolean }) {
  return useAppQuery<ConsultationNote[]>({
    queryKey: queryKeys.consultationNotes.list(customerId ?? '', options),
    queryFn: () => {
      if (!customerId) throw new Error('Customer ID is required')
      return consultationNotesApi.list(customerId, options)
    },
    enabled: !!customerId,
  })
}

/**
 * 상담 일지 생성
 */
export function useCreateConsultationNote(customerId: string) {
  const queryClient = useQueryClient()

  return useAppMutation<ConsultationNote, ConsultationNoteCreateInput>({
    mutationFn: (input) => consultationNotesApi.create(customerId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.consultationNotes.list(customerId) })
    },
  })
}

/**
 * 상담 일지 수정
 */
export function useUpdateConsultationNote(customerId: string) {
  const queryClient = useQueryClient()

  return useAppMutation<ConsultationNote, { noteId: string; input: ConsultationNoteUpdateInput }>({
    mutationFn: ({ noteId, input }) => consultationNotesApi.update(customerId, noteId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.consultationNotes.list(customerId) })
    },
  })
}

/**
 * 상담 일지 삭제
 */
export function useDeleteConsultationNote(customerId: string) {
  const queryClient = useQueryClient()

  return useAppMutation<{ success: boolean }, string>({
    mutationFn: (noteId) => consultationNotesApi.delete(customerId, noteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.consultationNotes.list(customerId) })
    },
  })
}
