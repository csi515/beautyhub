'use client'

import { useCallback } from 'react'

/**
 * 햅틱 피드백 훅
 * 모바일 기기에서 진동 피드백 제공
 */
export function useHapticFeedback() {
  const vibrate = useCallback((pattern: number | number[] = 10) => {
    if (typeof window === 'undefined' || !('vibrate' in navigator)) {
      return
    }

    try {
      navigator.vibrate(pattern)
    } catch (error) {
      // 진동이 지원되지 않거나 차단된 경우 무시
      console.debug('Vibration not supported or blocked:', error)
    }
  }, [])

  const light = useCallback(() => vibrate(10), [vibrate])
  const medium = useCallback(() => vibrate(20), [vibrate])
  const heavy = useCallback(() => vibrate(30), [vibrate])
  const success = useCallback(() => vibrate([10, 50, 10]), [vibrate])
  const error = useCallback(() => vibrate([20, 50, 20, 50, 20]), [vibrate])

  return {
    vibrate,
    light,
    medium,
    heavy,
    success,
    error,
  }
}
