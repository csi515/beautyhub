'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useSwipe } from './useSwipe'

type UseSwipeNavigationOptions = {
  onSwipeRight?: () => void // 사이드바 열기
  onSwipeLeft?: () => void // 사이드바 닫기
  enabled?: boolean
  edgeThreshold?: number // 엣지에서 시작하는 거리 (px)
}

/**
 * 모바일 스와이프 네비게이션 훅
 * 엣지에서 스와이프하여 사이드바 열기/닫기
 */
export function useSwipeNavigation({
  onSwipeRight,
  onSwipeLeft,
  enabled = true,
  edgeThreshold = 20, // 화면 왼쪽 20px 이내에서 시작
}: UseSwipeNavigationOptions = {}) {
  const startXRef = useRef<number>(0)
  const startYRef = useRef<number>(0)
  const isTrackingRef = useRef<boolean>(false)

  const handleSwipeRight = useCallback(() => {
    if (startXRef.current <= edgeThreshold) {
      onSwipeRight?.()
    }
  }, [onSwipeRight, edgeThreshold])

  const handleSwipeLeft = useCallback(() => {
    onSwipeLeft?.()
  }, [onSwipeLeft])

  const { onTouchStart, onTouchEnd } = useSwipe({
    onSwipeRight: handleSwipeRight,
    onSwipeLeft: handleSwipeLeft,
    threshold: 50,
    velocityThreshold: 0.3,
  })

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0]!
        startXRef.current = touch.clientX
        startYRef.current = touch.clientY
        isTrackingRef.current = true
        onTouchStart(e)
      }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      if (isTrackingRef.current) {
        onTouchEnd(e)
        isTrackingRef.current = false
      }
    }

    document.addEventListener('touchstart', handleTouchStart, { passive: true })
    document.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [enabled, onTouchStart, onTouchEnd])

  return {
    startX: startXRef.current,
    startY: startYRef.current,
  }
}
