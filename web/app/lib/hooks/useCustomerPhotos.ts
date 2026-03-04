/**
 * 고객 사진 관련 React Query 훅
 */

import { useAppQuery, useAppMutation, queryKeys } from './useQuery'
import { customerPhotosApi } from '../api/customer-photos'
import type { CustomerPhoto, CustomerPhotoCreateInput } from '@/types/entities'
import { useQueryClient } from '@tanstack/react-query'

/**
 * 고객별 사진 목록 조회
 */
export function useCustomerPhotos(customerId: string | null, options?: { photo_type?: 'before' | 'after' | 'general'; limit?: number; offset?: number }) {
  return useAppQuery<CustomerPhoto[]>({
    queryKey: queryKeys.customerPhotos.list(customerId ?? '', options),
    queryFn: () => {
      if (!customerId) throw new Error('Customer ID is required')
      return customerPhotosApi.list(customerId, options)
    },
    enabled: !!customerId,
  })
}

/**
 * 사진 업로드
 */
export function useUploadCustomerPhoto(customerId: string) {
  const queryClient = useQueryClient()

  return useAppMutation<CustomerPhoto, { file: File; input: Omit<CustomerPhotoCreateInput, 'customer_id' | 'photo_url'> }>({
    mutationFn: ({ file, input }) => customerPhotosApi.upload(customerId, file, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customerPhotos.list(customerId) })
    },
  })
}

/**
 * 사진 삭제
 */
export function useDeleteCustomerPhoto(customerId: string) {
  const queryClient = useQueryClient()

  return useAppMutation<{ success: boolean }, string>({
    mutationFn: (photoId) => customerPhotosApi.delete(customerId, photoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customerPhotos.list(customerId) })
    },
  })
}
