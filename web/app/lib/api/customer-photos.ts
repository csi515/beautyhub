/**
 * 고객 사진 관련 API 메서드
 */

import { apiClient } from './client'
import type { CustomerPhoto, CustomerPhotoCreateInput } from '@/types/entities'

export const customerPhotosApi = {
  /**
   * 고객별 사진 목록 조회
   */
  list: (customerId: string, options?: { photo_type?: 'before' | 'after' | 'general'; limit?: number; offset?: number }): Promise<CustomerPhoto[]> => {
    const params = new URLSearchParams()
    if (options?.photo_type) params.set('photo_type', options.photo_type)
    if (options?.limit) params.set('limit', String(options.limit))
    if (options?.offset) params.set('offset', String(options.offset))
    const queryString = params.toString()
    return apiClient.get<CustomerPhoto[]>(`/api/customers/${customerId}/photos${queryString ? `?${queryString}` : ''}`)
  },

  /**
   * 사진 업로드
   */
  upload: async (customerId: string, file: File, input: Omit<CustomerPhotoCreateInput, 'customer_id' | 'photo_url'>): Promise<CustomerPhoto> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('photo_type', input.photo_type)
    if (input.appointment_id) formData.append('appointment_id', input.appointment_id)
    if (input.notes) formData.append('notes', input.notes)
    if (input.taken_at) formData.append('taken_at', input.taken_at)

    const response = await fetch(`/api/customers/${customerId}/photos`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to upload photo' }))
      throw new Error(error.error || 'Failed to upload photo')
    }

    return response.json()
  },

  /**
   * 사진 삭제
   */
  delete: (customerId: string, photoId: string): Promise<{ success: boolean }> => {
    return apiClient.delete<{ success: boolean }>(`/api/customers/${customerId}/photos/${photoId}`)
  },
}
