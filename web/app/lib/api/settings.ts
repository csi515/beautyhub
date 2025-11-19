/**
 * 설정 관련 API 메서드
 */

import { apiClient } from './client'
import type { AppSettings, SettingsUpdateInput } from '@/types/settings'

export const settingsApi = {
  /**
   * 설정 조회
   */
  get: async (): Promise<AppSettings> => {
    return apiClient.get<AppSettings>('/api/settings')
  },

  /**
   * 설정 업데이트
   */
  update: async (input: SettingsUpdateInput): Promise<AppSettings> => {
    return apiClient.put<AppSettings>('/api/settings', input)
  },
}

