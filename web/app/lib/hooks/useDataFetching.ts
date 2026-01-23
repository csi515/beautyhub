'use client'

/**
 * 데이터 로딩 패턴 통합 훅
 * usePageData, usePageController, useApi 통합
 * 일관된 데이터 로딩 패턴 제공
 */

import { useState, useEffect, useCallback } from 'react'

export interface UseDataFetchingOptions<T> {
  fetchFn: () => Promise<T>
  immediate?: boolean
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
  retry?: {
    enabled?: boolean
    maxAttempts?: number
    delay?: number
  }
}

export interface UseDataFetchingReturn<T> {
  data: T | null
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
  reset: () => void
}

/**
 * 데이터 로딩 패턴 통합 훅
 * 
 * UX 규칙:
 * - 자동 retry (network error 시)
 * - 로딩 상태 일관성
 * - 에러 타입별 처리
 * 
 * @example
 * const { data, loading, error } = useDataFetching({
 *   fetchFn: () => customersApi.list(),
 *   retry: { enabled: true, maxAttempts: 3 }
 * })
 */
export function useDataFetching<T>(
  options: UseDataFetchingOptions<T>
): UseDataFetchingReturn<T> {
  const {
    fetchFn,
    immediate = true,
    onSuccess,
    onError,
    retry = { enabled: false, maxAttempts: 3, delay: 1000 },
  } = options

  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(immediate)
  const [error, setError] = useState<Error | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await fetchFn()
      setData(result)
      setRetryCount(0)
      onSuccess?.(result)
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      setError(error)
      onError?.(error)

      // Retry 로직 (network error 시)
      if (retry.enabled && retryCount < (retry.maxAttempts ?? 3)) {
        const isNetworkError =
          error.message.toLowerCase().includes('network') ||
          error.message.toLowerCase().includes('fetch') ||
          error.message.toLowerCase().includes('connection')

        if (isNetworkError) {
          setRetryCount(prev => prev + 1)
          setTimeout(() => {
            fetchData()
          }, retry.delay ?? 1000)
          return
        }
      }

      setLoading(false)
    } finally {
      if (!(retry.enabled && retryCount < (retry.maxAttempts ?? 3))) {
        setLoading(false)
      }
    }
  }, [fetchFn, onSuccess, onError, retry, retryCount])

  const refetch = useCallback(async () => {
    setRetryCount(0)
    await fetchData()
  }, [fetchData])

  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setLoading(false)
    setRetryCount(0)
  }, [])

  useEffect(() => {
    if (immediate) {
      fetchData()
    }
  }, [immediate, fetchData])

  return {
    data,
    loading,
    error,
    refetch,
    reset,
  }
}
