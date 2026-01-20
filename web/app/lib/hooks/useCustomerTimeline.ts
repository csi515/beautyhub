/**
 * 고객 타임라인 훅
 */

import { useState, useEffect } from 'react'
import { customerTimelineApi, type TimelineEvent } from '../api/customers/timeline'

export interface UseCustomerTimelineReturn {
  events: TimelineEvent[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

/**
 * 고객 타임라인을 조회하는 훅
 */
export function useCustomerTimeline(customerId: string | null, enabled: boolean = true): UseCustomerTimelineReturn {
  const [events, setEvents] = useState<TimelineEvent[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTimeline = async () => {
    if (!customerId || !enabled) {
      setEvents([])
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await customerTimelineApi.getTimeline(customerId)
      setEvents(data.events || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '타임라인 조회에 실패했습니다.'
      setError(errorMessage)
      console.error('타임라인 조회 실패:', err)
      setEvents([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (customerId && enabled) {
      fetchTimeline()
    }
  }, [customerId, enabled])

  return {
    events,
    loading,
    error,
    refetch: fetchTimeline,
  }
}
