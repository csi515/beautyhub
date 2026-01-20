/**
 * 고객 타임라인 API
 */

import { apiClient } from '../client'

export interface TimelineEvent {
  id: string
  type: 'appointment' | 'transaction' | 'points' | 'product'
  date: string
  title: string
  description?: string
  metadata?: any
}

export interface TimelineResponse {
  events: TimelineEvent[]
  total: number
}

export const customerTimelineApi = {
  /**
   * 고객 타임라인 조회
   */
  getTimeline: (customerId: string): Promise<TimelineResponse> => {
    return apiClient.get<TimelineResponse>(`/api/customers/${customerId}/timeline`)
  },
}
