/**
 * API 요청 취소를 위한 훅
 * Race condition 방지 및 불필요한 요청 취소
 */

import { useRef, useCallback, useEffect } from 'react'

export interface RequestController {
  abort: () => void
  signal: AbortSignal
}

/**
 * 요청 취소를 관리하는 훅
 */
export function useRequestCancellation() {
  const abortControllerRef = useRef<AbortController | null>(null)

  const createController = useCallback((): RequestController => {
    // 이전 요청 취소
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // 새 컨트롤러 생성
    const controller = new AbortController()
    abortControllerRef.current = controller

    return {
      abort: () => controller.abort(),
      signal: controller.signal,
    }
  }, [])

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
  }, [])

  // 컴포넌트 언마운트 시 취소
  useEffect(() => {
    return () => {
      cancel()
    }
  }, [cancel])

  return {
    createController,
    cancel,
  }
}

