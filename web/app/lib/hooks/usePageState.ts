'use client'

/**
 * 페이지 상태 통합 관리 훅
 * loading/error/empty 상태 통합 관리
 * StandardPageLayout과 연동
 * 에러 타입별 처리
 */

import { useState, useCallback, useMemo } from 'react'
import { getErrorType } from '@/app/components/common/EnhancedErrorState'

export type ErrorType = 'network' | 'server' | 'not-found' | 'permission' | 'validation' | 'unknown'

export interface UsePageStateReturn {
  loading: boolean
  error: Error | null
  empty: boolean
  errorType: ErrorType
  setLoading: (loading: boolean) => void
  setError: (error: Error | null) => void
  setEmpty: (empty: boolean) => void
  reset: () => void
}

/**
 * 페이지 상태 통합 관리 훅
 * 
 * UX 규칙:
 * - loading: Skeleton UI 표시
 * - error: 재시도 버튼 제공
 * - empty: 액션 버튼 제공
 * 
 * @example
 * const pageState = usePageState()
 * <StandardPageLayout 
 *   loading={pageState.loading}
 *   error={pageState.error}
 *   empty={pageState.empty}
 * >
 */
export function usePageState(initialState?: {
  loading?: boolean
  error?: Error | null
  empty?: boolean
}): UsePageStateReturn {
  const [loading, setLoading] = useState(initialState?.loading ?? false)
  const [error, setError] = useState<Error | null>(initialState?.error ?? null)
  const [empty, setEmpty] = useState(initialState?.empty ?? false)

  const errorType = useMemo<ErrorType>(() => {
    if (!error) return 'unknown'
    return getErrorType(error) as ErrorType
  }, [error])

  const handleSetError = useCallback((newError: Error | null) => {
    setError(newError)
    if (newError) {
      setLoading(false)
      setEmpty(false)
    }
  }, [])

  const handleSetLoading = useCallback((newLoading: boolean) => {
    setLoading(newLoading)
    if (newLoading) {
      setError(null)
    }
  }, [])

  const handleSetEmpty = useCallback((newEmpty: boolean) => {
    setEmpty(newEmpty)
    if (newEmpty) {
      setLoading(false)
      setError(null)
    }
  }, [])

  const reset = useCallback(() => {
    setLoading(false)
    setError(null)
    setEmpty(false)
  }, [])

  return {
    loading,
    error,
    empty,
    errorType,
    setLoading: handleSetLoading,
    setError: handleSetError,
    setEmpty: handleSetEmpty,
    reset,
  }
}
