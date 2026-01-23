'use client'

/**
 * API 호출 및 로딩 상태 관리 훅
 */

import React, { useState, useCallback } from 'react'

export interface UseApiOptions<T> {
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
  immediate?: boolean
}

export interface UseApiReturn<T, P extends unknown[] = []> {
  data: T | null
  loading: boolean
  error: Error | null
  execute: (...args: P) => Promise<T | undefined>
  reset: () => void
}

/**
 * API 호출 및 상태 관리 훅 (수동 실행)
 * 
 * useApi vs useDataFetching:
 * - useApi: 파라미터를 받는 API 호출, 수동 실행 (execute 호출 필요)
 * - useDataFetching: 파라미터 없는 API 호출, 자동 실행 (immediate 옵션)
 * 
 * 사용 사례:
 * - 파라미터가 필요한 API 호출 (예: getById, search 등)
 * - 사용자 액션에 따라 실행되는 API 호출
 * - 조건부 실행이 필요한 경우
 * 
 * @example
 * // 파라미터가 필요한 경우
 * const { data, loading, error, execute } = useApi(
 *   (id: string) => customersApi.get(id),
 *   { immediate: false }
 * )
 * 
 * useEffect(() => {
 *   if (customerId) {
 *     execute(customerId)
 *   }
 * }, [customerId])
 * 
 * @example
 * // 사용자 액션에 따라 실행
 * const { data, loading, error, execute } = useApi(
 *   (searchQuery: string) => customersApi.search(searchQuery)
 * )
 * 
 * const handleSearch = () => {
 *   execute(searchInput)
 * }
 */
export function useApi<T, P extends unknown[] = []>(
  apiFunction: (...args: P) => Promise<T>,
  options: UseApiOptions<T> = {}
): UseApiReturn<T, P> {
  const { onSuccess, onError, immediate = false } = options

  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(immediate)
  const [error, setError] = useState<Error | null>(null)

  const execute = useCallback(
    async (...args: P): Promise<T | undefined> => {
      try {
        setLoading(true)
        setError(null)
        const result = await apiFunction(...args)
        setData(result)
        onSuccess?.(result)
        return result
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err))
        setError(error)
        onError?.(error)
        throw error
      } finally {
        setLoading(false)
      }
    },
    [apiFunction, onSuccess, onError]
  )

  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setLoading(false)
  }, [])

  return {
    data,
    loading,
    error,
    execute,
    reset,
  }
}

/**
 * 즉시 실행되는 API 호출 훅 (자동 실행)
 * 
 * @deprecated useDataFetching을 사용하세요. useDataFetching이 더 일관된 API와 retry 로직을 제공합니다.
 * 
 * @example
 * // Before
 * const { data, loading, error } = useApiImmediate(
 *   () => customersApi.list(),
 *   [searchQuery] // dependencies
 * )
 * 
 * // After
 * const { data, loading, error } = useDataFetching({
 *   fetchFn: () => customersApi.list(),
 *   immediate: true
 * })
 */
export function useApiImmediate<T>(
  apiFunction: () => Promise<T>,
  deps: React.DependencyList = []
): Omit<UseApiReturn<T>, 'execute' | 'reset'> {
  const { data, loading, error, execute, reset } = useApi(apiFunction, { immediate: true })

  React.useEffect(() => {
    execute()
    return () => reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return { data, loading, error }
}

