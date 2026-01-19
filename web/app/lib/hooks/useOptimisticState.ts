'use client'

import { useOptimisticUpdate } from './useOptimisticUpdate'

type OptimisticUpdateOptions<T> = {
  onSuccess?: (result: T) => void
  onError?: (error: Error) => void
  rollbackOnError?: boolean
}

/**
 * 간단한 Optimistic Update 훅
 * useOptimisticUpdate의 헬퍼 래퍼
 */
export function useOptimisticState<T>(
  initialValue: T,
  updateFn: (value: T) => Promise<T>,
  options: OptimisticUpdateOptions<T> = {}
) {
  return useOptimisticUpdate(
    initialValue,
    async (_current, optimistic) => {
      // Actual update
      return await updateFn(optimistic)
    },
    options
  )
}
