'use client'

/**
 * 햅틱 피드백 훅
 * 모바일 기기의 진동 피드백 제공
 */
export function useHapticFeedback() {
  const vibrate = (pattern: number | number[] = 10) => {
    if (typeof window === 'undefined') return
    if (!('vibrate' in navigator)) return

    try {
      navigator.vibrate(pattern)
    } catch (error) {
      // 진동이 지원되지 않거나 실패한 경우 무시
    }
  }

  const light = () => vibrate(10)
  const medium = () => vibrate(20)
  const heavy = () => vibrate(30)
  const success = () => vibrate([10, 50, 10])
  const error = () => vibrate([20, 50, 20, 50, 20])

  return {
    vibrate,
    light,
    medium,
    heavy,
    success,
    error,
  }
}

